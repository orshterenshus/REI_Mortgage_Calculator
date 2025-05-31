const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function migrateUserSchema() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://or803803:Aa123456@mortgageapp.y0bkyzu.mongodb.net/mortgageApp';
    console.log("Connecting to DB...");
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Step 1: Drop the old username index
    console.log("Dropping old username index...");
    try {
      await mongoose.connection.db.collection('users').dropIndex('username_1');
      console.log("Username index dropped successfully");
    } catch (error) {
      if (error.code === 27) {
        console.log("Username index doesn't exist, skipping...");
      } else {
        console.log("Error dropping index:", error.message);
      }
    }

    // Step 2: Update existing users
    console.log("Updating existing users...");
    const existingUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    
    for (const user of existingUsers) {
      const updateData = {};
      
      // Create fullName from firstName and lastName if they exist
      if (user.firstName || user.lastName) {
        updateData.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      } else if (!user.fullName) {
        // Fallback to email if no name data exists
        updateData.fullName = user.email.split('@')[0];
      }
      
      // Remove old fields
      const unsetData = {};
      if (user.username !== undefined) unsetData.username = "";
      if (user.firstName !== undefined) unsetData.firstName = "";
      if (user.lastName !== undefined) unsetData.lastName = "";
      
      // Update the user
      const updateOperation = {};
      if (Object.keys(updateData).length > 0) updateOperation.$set = updateData;
      if (Object.keys(unsetData).length > 0) updateOperation.$unset = unsetData;
      
      if (Object.keys(updateOperation).length > 0) {
        await mongoose.connection.db.collection('users').updateOne(
          { _id: user._id },
          updateOperation
        );
        console.log(`Updated user: ${user.email} -> fullName: "${updateData.fullName || user.fullName}"`);
      }
    }

    console.log("Migration completed successfully!");
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateUserSchema(); 