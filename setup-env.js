const fs = require('fs');
const path = require('path');

// יצירת קובץ .env בתיקיית השרת
const envContent = `PORT=5000
MONGO_URI=mongodb+srv://or803803:Aa123456@mortgageapp.y0bkyzu.mongodb.net/mortgageApp
NODE_ENV=development`;

const serverEnvPath = path.join(__dirname, 'server', '.env');

try {
  fs.writeFileSync(serverEnvPath, envContent);
  console.log('קובץ .env נוצר בהצלחה בתיקיית השרת');
} catch (error) {
  console.error('שגיאה ביצירת קובץ .env:', error);
} 