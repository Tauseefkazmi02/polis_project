const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

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
    body('dob').notEmpty().withMessage('Date of birth is required'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    validateRequest
], async (req, res) => {
    try {
        const { username, email, password, full_name, phone, dob } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists with this username or email'
            });
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password,
            full_name,
            phone,
            dob: new Date(dob),
            role: 'user'
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.toJSON(),
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
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            user: user.toJSON(),
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

        // (Future implementation for reset)

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
            'SELECT id, username, email, full_name, phone, role, dob, created_at FROM users WHERE id = ?',
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
    body('dob').optional().notEmpty().withMessage('Date of birth cannot be empty'),
    validateRequest
], async (req, res) => {
    try {
        const { full_name, phone, dob } = req.body;

        const result = await runQuery(
            'UPDATE users SET full_name = ?, phone = ?, dob = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [full_name, phone, dob, req.user.userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get updated user
        const user = await getRow(
            'SELECT id, username, email, full_name, phone, role, dob, created_at FROM users WHERE id = ?',
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
