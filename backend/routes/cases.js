const express = require('express');
const router = express.Router();
const Case = require('../models/Case');

// Register a new case
router.post('/', async (req, res) => {
  const { caseNumber, description, status, reporter } = req.body;
  if (!caseNumber || !description || !status || !reporter) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const existingCase = await Case.findOne({ caseNumber });
    if (existingCase) {
      return res.status(409).json({ error: 'Case number already exists' });
    }
    const newCase = new Case({ caseNumber, description, status, reporter });
    await newCase.save();
    res.status(201).json({ message: 'Case registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get case by case number
router.get('/:caseNumber', async (req, res) => {
  const caseNumber = req.params.caseNumber;
  try {
    const foundCase = await Case.findOne({ caseNumber });
    if (!foundCase) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(foundCase);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
