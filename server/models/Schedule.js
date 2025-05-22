const mongoose = require('mongoose');

// תת-סכמה עבור תשלום חודשי
const monthlyPaymentSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true
  },
  totalPayment: {
    type: Number,
    required: true
  },
  principal: {
    type: Number,
    required: true
  },
  interest: {
    type: Number,
    required: true
  },
  remainingPrincipal: {
    type: Number,
    required: true
  }
}, { _id: false });

// סכמה ראשית ללוח שפיצר
const scheduleSchema = new mongoose.Schema({
  purpose: {
    type: String,
    required: true,
    enum: ['דיור', 'מסחרי', 'רכב', 'אחר']
  },
  years: {
    type: Number,
    required: true
  },
  interest: {
    type: Number,
    required: true
  },
  loanAmount: {
    type: Number,
    required: true,
    default: 100000
  },
  monthlyPayments: [monthlyPaymentSchema]
}, { 
  collection: 'shpizer',
  strict: false  // מאפשר שדות נוספים מהקובץ JSON
});

// אינדקסים לייעול חיפושים
scheduleSchema.index({ purpose: 1, years: 1, interest: 1 });

// מתודה סטטית לחיפוש לוח תשלומים מתאים
scheduleSchema.statics.findMatchingSchedule = async function(purpose, years, interest) {
  try {
    console.log(`מחפש לוח שפיצר: מטרה=${purpose}, שנים=${years}, ריבית=${interest}%`);
    
    // קודם נבדוק אם קיים לוח מדויק
    let schedule = await this.findOne({ 
      purpose, 
      years,
      interest
    });

    // אם לא מצאנו, ננסה לחפש בצורה אחרת - נחפש מסמך לפי מטרה שמכיל את מספר השנים הנכון
    if (!schedule) {
      console.log(`לא נמצא לוח מדויק. מנסה לחפש בצורה אחרת...`);
      
      try {
        // נחפש מסמך שתואם את מטרת ההלוואה (דיור)
        const purposeDoc = await this.findOne({ purpose });
        
        if (purposeDoc && purposeDoc[years]) {
          // אם מצאנו מסמך ויש בו נתונים למספר השנים שאנחנו מחפשים
          console.log(`מצאנו מסמך לפי מטרה ${purpose} שמכיל נתונים לתקופה של ${years} שנים`);
          
          // נחפש את הריבית הקרובה ביותר
          let closestInterest = null;
          let minDiff = Infinity;
          
          // אם יש מערך של ריביות שונות, נחפש את הקרובה ביותר
          if (purposeDoc[years].interestRates) {
            for (const rate of purposeDoc[years].interestRates) {
              const diff = Math.abs(rate - interest);
              if (diff < minDiff) {
                minDiff = diff;
                closestInterest = rate;
              }
            }
            
            if (closestInterest !== null) {
              console.log(`נמצאה ריבית ${closestInterest}% במקום ${interest}%`);
              
              // בנה אובייקט חדש עם המידע המתאים
              schedule = {
                purpose,
                years,
                interest: closestInterest,
                loanAmount: 100000,  // ברירת מחדל
                monthlyPayments: purposeDoc[years].payments || []
              };
            }
          }
        }
      } catch (nestedError) {
        console.error('שגיאה בחיפוש מורכב:', nestedError);
      }
      
      if (!schedule) {
        // אם עדיין לא מצאנו, ננסה למצוא לפי קריטריונים גמישים יותר
        schedule = await this.findOne({ 
          purpose, 
          years
        }).sort({ interest: 'asc' });
        
        if (schedule) {
          console.log(`לא נמצא לוח מדויק. משתמש בלוח עם ריבית ${schedule.interest}% במקום ${interest}%`);
        }
      }
    }

    if (!schedule) {
      console.log(`לא נמצא לוח שפיצר מתאים למטרה=${purpose}, שנים=${years}, ריבית=${interest}%`);
    }

    return schedule;
  } catch (error) {
    console.error('שגיאה בחיפוש לוח שפיצר:', error);
    throw error;
  }
};

// מתודה להתאמת לוח תשלומים לסכום הלוואה אחר
scheduleSchema.methods.adjustToLoanAmount = function(newLoanAmount) {
  // אם אין לוח תשלומים או שהוא ריק, נחזיר מערך ריק
  if (!this.monthlyPayments || !Array.isArray(this.monthlyPayments) || this.monthlyPayments.length === 0) {
    console.log('אין לוח תשלומים זמין להתאמה');
    return [];
  }

  if (newLoanAmount === this.loanAmount) {
    return this.monthlyPayments;
  }

  // מקדם ההתאמה
  const factor = newLoanAmount / this.loanAmount;
  console.log(`מתאים לוח תשלומים: סכום מקורי=${this.loanAmount}₪, סכום חדש=${newLoanAmount}₪, מקדם=${factor}`);
  
  // יצירת לוח חדש עם הערכים המותאמים
  const adjustedPayments = this.monthlyPayments.map(payment => {
    // בדיקה שיש לנו את כל השדות הנדרשים
    if (!payment.month || !payment.totalPayment || !payment.principal || !payment.interest || !payment.remainingPrincipal) {
      console.log('מבנה תשלום חסר שדות:', payment);
      // ניצור אובייקט עם ערכי ברירת מחדל אם חסרים שדות
      return {
        month: payment.month || 0,
        totalPayment: Math.round((payment.totalPayment || 0) * factor),
        principal: Math.round((payment.principal || 0) * factor),
        interest: Math.round((payment.interest || 0) * factor),
        remainingPrincipal: Math.round((payment.remainingPrincipal || 0) * factor)
      };
    }
    
    // אם יש לנו את כל השדות, נעשה התאמה רגילה
    return {
      month: payment.month,
      totalPayment: Math.round(payment.totalPayment * factor),
      principal: Math.round(payment.principal * factor),
      interest: Math.round(payment.interest * factor),
      remainingPrincipal: Math.round(payment.remainingPrincipal * factor)
    };
  });

  return adjustedPayments;
};

// מתודה לחישוב ערכים ממוצעים מלוח התשלומים
scheduleSchema.methods.calculateAverages = function(adjustedPayments) {
  if (!adjustedPayments || !Array.isArray(adjustedPayments) || adjustedPayments.length === 0) {
    console.log('אין תשלומים חודשיים לחישוב ממוצעים');
    return { avgTotalPayment: 0, avgPrincipal: 0, avgInterest: 0 };
  }

  // מסנן תשלומים שאין בהם את כל השדות הדרושים
  const validPayments = adjustedPayments.filter(payment => 
    payment && payment.totalPayment !== undefined && 
    payment.principal !== undefined && 
    payment.interest !== undefined
  );

  if (validPayments.length === 0) {
    console.log('אין תשלומים חודשיים תקינים לחישוב ממוצעים');
    return { avgTotalPayment: 0, avgPrincipal: 0, avgInterest: 0 };
  }

  // חישוב ממוצעים
  const sum = validPayments.reduce((acc, payment) => ({
    totalPayment: acc.totalPayment + payment.totalPayment,
    principal: acc.principal + payment.principal,
    interest: acc.interest + payment.interest
  }), { totalPayment: 0, principal: 0, interest: 0 });

  const avgTotalPayment = Math.round(sum.totalPayment / validPayments.length);
  const avgPrincipal = Math.round(sum.principal / validPayments.length);
  const avgInterest = Math.round(sum.interest / validPayments.length);

  console.log(`ממוצעים מחושבים: תשלום חודשי=${avgTotalPayment}₪, קרן=${avgPrincipal}₪, ריבית=${avgInterest}₪`);

  return {
    avgTotalPayment,
    avgPrincipal,
    avgInterest
  };
};

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule; 