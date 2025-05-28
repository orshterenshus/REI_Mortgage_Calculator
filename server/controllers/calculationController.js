const Deal = require('../models/Deal');

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

module.exports = {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  calculateDeal
}; 