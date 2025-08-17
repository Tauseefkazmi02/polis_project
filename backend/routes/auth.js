const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getRow, runQuery } = require('../database/database');

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'polis-secret-key-2024';

// Middleware to validate request
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Register new user
router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    validateRequest
], async (req, res) => {
    try {
        const { username, email, password, full_name, phone, badge_number, department } = req.body;

        // Check if user already exists
        const existingUser = await getRow(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists with this username or email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await runQuery(
            `INSERT INTO users (username, email, password, full_name, phone, badge_number, department, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, full_name, phone, badge_number, department, 'user']
        );

        // Get the created user (without password)
        const newUser = await getRow(
            'SELECT id, username, email, full_name, role, badge_number, department, created_at FROM users WHERE id = ?',
            [result.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
], async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username or email
        const user = await getRow(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Forgot password
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validateRequest
], async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await getRow('SELECT id, username FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // In a real application, you would:
        // 1. Generate a password reset token
        // 2. Send an email with the reset link
        // 3. Store the token in the database with expiration

        // For now, we'll just return a success message
        res.json({
            message: 'If an account with this email exists, a password reset link has been sent'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Password reset request failed' });
    }
});

// Reset password
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest
], async (req, res) => {
    try {
        const { token, new_password } = req.body;

        // In a real application, you would:
        // 1. Verify the reset token
        // 2. Check if it's expired
        // 3. Update the password

        // For now, we'll return a success message
        res.json({
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await getRow(
            'SELECT id, username, email, full_name, phone, role, badge_number, department, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile
router.put('/profile', [
    verifyToken,
    body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    validateRequest
], async (req, res) => {
    try {
        const { full_name, phone } = req.body;

        const result = await runQuery(
            'UPDATE users SET full_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [full_name, phone, req.user.userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get updated user
        const user = await getRow(
            'SELECT id, username, email, full_name, phone, role, badge_number, department, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );

        res.json({
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
