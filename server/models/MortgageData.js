const mongoose = require('mongoose');

const MortgageDataSchema = new mongoose.Schema({
  term: {
    type: Number,
    required: true,
    enum: [10, 15, 20, 25, 30] // Term in years
  },
  interestRate: {
    type: Number,
    required: true
  },
  paymentPer100k: {
    type: Number,
    required: true
  },
  principalRepaymentPer100k: {
    type: Number,
    required: true 
  },
  interestPaymentPer100k: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index on term and interestRate for efficient lookups
MortgageDataSchema.index({ term: 1, interestRate: 1 }, { unique: true });

module.exports = mongoose.model('MortgageData', MortgageDataSchema); 