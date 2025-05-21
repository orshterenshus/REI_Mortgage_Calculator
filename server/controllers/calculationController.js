const Deal = require('../models/Deal');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); // Will need to add this package to dependencies
const MortgageData = require('../models/MortgageData');

// Get all deals
const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find();
    res.status(200).json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single deal by ID
const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    res.status(200).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new deal
const createDeal = async (req, res) => {
  try {
    console.log('Creating new deal in the deals collection');
    const deal = new Deal(req.body);
    console.log('Model collection name:', Deal.collection.name);
    const savedDeal = await deal.save();
    res.status(201).json(savedDeal);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update deal
const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    res.status(200).json(deal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete deal
const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    res.status(200).json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to load mortgage data - to be used for future server-side calculations
const loadMortgageDataFromCSV = (term) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, '..', 'data', `mortgage_data_${term}.csv`);
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Server-side calculation function - will be expanded in the future
const calculateDeal = async (req, res) => {
  try {
    // This function will be enhanced to perform calculations on the server
    // For now, we'll just return the input data
    res.status(200).json({
      message: 'Server-side calculation is not yet implemented',
      inputs: req.body,
      // Future placeholder for calculation results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to import mortgage data from CSV to MongoDB
const importMortgageDataFromCSV = async (termYears) => {
  const csvParser = require('csv-parser');
  
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(__dirname, '..', 'data', `mortgage_data_${termYears}.csv`);
    
    if (!fs.existsSync(csvPath)) {
      return reject(new Error(`CSV file not found: ${csvPath}`));
    }
    
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (data) => {
        // Parse data from CSV
        const interestRate = parseFloat(data.interestRate || data.interest_rate || Object.values(data)[0]);
        const paymentPer100k = parseFloat(data.paymentPer100k || data.payment_per_100k || Object.values(data)[1]);
        
        // Skip invalid data
        if (isNaN(interestRate) || isNaN(paymentPer100k)) {
          console.warn(`Skipping invalid data: ${JSON.stringify(data)}`);
          return;
        }
        
        // Estimate principal and interest payments based on term
        // These are approximate values based on standard amortization
        let principalRepaymentPer100k, interestPaymentPer100k;
        
        switch (termYears) {
          case 10:
            principalRepaymentPer100k = 679;
            interestPaymentPer100k = 333;
            break;
          case 15:
            principalRepaymentPer100k = 400;
            interestPaymentPer100k = 350;
            break;
          case 20:
            principalRepaymentPer100k = 261;
            interestPaymentPer100k = 367;
            break;
          case 25:
            principalRepaymentPer100k = 178;
            interestPaymentPer100k = 383;
            break;
          case 30:
            principalRepaymentPer100k = 125;
            interestPaymentPer100k = 400;
            break;
          default:
            principalRepaymentPer100k = 200;
            interestPaymentPer100k = 350;
        }
        
        results.push({
          term: termYears,
          interestRate,
          paymentPer100k,
          principalRepaymentPer100k,
          interestPaymentPer100k
        });
      })
      .on('end', async () => {
        try {
          console.log(`Parsed ${results.length} records from CSV for ${termYears} year term`);
          
          // Insert data into MongoDB
          for (const record of results) {
            await MortgageData.findOneAndUpdate(
              { term: record.term, interestRate: record.interestRate },
              record,
              { upsert: true, new: true }
            );
          }
          
          console.log(`Imported ${results.length} records to MongoDB for ${termYears} year term`);
          resolve(results);
        } catch (error) {
          console.error(`Error saving to MongoDB: ${error.message}`);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error(`Error reading CSV: ${error.message}`);
        reject(error);
      });
  });
};

module.exports = {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  calculateDeal,
  importMortgageDataFromCSV,
  // For backward compatibility
  getInvestments: getDeals,
  getInvestmentById: getDealById,
  createInvestment: createDeal,
  updateInvestment: updateDeal,
  deleteInvestment: deleteDeal,
  calculateInvestment: calculateDeal
}; 