/**
 * סקריפט ליבוא לוחות שפיצר מקובץ JSON למסד נתונים
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// טעינת מודל Schedule
const Schedule = require('./models/Schedule');

// פונקציה להתחברות למסד הנתונים
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/apartment-calculator', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('התחברות למסד הנתונים הושלמה בהצלחה');
  } catch (error) {
    console.error('שגיאה בהתחברות למסד הנתונים:', error);
    process.exit(1);
  }
};

// פונקציה ליבוא נתונים מקובץ JSON
const importSchedules = async () => {
  try {
    // קריאת קובץ JSON
    const filePath = path.join(__dirname, '..', 'schedules_diyur_all.json');
    console.log(`מנסה לקרוא קובץ: ${filePath}`);
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const schedules = JSON.parse(jsonData);

    console.log(`נמצאו ${schedules.length} לוחות שפיצר בקובץ`);
    
    // מחיקת כל הנתונים הקיימים
    console.log('מוחק את כל הלוחות הקיימים...');
    await Schedule.deleteMany({});

    // יבוא הנתונים למסד הנתונים - פשוט יותר
    console.log('מתחיל ביבוא הנתונים...');
    
    // בדיקת שם הקולקציה
    const collName = Schedule.collection.name;
    console.log(`שם הקולקציה שישמש: ${collName}`);
    
    try {
      // מבצע יבוא בשיטת insertMany
      const result = await Schedule.insertMany(schedules, { ordered: false });
      console.log(`הוספו ${result.length} רשומות בהצלחה`);
    } catch (bulkError) {
      // ייתכן שחלק מהרשומות נוספו
      if (bulkError.insertedDocs && bulkError.insertedDocs.length) {
        console.log(`הוספו ${bulkError.insertedDocs.length} רשומות חלקית`);
      } else {
        throw bulkError;
      }
    }
    
    // בדיקה כמה רשומות יש במסד עכשיו
    const count = await Schedule.countDocuments();
    console.log(`כעת יש ${count} לוחות שפיצר במסד הנתונים`);

    if (count === 0) {
      console.error('!!! אזהרה: אין לוחות שפיצר במסד הנתונים !!!');
      
      // נסיון להוסיף לוח אחד לפחות
      const sampleSchedule = {
        purpose: "דיור",
        years: 30,
        interest: 4.0,
        loanAmount: 100000,
        monthlyPayments: [
          { month: 1, totalPayment: 500, principal: 125, interest: 375, remainingPrincipal: 99875 },
          { month: 2, totalPayment: 500, principal: 126, interest: 374, remainingPrincipal: 99749 }
        ]
      };
      
      const newSchedule = new Schedule(sampleSchedule);
      await newSchedule.save();
      console.log('נוסף לוח דוגמה אחד למסד הנתונים');
    }
  } catch (error) {
    console.error('שגיאה ביבוא לוחות שפיצר:', error);
  }
};

// הרצת הסקריפט
(async () => {
  console.log('מתחיל ביבוא לוחות שפיצר למסד הנתונים...');
  await connectDB();
  await importSchedules();
  console.log('הסקריפט הסתיים');
})(); 