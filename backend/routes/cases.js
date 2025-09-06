const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Get all cases
router.get('/', auth, async (req, res) => {
  try {
    const cases = await Case.findAll();
    res.json(cases);
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Register a new case
router.post('/', [
  auth,
  body('case_number').notEmpty().withMessage('Case number is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('crime_type').notEmpty().withMessage('Crime type is required'),
  body('date_reported').notEmpty().withMessage('Date reported is required')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if case number already exists
    const existingCase = await Case.findByCaseNumber(req.body.case_number);
    if (existingCase) {
      return res.status(409).json({ error: 'Case number already exists' });
    }

    // Add user ID as creator
    const caseData = {
      ...req.body,
      created_by: req.user.id
    };

    // Create new case
    const newCase = await Case.create(caseData);
    res.status(201).json({ 
      message: 'Case registered successfully', 
      case: newCase 
    });
  } catch (err) {
    console.error('Error creating case:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Get case by case number
router.get('/:caseNumber', auth, async (req, res) => {
  try {
    const foundCase = await Case.findByCaseNumber(req.params.caseNumber);
    if (!foundCase) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(foundCase);
  } catch (err) {
    console.error('Error fetching case:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Update case status
router.patch('/:caseNumber/status', auth, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  try {
    const result = await Case.updateStatus(req.params.caseNumber, status);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json({ message: 'Case status updated successfully' });
  } catch (err) {
    console.error('Error updating case status:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
