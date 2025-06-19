const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');

// קבלת משמרות לשבוע ספציפי
router.get('/:week', shiftController.getShifts);

// עדכון משמרת ספציפית
router.put('/:id', shiftController.updateShift);

// שמירת כל המשמרות לשבוע
router.post('/save-all', shiftController.saveAllShifts);

// שיבוץ אוטומטי
router.post('/auto-assign', shiftController.autoAssign);

module.exports = router;