const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

// קבלת כל הזמינויות לשבוע ספציפי
router.get('/:week', availabilityController.getAvailability);

// שליחת זמינות חדשה
router.post('/', availabilityController.submitAvailability);

// קבלת סטטוס זמינויות (מי שלח ומי לא)
router.get('/status/:week', availabilityController.getStatus);

// קבלת זמינות ספציפית של משתמש
router.get('/:userId/:week', availabilityController.getUserAvailability);

module.exports = router;