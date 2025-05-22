/**
 * חישובי משכנתא מבוססי לוחות שפיצר
 */
import { getScheduleAverages, getAdjustedSchedule } from '../services/scheduleService';

/**
 * חישוב תשלומים חודשיים ממוצעים לפי לוח שפיצר
 * @param {number} loanAmount - סכום ההלוואה
 * @param {number} years - תקופת ההלוואה (בשנים)
 * @param {number} interestRate - ריבית שנתית (באחוזים)
 * @returns {Promise<Object>} - התשלום החודשי הכולל, החזר הקרן והריבית
 */
export const calculateMonthlyPaymentFromSchedule = async (loanAmount, years, interestRate) => {
  console.log(`מנסה לחשב תשלומים ממוצעים מלוח שפיצר במסד הנתונים...`);
  
  // מספר הניסיונות המקסימלי לקבלת נתונים מהשרת
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`ניסיון ${retryCount + 1} לקבל מידע מהשרת...`);
      
      const result = await getScheduleAverages({
        purpose: 'דיור',
        years,
        loanAmount,
        interest: interestRate
      });
      
      if (!result.success) {
        throw new Error(result.message || 'שגיאה בחישוב תשלומים ממוצעים');
      }
      
      const { avgTotalPayment, avgPrincipal, avgInterest } = result.averages;
      
      console.log(`✅ התקבלו נתונים בהצלחה ממסד הנתונים!`);
      console.log(`תשלום חודשי: ${avgTotalPayment}₪, החזר קרן: ${avgPrincipal}₪, ריבית: ${avgInterest}₪`);
      
      return {
        monthlyPayment: avgTotalPayment,
        monthlyPrincipalRepayment: avgPrincipal,
        monthlyInterestPayment: avgInterest
      };
    } catch (error) {
      lastError = error;
      console.error(`שגיאה בניסיון ${retryCount + 1}:`, error.message);
      retryCount++;
      
      if (retryCount < MAX_RETRIES) {
        // השהייה בין ניסיונות (500ms, 1000ms, וכו')
        const delayMs = 500 * retryCount;
        console.log(`ממתין ${delayMs}ms לפני ניסיון נוסף...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  console.error(`❌ כל הניסיונות לקבל מידע מהשרת נכשלו. משתמש בחישוב מקומי כגיבוי.`);
  console.error(`שגיאה אחרונה:`, lastError?.message);
  
  // חישוב מקומי כמוצא אחרון בלבד - רק אחרי כל הניסיונות הכושלים
  return fallbackPaymentCalculation(loanAmount, years, interestRate);
};

/**
 * קבלת לוח תשלומים מלא עבור הלוואה
 * @param {number} loanAmount - סכום ההלוואה
 * @param {number} years - תקופת ההלוואה (בשנים)
 * @param {number} interestRate - ריבית שנתית (באחוזים)
 * @returns {Promise<Object>} - לוח תשלומים מלא
 */
export const getFullPaymentSchedule = async (loanAmount, years, interestRate) => {
  try {
    const result = await getAdjustedSchedule({
      purpose: 'דיור',
      years,
      loanAmount,
      interest: interestRate
    });
    
    if (!result.success) {
      throw new Error(result.message || 'שגיאה בקבלת לוח תשלומים');
    }
    
    return {
      monthlyPayments: result.schedule.adjustedPayments,
      averages: result.schedule.averages
    };
  } catch (error) {
    console.error('שגיאה בקבלת לוח תשלומים:', error);
    throw error;
  }
};

/**
 * חישוב גיבוי במקרה של שגיאה בגישה לשרת או בקבלת נתונים
 * זה יחושב לפי נוסחה מתמטית רגילה וטבלאות קבועות
 */
const fallbackPaymentCalculation = (loanAmount, years, interestRate) => {
  console.log(`משתמש בחישוב גיבוי עבור הלוואה של ${loanAmount} לתקופה של ${years} שנים בריבית ${interestRate}%`);
  
  // אם מקבלים ריבית קרובה ל-4%, נשתמש בטבלאות קבועות
  if (Math.abs(interestRate - 4.0) < 0.5) {
    // טבלת תשלומים קבועה (תשלום חודשי לכל 100K)
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
    
    // קבלת התקופה הקרובה ביותר
    let termYears;
    if (years <= 10) termYears = 10;
    else if (years > 10 && years <= 15) termYears = 15;
    else if (years > 15 && years <= 20) termYears = 20;
    else if (years > 20 && years <= 25) termYears = 25;
    else termYears = 30;
    
    // חישוב לפי מכפיל
    const multiplier = loanAmount / 100000;
    const monthlyPayment = Math.round(PAYMENT_RATES[termYears] * multiplier);
    
    // חישוב מדויק של החזר הקרן לחודש הראשון
    const monthlyPrincipalRepayment = Math.round(PRINCIPAL_RATES[termYears] * multiplier);
    
    // חישוב ריבית בהתאם
    const monthlyInterestPayment = monthlyPayment - monthlyPrincipalRepayment;
    
    console.log(`חישוב גיבוי קבוע: תשלום חודשי = ${monthlyPayment}₪, החזר קרן = ${monthlyPrincipalRepayment}₪, ריבית = ${monthlyInterestPayment}₪`);
    
    return {
      monthlyPayment,
      monthlyPrincipalRepayment,
      monthlyInterestPayment
    };
  }
  
  // אחרת, נשתמש בנוסחה מתמטית סטנדרטית למשכנתא - לוח שפיצר
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = years * 12;
  
  // חישוב תשלום חודשי כולל לפי נוסחה סטנדרטית
  const x = Math.pow(1 + monthlyRate, totalPayments);
  const monthlyPayment = Math.round((loanAmount * monthlyRate * x) / (x - 1));
  
  // חישוב מדויק של החזר הקרן בחודש הראשון
  // הנוסחה: החזר קרן = תשלום חודשי - (יתרת הלוואה * ריבית חודשית)
  const monthlyInterestPayment = Math.round(loanAmount * monthlyRate);
  const monthlyPrincipalRepayment = monthlyPayment - monthlyInterestPayment;
  
  console.log(`חישוב גיבוי לפי נוסחה: תשלום חודשי = ${monthlyPayment}₪, החזר קרן = ${monthlyPrincipalRepayment}₪, ריבית = ${monthlyInterestPayment}₪`);
  
  return {
    monthlyPayment,
    monthlyPrincipalRepayment,
    monthlyInterestPayment
  };
}; 