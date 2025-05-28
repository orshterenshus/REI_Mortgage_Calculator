const express = require('express');
const router = express.Router();
const {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  calculateDeal
} = require('../controllers/calculationController');
const mongoose = require('mongoose');

// @desc    Get all deals
// @route   GET /api/calculations
// @access  Public (for now)
router.get('/', getDeals);

// @desc    Get single deal
// @route   GET /api/calculations/:id
// @access  Public (for now)
router.get('/:id', getDealById);

// @desc    Create new deal
// @route   POST /api/calculations
// @access  Public (for now)
router.post('/', createDeal);

// @desc    Update deal
// @route   PUT /api/calculations/:id
// @access  Public (for now)
router.put('/:id', updateDeal);

// @desc    Delete deal
// @route   DELETE /api/calculations/:id
// @access  Public (for now)
router.delete('/:id', deleteDeal);

// @desc    Calculate deal metrics
// @route   POST /api/calculations/calculate
// @access  Public (for now)
router.post('/calculate', calculateDeal);

// @desc    Check MongoDB connection
// @route   GET /api/calculations/db-status
// @access  Public
router.get('/db-status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  
  let status;
  switch (dbState) {
    case 0:
      status = 'disconnected';
      break;
    case 1:
      status = 'connected';
      break;
    case 2:
      status = 'connecting';
      break;
    case 3:
      status = 'disconnecting';
      break;
    default:
      status = 'unknown';
  }
  
  res.json({
    readyState: dbState,
    status,
    connectedTo: mongoose.connection.host || 'no connection',
    dbName: mongoose.connection.name || 'no connection'
  });
});

module.exports = router; 