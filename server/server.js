const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');
require('dotenv').config();
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// פעולה נוספת - שכפול מחיקת investments
(async () => {
  try {
    // חכה מעט כדי לוודא שההתחברות למונגו הסתיימה
    setTimeout(async () => {
      if (mongoose.connection.readyState === 1) {
        console.log('בדיקה נוספת של קולקציות:');
        const db = mongoose.connection.db;
        
        // בדיקה אם קיימת קולקציית investments
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        if (collectionNames.includes('investments')) {
          console.log('!!! מצאנו קולקציית investments גם לאחר התחברות, מנסים למחוק...');
          
          // נסיון להעתיק נתונים לפני מחיקה
          const docs = await db.collection('investments').find({}).toArray();
          if (docs.length > 0) {
            for (const doc of docs) {
              const { _id, ...data } = doc;
              await db.collection('deals').insertOne(data);
            }
            console.log(`הועתקו ${docs.length} מסמכים`);
          }
          
          // מחיקת הקולקציה
          await db.collection('investments').drop();
          console.log('קולקציית investments נמחקה באופן סופי');
        } else {
          console.log('לא נמצאה קולקציית investments - מצוין!');
        }
      }
    }, 5000);
  } catch (err) {
    console.error('שגיאה בניקוי סופי:', err);
  }
})();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/calculations', require('./routes/calculations'));
app.use('/api/mortgage-data', require('./routes/mortgageData'));
app.use('/api/deals', require('./routes/deals'));

// Serve mortgage data CSV files
app.use('/mortgage-data', express.static(path.join(__dirname, 'data')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running',
    dbConnected: mongoose.connection.readyState === 1, // 1 = connected
    dbHost: mongoose.connection.host
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 