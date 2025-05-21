/**
 * פתרון אגרסיבי לבעיית קולקציות - קובץ חד פעמי
 * 
 * מטרה: מחיקה מוחלטת של קולקציית 'investments' ווידוא שימוש בקולקציית 'deals' בלבד
 */

const mongoose = require('mongoose');
require('dotenv').config();

// התחברות למונגו
async function connectAndFix() {
  try {
    console.log('מתחבר למסד נתונים...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/apartment-calculator', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ מחובר למונגו: ${mongoose.connection.host}`);
    
    // קבלת מידע על כל הקולקציות
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('=== קולקציות במערכת ===');
    console.log(collectionNames.join(', '));
    
    // טיפול בקולקציות 
    if (collectionNames.includes('investments')) {
      console.log('\n🛑 נמצאה קולקציית investments - מתחיל תיקון...');
      
      // שלב 1: וידוא קיום קולקציית deals
      if (!collectionNames.includes('deals')) {
        console.log('יוצר קולקציית deals חדשה...');
        await db.createCollection('deals');
      }
      
      // שלב 2: העתקת כל הנתונים
      console.log('מעתיק נתונים מ-investments ל-deals...');
      const docs = await db.collection('investments').find({}).toArray();
      
      console.log(`נמצאו ${docs.length} מסמכים להעתקה`);
      let copiedCount = 0;
      
      for (const doc of docs) {
        // הסרת מזהה
        const { _id, ...data } = doc;
        
        // הוספה לקולקציית deals
        await db.collection('deals').insertOne(data);
        copiedCount++;
      }
      
      console.log(`✅ הועתקו ${copiedCount} מסמכים בהצלחה`);
      
      // שלב 3: מחיקת קולקציית investments
      console.log('מוחק את קולקציית investments...');
      await db.dropCollection('investments');
      
      console.log('✅ קולקציית investments נמחקה בהצלחה');
    } else {
      console.log('\n✅ קולקציית investments לא קיימת - אין צורך בתיקון');
    }
    
    // בדיקה סופית
    const updatedCollections = await db.listCollections().toArray();
    const updatedNames = updatedCollections.map(c => c.name);
    
    console.log('\n=== קולקציות לאחר תיקון ===');
    console.log(updatedNames.join(', '));
    
    // הודעת סיום
    if (updatedNames.includes('deals') && !updatedNames.includes('investments')) {
      console.log('\n✅✅✅ התיקון הושלם בהצלחה!');
      console.log('המערכת מוכנה לשימוש בקולקציית deals בלבד');
    } else {
      console.log('\n⚠️ התיקון לא הושלם באופן מלא - בדוק את הקולקציות במערכת');
    }
    
  } catch (error) {
    console.error('⛔ שגיאה בתיקון:', error.message);
  } finally {
    // סגירת החיבור למסד הנתונים
    await mongoose.connection.close();
    console.log('\nהחיבור למסד הנתונים נסגר');
    process.exit(0);
  }
}

// הרצת התיקון
console.log('=== כלי לטיפול בקולקציות מונגו DB ===');
connectAndFix(); 