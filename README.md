# מחשבון השקעות נדל"ן - Apartment Investment Calculator

מחשבון מתקדם להערכת כדאיות השקעות נדל"ן ולתכנון משכנתאות, כולל חישובי תשואה, תזרים מזומנים, והשוואת מסלולי מימון.

## תכונות עיקריות

- חישוב תשואה על השקעות נדל"ן
- תחזית תזרים מזומנים ל-30 שנה
- חישוב תשלומי משכנתא מדויקים מבוססי לוחות שפיצר
- שמירת והשוואת חלופות השקעה
- ויזואליזציה של נתונים באמצעות גרפים ותרשימים

## מבנה הפרויקט

```
apartment-investment-calculator/
├── client/                  # אפליקציית צד לקוח (React)
│   ├── src/                 # קוד המקור של צד הלקוח
│   │   ├── components/      # רכיבי React 
│   │   ├── services/        # שירותים לתקשורת עם ה-API
│   │   └── utils/           # פונקציות עזר וחישובים
│   ├── public/              # קבצים סטטיים
│   └── package.json         # הגדרות והתלויות של צד הלקוח
│
├── server/                  # שרת (Node.js, Express, MongoDB)
│   ├── config/              # הגדרות תצורה
│   ├── controllers/         # בקרים להתנהגות לוגית
│   ├── data/                # קבצי נתונים 
│   ├── models/              # מודלים של MongoDB
│   ├── routes/              # הגדרות נתיבים (routes)
│   ├── middlewares/         # middleware שונים
│   ├── server.js            # קובץ כניסה ראשי של השרת
│   └── import-schedules.js  # סקריפט ליבוא לוחות שפיצר
│
├── schedules_diyur_all.json # קובץ נתוני לוחות שפיצר
├── PROJECT_ARCHITECTURE_GUIDE.md # מדריך ארכיטקטורת הפרויקט המפורט
└── package.json             # הגדרות פרויקט ראשי
```

## התקנה והפעלה

### דרישות מוקדמות

- Node.js v14.x או גרסה חדשה יותר
- MongoDB
- Git

### התקנה

1. שכפל את המאגר:
   ```
   git clone https://github.com/your-username/apartment-investment-calculator.git
   cd apartment-investment-calculator
   ```

2. התקן את התלויות:
   ```
   npm run install:all
   ```

3. הגדר את קובץ הסביבה:
   צור קובץ `.env` בתיקיית `server` עם התוכן הבא:
   ```
   MONGO_URI=mongodb://localhost:27017/apartment-calculator
   PORT=5000
   ```

4. יבא את נתוני לוחות השפיצר:
   ```
   node server/import-schedules.js
   ```

### הפעלה

- פיתוח (צד לקוח ושרת יחד):
  ```
  npm run dev
  ```

- שרת בלבד:
  ```
  npm run server
  ```

- לקוח בלבד:
  ```
  npm run client
  ```

## מידע נוסף

למידע מפורט על ארכיטקטורת הפרויקט, מודלים, וממשקי API, ראה את קובץ [`PROJECT_ARCHITECTURE_GUIDE.md`](./PROJECT_ARCHITECTURE_GUIDE.md).

## רישיון

כל הזכויות שמורות © 2024 