const express = require('express');
const router = express.Router();
const {
  getAdjustedSchedule,
  getScheduleAverages,
  checkSchedulesAvailability
} = require('../controllers/scheduleController');

/**
 * @route   GET /api/schedules/check
 * @desc    בדיקת זמינות של לוחות שפיצר במערכת
 * @access  Public
 */
router.get('/check', checkSchedulesAvailability);

// נתיב נוסף לבדיקת זמינות - לתאימות מלאה
router.get('/', checkSchedulesAvailability);

/**
 * @route   GET /api/schedules/adjustedSchedule
 * @desc    קבלת לוח שפיצר מותאם לפי הפרמטרים
 * @access  Public
 * @params  purpose (default: דיור), years, loanAmount, interest (default: 4.0)
 */
router.get('/adjustedSchedule', getAdjustedSchedule);

/**
 * @route   GET /api/schedules/averages
 * @desc    קבלת ממוצעי תשלומים בלבד לפי הפרמטרים
 * @access  Public
 * @params  purpose (default: דיור), years, loanAmount, interest (default: 4.0)
 */
router.get('/averages', getScheduleAverages);

module.exports = router; 