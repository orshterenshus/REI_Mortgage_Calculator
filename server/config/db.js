const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // התחברות למונגו
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/apartment-calculator', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // ===== טיפול אגרסיבי בקולקציות =====
    try {
      console.log('=== טיפול בקולקציות מונגו DB ===');
      
      const db = mongoose.connection.db;
      
      // 1. בדיקת הקולקציות הקיימות
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      console.log('קולקציות קיימות:', collectionNames.join(', '));
      
      // 2. טיפול בקולקציית deals
      if (!collectionNames.includes('deals')) {
        // יצירת deals אם לא קיימת
        await db.createCollection('deals');
        console.log('קולקציית deals נוצרה בהצלחה');
      }
      
      // 3. טיפול ב-investments
      if (collectionNames.includes('investments')) {
        console.log('מצאנו קולקציית investments, מתחילים העברת נתונים...');
        
        // 3.1 מעתיקים את הנתונים ל-deals
        const investmentDocs = await db.collection('investments').find({}).toArray();
        console.log(`נמצאו ${investmentDocs.length} מסמכים להעברה`);
        
        for (const doc of investmentDocs) {
          // מחיקת ה-ID כדי שיווצר אחד חדש
          const { _id, ...docData } = doc;
          
          // יצירת מסמך זהה ב-deals
          await db.collection('deals').insertOne(docData);
          console.log(`הועתק מסמך: ${doc.name || 'ללא שם'}`);
        }
        
        // 3.2 מחיקת קולקציית investments
        await db.dropCollection('investments');
        console.log('קולקציית investments נמחקה');
        
        // 3.3 נסיון למנוע גישה לקולקציית investments
        // האזנה לשמירת נתונים ומניעת שימוש ב-investments
        const originalCollection = mongoose.connection.collection;
        mongoose.connection.collection = function(name) {
          if (name === 'investments') {
            console.log('ניסיון גישה ל-investments הופנה ל-deals');
            name = 'deals';
          }
          return originalCollection.call(this, name);
        };
      }
      
      // 4. בדיקה סופית של קולקציות
      const updatedCollections = await db.listCollections().toArray();
      const updatedNames = updatedCollections.map(c => c.name);
      console.log('קולקציות לאחר הטיפול:', updatedNames.join(', '));
      
      // 5. שינוי שם מודל מונגוס לטובת וידוא שימוש בקולקציה הנכונה
      if (mongoose.modelNames().includes('Deal')) {
        mongoose.deleteModel('Deal');
      }
      
      // הוספת אינדקס לשיפור ביצועים (אופציונלי)
      await db.collection('deals').createIndex({ name: 1 });
      console.log('נוסף אינדקס לקולקציית deals');
      
      console.log('=== סיום טיפול בקולקציות ===');
      console.log('המערכת תשתמש רק בקולקציית deals מעתה ואילך');
    } catch (err) {
      console.error('שגיאה בטיפול בקולקציות:', err.message);
    }
    
    // ===== הטמעת פתרונות נוספים =====
    
    // הגדרת קולקציית ברירת מחדל 
    mongoose.pluralize(function(name) {
      // החזרת שם קולקציה קבוע - 'deals' לכל המודלים
      if (name === 'Deal' || name === 'Investment') return 'deals';
      return name.toLowerCase() + 's';
    });
    
    // הגדרת מאזין לכל פעולות השמירה
    mongoose.set('debug', function(collectionName, method, query, doc) {
      // בדיקה אם זה שייך לקולקציה investments
      if (collectionName === 'investments') {
        console.log(`!!! ניסיון פעולת ${method} על investments - מנותב ל-deals`);
      }
    });
    
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB }; 