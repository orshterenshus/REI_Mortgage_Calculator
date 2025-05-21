const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Deal = require('../models/Deal');

// שמירת חישוב חדש
router.post('/', async (req, res) => {
  try {
    const deal = new Deal(req.body);
    const savedDeal = await deal.save();
    res.status(201).json(savedDeal);
  } catch (error) {
    console.error('Error saving deal:', error);
    res.status(400).json({ message: error.message });
  }
});

// קבלת כל החישובים
router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });
    res.status(200).json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// קבלת חישוב ספציפי לפי ID
router.get('/:id', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.status(200).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// מחיקת חישוב
router.delete('/:id', async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.status(200).json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 