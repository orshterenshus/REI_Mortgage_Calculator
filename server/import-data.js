const { connectDB } = require('./config/db');
const { importMortgageDataFromCSV } = require('./controllers/calculationController');
require('dotenv').config();

// Connect to MongoDB
connectDB().then(async () => {
  console.log('Connected to MongoDB, importing data...');
  
  try {
    // Import data for all terms
    const terms = [10, 15, 20, 25, 30];
    const promises = terms.map(term => importMortgageDataFromCSV(term));
    
    // Wait for all imports to complete
    await Promise.all(promises);
    
    console.log('All mortgage data imported successfully!');
    
    // Optionally exit after import is done
    // process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}); 