const fs = require('fs');
const path = require('path');

// פונקציה ליצירת תיקייה אם היא לא קיימת
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// פונקציה להעתקת תיקייה עם כל הקבצים שלה
function copyDirectory(source, target) {
  ensureDirectoryExists(target);
  
  // קריאת רשימת הקבצים והתיקיות בתיקיית המקור
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  let successCount = 0;
  let errorCount = 0;
  
  // העתקת כל הקבצים והתיקיות
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory()) {
      // אם זו תיקייה, קריאה רקורסיבית
      const result = copyDirectory(sourcePath, targetPath);
      successCount += result.successCount;
      errorCount += result.errorCount;
    } else {
      // אם זה קובץ, העתקה
      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✓ Copied ${sourcePath} to ${targetPath}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error copying ${sourcePath}: ${error.message}`);
        errorCount++;
      }
    }
  }
  
  return { successCount, errorCount };
}

// הגדרת נתיבים מקור ויעד
const sourceDir = path.join(__dirname, 'src');
const targetDir = path.join(__dirname, 'client', 'src');

console.log('=== העתקת קבצי המקור מהתיקייה הישנה לתיקייה החדשה ===');
console.log(`נתיב מקור: ${sourceDir}`);
console.log(`נתיב יעד: ${targetDir}`);

// העתקת כל הקבצים והתיקיות
const result = copyDirectory(sourceDir, targetDir);

// מחיקת App.js (אם קיים) כי אנחנו משתמשים ב-App.jsx
const appJsPath = path.join(targetDir, 'App.js');
if (fs.existsSync(appJsPath)) {
  try {
    fs.unlinkSync(appJsPath);
    console.log(`✓ Deleted ${appJsPath}`);
  } catch (error) {
    console.error(`✗ Error deleting ${appJsPath}: ${error.message}`);
  }
}

// עדכון קובץ index.js
const indexJsPath = path.join(targetDir, 'index.js');
if (fs.existsSync(indexJsPath)) {
  try {
    const updatedContent = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
    
    fs.writeFileSync(indexJsPath, updatedContent);
    console.log(`✓ Updated ${indexJsPath}`);
  } catch (error) {
    console.error(`✗ Error updating ${indexJsPath}: ${error.message}`);
  }
}

// הצגת סיכום
console.log(`\n=== סיום העתקת קבצים ===`);
console.log(`✓ ${result.successCount} קבצים הועתקו בהצלחה`);
console.log(`✗ ${result.errorCount} שגיאות`);
console.log('\nהמחשבון מוכן להפעלה!');
console.log('הרץ את הפקודה: .\\start-dev.ps1 או npm run dev:win'); 