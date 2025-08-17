const express = require('express');
const router = express.Router();

// Mock admin dashboard data
router.get('/dashboard', (req, res) => {
  const dashboardData = {
    totalUsers: 100,
    totalCases: 50,
    totalDocuments: 75,
    activeCases: 20
  };
  res.json(dashboardData);
});

module.exports = router;
