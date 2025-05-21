const express = require('express');
const router = express.Router();
const MortgageData = require('../models/MortgageData');

// @desc    Get mortgage data for specific term and interest rate
// @route   GET /api/mortgage-data/:term/:rate
// @access  Public
router.get('/:term/:rate', async (req, res) => {
  try {
    const { term, rate } = req.params;
    
    // Convert strings to numbers
    const termYears = parseInt(term);
    const interestRate = parseFloat(rate);
    
    // Validation
    if (isNaN(termYears) || isNaN(interestRate)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid parameters: term must be a number in years, rate must be a decimal' 
      });
    }
    
    // Find exact match or closest match
    const mortgageData = await MortgageData.findOne({
      term: termYears,
      interestRate: interestRate
    });
    
    if (mortgageData) {
      return res.json({
        success: true,
        data: mortgageData
      });
    }
    
    // If no exact match, find closest interest rate for the term
    const allRatesForTerm = await MortgageData.find({ term: termYears }).sort({ interestRate: 1 });
    
    if (allRatesForTerm.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No mortgage data found for ${termYears} year term`
      });
    }
    
    // Find closest rate
    let closestData = allRatesForTerm[0];
    let minDiff = Math.abs(allRatesForTerm[0].interestRate - interestRate);
    
    for (let i = 1; i < allRatesForTerm.length; i++) {
      const diff = Math.abs(allRatesForTerm[i].interestRate - interestRate);
      if (diff < minDiff) {
        minDiff = diff;
        closestData = allRatesForTerm[i];
      }
    }
    
    return res.json({
      success: true,
      data: closestData,
      note: 'Using closest available interest rate'
    });
    
  } catch (error) {
    console.error('Error retrieving mortgage data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error retrieving mortgage data' 
    });
  }
});

// @desc    Get all mortgage data for a specific term
// @route   GET /api/mortgage-data/:term
// @access  Public
router.get('/:term', async (req, res) => {
  try {
    const { term } = req.params;
    
    // Convert string to number
    const termYears = parseInt(term);
    
    // Validation
    if (isNaN(termYears)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid parameter: term must be a number in years' 
      });
    }
    
    // Find all data for the term
    const mortgageData = await MortgageData.find({ term: termYears }).sort({ interestRate: 1 });
    
    if (mortgageData.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No mortgage data found for ${termYears} year term`
      });
    }
    
    return res.json({
      success: true,
      count: mortgageData.length,
      data: mortgageData
    });
    
  } catch (error) {
    console.error('Error retrieving mortgage data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error retrieving mortgage data' 
    });
  }
});

// @desc    Batch import mortgage data from CSV
// @route   POST /api/mortgage-data/import
// @access  Public (for now, should be Admin only in production)
router.post('/import', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format. Expected array of mortgage data entries'
      });
    }
    
    // Create operation options
    const options = { 
      upsert: true, // Create if not exists
      new: true, // Return updated document
      setDefaultsOnInsert: true // Apply schema defaults if creating new document
    };
    
    // Process each record
    const results = [];
    
    for (const record of data) {
      // Basic validation
      if (!record.term || !record.interestRate || !record.paymentPer100k) {
        results.push({
          success: false,
          error: 'Missing required fields',
          record
        });
        continue;
      }
      
      try {
        // Find and update or create new
        const mortgageData = await MortgageData.findOneAndUpdate(
          { term: record.term, interestRate: record.interestRate },
          record,
          options
        );
        
        results.push({
          success: true,
          data: mortgageData
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          record
        });
      }
    }
    
    // Count successes and failures
    const successes = results.filter(r => r.success).length;
    const failures = results.length - successes;
    
    return res.status(201).json({
      success: true,
      message: `Imported ${successes} records successfully, ${failures} failures`,
      results
    });
    
  } catch (error) {
    console.error('Error importing mortgage data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error importing mortgage data' 
    });
  }
});

module.exports = router; 