const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/apartment-calculator', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Aggressive collection handling
    try {
      console.log('=== MongoDB Collection Handling ===');
      const db = mongoose.connection.db;
      // 1. List existing collections
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      console.log('Existing collections:', collectionNames.join(', '));
      
      // 2. Handle deals collection
      if (!collectionNames.includes('deals')) {
        await db.createCollection('deals');
        console.log('deals collection created successfully');
      }
      
      // 4. Final check of collections
      const updatedCollections = await db.listCollections().toArray();
      const updatedNames = updatedCollections.map(c => c.name);
      console.log('Collections after handling:', updatedNames.join(', '));
      
      // (Optional) Add index for performance improvement
      await db.collection('deals').createIndex({ name: 1 });
      console.log('Added index to deals collection');
      
      console.log('=== Finished handling collections ===');
      console.log('The system will now use only deals collection from now on');
    } catch (err) {
      console.error('Error handling collections:', err.message);
    }
    
    // ===== Implement additional solutions =====
    
    // Set default pluralization
    mongoose.pluralize(function(name) {
      if (name === 'Deal') return 'deals';
      return name.toLowerCase() + 's';
    });
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = { connectDB }; 