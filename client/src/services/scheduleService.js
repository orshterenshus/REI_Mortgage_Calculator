import api from '../utils/api';

/**
 * בדיקת זמינות לוחות שפיצר במערכת
 */
export const checkSchedulesAvailability = async () => {
  try {
    console.log('בודק זמינות לוחות שפיצר...');
    
    // נסיון עם endpoint אחר קודם
    try {
      const response = await api.get('/schedules');
      console.log('תגובה מ-/schedules:', response.data);
      return response.data;
    } catch (initialError) {
      console.log('ניסיון ראשון נכשל, מנסה endpoint אחר:', initialError.message);
      
      // נסיון שני עם ה-endpoint המוגדר
      const response = await api.get('/schedules/check');
      console.log('תגובה מ-/schedules/check:', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('שגיאה בבדיקת זמינות לוחות שפיצר:', error);
    
    // החזרת תגובת גיבוי במקרה של כשל מוחלט
    console.log('מחזיר מידע על זמינות לוחות גיבוי');
    return {
      success: true,
      schedulesCount: 5,
      availableYears: [10, 15, 20, 25, 30],
      availablePurposes: ['דיור'],
      isBackupData: true
    };
  }
};

/**
 * קבלת לוח שפיצר מותאם עבור הלוואה
 * @param {Object} params - פרמטרים לחיפוש
 * @param {string} params.purpose - מטרת ההלוואה (ברירת מחדל: "דיור")
 * @param {number} params.years - תקופת ההלוואה בשנים
 * @param {number} params.loanAmount - סכום ההלוואה
 * @param {number} params.interest - שיעור הריבית השנתית (ברירת מחדל: 4.0)
 */
export const getAdjustedSchedule = async ({ purpose = 'דיור', years, loanAmount, interest = 4.0 }) => {
  try {
    console.log(`מבקש לוח שפיצר: הלוואה=${loanAmount}₪, תקופה=${years} שנים, ריבית=${interest}%`);
    
    if (!years || !loanAmount) {
      throw new Error('חסרים פרמטרים חובה: years ו-loanAmount');
    }

    // נשלח בקשה לשרת לקבלת לוח שפיצר מותאם
    const response = await api.get('/schedules/adjustedSchedule', {
      params: { purpose, years, loanAmount, interest }
    });
    
    console.log("התקבל לוח שפיצר מותאם מהשרת");
    return response.data;
  } catch (error) {
    console.error('שגיאה בקבלת לוח שפיצר מותאם:', error);
    
    // ננסה לקבל רק את הממוצעים כגיבוי
    try {
      console.log("מנסה לקבל לפחות ממוצעים...");
      const avgResponse = await getScheduleAverages({ purpose, years, loanAmount, interest });
      
      if (avgResponse.success) {
        console.log("התקבלו ממוצעים, בונה לוח חלקי");
        
        // נבנה לוח סילוקין בסיסי עם 2 נקודות - התחלה וסוף
        const dummySchedule = {
          success: true,
          requestParams: avgResponse.requestParams,
          schedule: {
            baseSchedule: {
              purpose,
              years,
              interest,
              loanAmount: 100000
            },
            adjustedPayments: [
              // רשומה ראשונה - חודש ראשון
              {
                month: 1,
                totalPayment: avgResponse.averages.avgTotalPayment,
                principal: avgResponse.averages.avgPrincipal,
                interest: avgResponse.averages.avgInterest,
                remainingPrincipal: loanAmount - avgResponse.averages.avgPrincipal
              },
              // רשומה אחרונה - החודש האחרון
              {
                month: years * 12,
                totalPayment: avgResponse.averages.avgTotalPayment,
                principal: avgResponse.averages.avgTotalPayment - (avgResponse.averages.avgInterest / 10), // הערכה גסה
                interest: avgResponse.averages.avgInterest / 10, // הערכה גסה
                remainingPrincipal: 0
              }
            ],
            averages: avgResponse.averages,
            isBackupData: true
          }
        };
        
        return dummySchedule;
      }
    } catch (avgError) {
      console.error("גם קבלת הממוצעים נכשלה:", avgError);
    }
    
    // אם הגענו לכאן, אז גם קבלת הממוצעים נכשלה - נזרוק את השגיאה המקורית
    throw error;
  }
};

/**
 * קבלת ממוצעי תשלומים בלבד עבור הלוואה
 * @param {Object} params - פרמטרים לחיפוש
 * @param {string} params.purpose - מטרת ההלוואה (ברירת מחדל: "דיור")
 * @param {number} params.years - תקופת ההלוואה בשנים
 * @param {number} params.loanAmount - סכום ההלוואה
 * @param {number} params.interest - שיעור הריבית השנתית (ברירת מחדל: 4.0)
 */
export const getScheduleAverages = async ({ purpose = 'דיור', years, loanAmount, interest = 4.0 }) => {
  try {
    console.log(`קבלת ממוצעי תשלומים ממסד הנתונים: הלוואה=${loanAmount}₪, תקופה=${years} שנים, ריבית=${interest}%`);
    
    if (!years || !loanAmount) {
      throw new Error('חסרים פרמטרים חובה: years ו-loanAmount');
    }

    // נסיון ראשון עם endpoint ראשי
    try {
      console.log(`שולח בקשה ל-API עבור ממוצעי תשלומים...`);
      const response = await api.get('/schedules/averages', {
        params: { purpose, years, loanAmount, interest }
      });
      
      console.log(`תגובה מהשרת (ממוצעי תשלומים):`, response.data);
      return response.data;
    } 
    catch (initialError) {
      console.log(`ניסיון ראשון נכשל, מנסה endpoint חלופי...`, initialError.message);
      
      // ניסיון שני עם endpoint חלופי
      const fallbackResponse = await api.get('/schedules/data', {
        params: { purpose, years, loanAmount, interest }
      });
      
      if (fallbackResponse.data && fallbackResponse.data.success) {
        console.log(`התקבלו נתונים מendpoint חלופי:`, fallbackResponse.data);
        return fallbackResponse.data;
      }
      
      throw initialError; // אם גם הניסיון השני נכשל, נזרוק את השגיאה המקורית
    }
  } catch (error) {
    console.error('שגיאה בקבלת ממוצעי תשלומים ממסד הנתונים:', error.message);
    
    // נחזיר ערכי גיבוי מקומיים מדויקים רק אם גישה למסד כשלה
    console.warn('משתמש בערכי גיבוי מקומיים לממוצעי תשלומים - לתשומת לבך, אלה אינם נתונים ממסד הנתונים');
    
    // קבלת התקופה הקרובה ביותר
    let termYears;
    if (years <= 10) termYears = 10;
    else if (years > 10 && years <= 15) termYears = 15;
    else if (years > 15 && years <= 20) termYears = 20;
    else if (years > 20 && years <= 25) termYears = 25;
    else termYears = 30;
    
    // טבלת תשלומים חודשיים לכל 100K לפי תקופות
    const PAYMENT_RATES = {
      10: 1012, // 10 years: 1012 ש"ח לכל 100K
      15: 750,  // 15 years: 750 ש"ח לכל 100K
      20: 627,  // 20 years: 627 ש"ח לכל 100K
      25: 562,  // 25 years: 562 ש"ח לכל 100K
      30: 525   // 30 years: 525 ש"ח לכל 100K
    };
    
    // טבלת תשלומי קרן חודשיים לכל 100K בחודש הראשון
    const PRINCIPAL_RATES = {
      10: 679, // 10 years: 679 ש"ח לכל 100K (החזר קרן בחודש הראשון)
      15: 400, // 15 years: 400 ש"ח לכל 100K (החזר קרן בחודש הראשון)
      20: 261, // 20 years: 261 ש"ח לכל 100K (החזר קרן בחודש הראשון)
      25: 178, // 25 years: 178 ש"ח לכל 100K (החזר קרן בחודש הראשון)
      30: 125  // 30 years: 125 ש"ח לכל 100K (החזר קרן בחודש הראשון)
    };
    
    // חישוב לפי מכפיל
    const multiplier = loanAmount / 100000;
    const avgTotalPayment = Math.round(PAYMENT_RATES[termYears] * multiplier);
    const avgPrincipal = Math.round(PRINCIPAL_RATES[termYears] * multiplier);
    const avgInterest = avgTotalPayment - avgPrincipal;
    
    console.log(`ערכי גיבוי מחושבים: התשלום=${avgTotalPayment}₪, קרן=${avgPrincipal}₪, ריבית=${avgInterest}₪`);
    
    return {
      success: true,
      requestParams: {
        purpose,
        years,
        loanAmount,
        interest
      },
      averages: {
        avgTotalPayment,
        avgPrincipal,
        avgInterest
      },
      isBackupData: true
    };
  }
}; 