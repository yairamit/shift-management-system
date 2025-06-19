const dataService = require('../services/dataService');

// קבלת זמינות לשבוע ספציפי
const getAvailability = async (req, res) => {
  try {
    console.log('Getting availability for week:', req.params.week);
    
    const { week } = req.params;
    const availability = await dataService.getAvailability();
    
    // סינון לפי שבוע
    const weekAvailability = availability.filter(a => a.week === week);
    
    res.json(weekAvailability);
  } catch (error) {
    console.error('Error getting availability:', error);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// שליחת זמינות חדשה
const submitAvailability = async (req, res) => {
  try {
    console.log('Submitting availability:', req.body);
    
    const { userId, week, preferences } = req.body;
    
    // ולידציה בסיסית
    if (!userId || !week || !preferences) {
      return res.status(400).json({ error: 'חסרים נתונים נדרשים' });
    }
    
    // בדיקה שהמשתמש קיים
    const users = await dataService.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }
    
    // טעינת נתוני זמינות קיימים
    const availability = await dataService.getAvailability();
    
    // בדיקה אם כבר יש זמינות למשתמש זה בשבוע זה
    const existingIndex = availability.findIndex(a => a.userId === userId && a.week === week);
    
    const newAvailability = {
      userId,
      week,
      preferences,
      submittedAt: new Date().toISOString(),
      userName: user.name // נוסיף לנוחות
    };
    
    if (existingIndex >= 0) {
      // עדכון קיים
      availability[existingIndex] = newAvailability;
      console.log('Updated existing availability for user:', user.name);
    } else {
      // הוספה חדשה
      availability.push(newAvailability);
      console.log('Added new availability for user:', user.name);
    }
    
    // שמירה לקובץ
    await dataService.saveAvailability(availability);
    
    res.status(201).json({ 
      message: 'זמינות נשמרה בהצלחה',
      availability: newAvailability
    });
    
  } catch (error) {
    console.error('Error submitting availability:', error);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// קבלת סטטוס זמינות (מי שלח ומי לא)
const getStatus = async (req, res) => {
  try {
    console.log('Getting availability status for week:', req.params.week);
    
    const { week } = req.params;
    const users = await dataService.getUsers();
    const availability = await dataService.getAvailability();
    
    // יצירת סטטוס לכל חייל
    const soldiers = users.filter(u => u.role === 'soldier');
    const status = soldiers.map(soldier => {
      const userAvailability = availability.find(a => a.userId === soldier.id && a.week === week);
      
      return {
        userId: soldier.id,
        userName: soldier.name,
        phone: soldier.phone,
        submitted: !!userAvailability,
        submittedAt: userAvailability?.submittedAt || null,
        preferences: userAvailability?.preferences || null
      };
    });
    
    const submittedCount = status.filter(s => s.submitted).length;
    const totalSoldiers = soldiers.length;
    
    res.json({
      week,
      soldiers: status,
      summary: {
        submitted: submittedCount,
        pending: totalSoldiers - submittedCount,
        total: totalSoldiers,
        percentage: totalSoldiers > 0 ? Math.round((submittedCount / totalSoldiers) * 100) : 0
      }
    });
    
  } catch (error) {
    console.error('Error getting availability status:', error);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// קבלת זמינות ספציפית של משתמש
const getUserAvailability = async (req, res) => {
  try {
    const { userId, week } = req.params;
    console.log(`Getting availability for user ${userId}, week ${week}`);
    
    const availability = await dataService.getAvailability();
    const userAvailability = availability.find(a => a.userId === userId && a.week === week);
    
    if (!userAvailability) {
      return res.status(404).json({ error: 'זמינות לא נמצאה' });
    }
    
    res.json(userAvailability);
    
  } catch (error) {
    console.error('Error getting user availability:', error);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

module.exports = { 
  getAvailability, 
  submitAvailability, 
  getStatus,
  getUserAvailability 
};