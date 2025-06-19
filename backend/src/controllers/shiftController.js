const dataService = require('../services/dataService');

// קבלת משמרות לשבוע ספציפי
const getShifts = async (req, res) => {
  try {
    console.log('Getting shifts for week:', req.params.week);
    
    const { week } = req.params;
    const shifts = await dataService.getShifts();
    
    // סינון לפי שבוע
    const weekShifts = shifts.filter(s => s.week === week);
    
    res.json(weekShifts);
  } catch (error) {
    console.error('Error getting shifts:', error);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// עדכון משמרת ספציפית
const updateShift = async (req, res) => {
  try {
    console.log('Updating shift:', req.params.id, req.body);
    
    const { id } = req.params;
    const { soldierName, week } = req.body;
    
    const shifts = await dataService.getShifts();
    
    // חיפוש משמרת קיימת
    const existingIndex = shifts.findIndex(s => s.id === id && s.week === week);
    
    if (soldierName) {
      // הוספה או עדכון
      const shiftData = {
        id,
        week,
        soldierName,
        updatedAt: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        shifts[existingIndex] = shiftData;
        console.log('Updated existing shift');
      } else {
        shifts.push(shiftData);
        console.log('Added new shift assignment');
      }
    } else {
      // הסרה
      if (existingIndex >= 0) {
        shifts.splice(existingIndex, 1);
        console.log('Removed shift assignment');
      }
    }
    
    await dataService.saveShifts(shifts);
    
    res.json({ 
      message: 'משמרת עודכנה בהצלחה',
      shift: shifts.find(s => s.id === id && s.week === week) || null
    });
    
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// שמירת כל המשמרות לשבוע
const saveAllShifts = async (req, res) => {
  try {
    console.log('Saving all shifts:', req.body);
    
    const { week, shiftAssignments } = req.body;
    
    if (!week || !shiftAssignments) {
      return res.status(400).json({ error: 'חסרים נתונים נדרשים' });
    }
    
    const shifts = await dataService.getShifts();
    
    // הסרת משמרות קיימות לשבוע זה
    const filteredShifts = shifts.filter(s => s.week !== week);
    
    // הוספת המשמרות החדשות
    const newShifts = Object.entries(shiftAssignments).map(([shiftId, soldierName]) => ({
      id: shiftId,
      week,
      soldierName,
      updatedAt: new Date().toISOString()
    }));
    
    const allShifts = [...filteredShifts, ...newShifts];
    
    await dataService.saveShifts(allShifts);
    
    console.log(`Saved ${newShifts.length} shifts for week ${week}`);
    
    res.json({ 
      message: 'כל המשמרות נשמרו בהצלחה',
      shiftsCount: newShifts.length
    });
    
  } catch (error) {
    console.error('Error saving all shifts:', error);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// שיבוץ אוטומטי פשוט
// שיבוץ אוטומטי פשוט
const autoAssign = async (req, res) => {
  try {
    console.log('Starting auto assignment for week:', req.body.week);
    
    const { week } = req.body;
    
    if (!week) {
      return res.status(400).json({ error: 'נדרש שבוע' });
    }
    
    // קבלת נתונים
    const users = await dataService.getUsers();
    const availability = await dataService.getAvailability();
    
    const soldiers = users.filter(u => u.role === 'soldier');
    
    if (soldiers.length === 0) {
      return res.status(400).json({ error: 'אין חיילים במערכת' });
    }
    
    // אלגוריתם שיבוץ פשוט
    const assignments = {};
    const soldierShiftCount = {};
    
    // אתחול מונה משמרות
    soldiers.forEach(soldier => {
      soldierShiftCount[soldier.name] = 0;
    });
    
    // הגדרת משמרות אפשריות
    const tasks = ['sg', 'patrol', 'patrol4h'];
    const timeSlots = [0, 1, 2, 3];
    
    // שיבוץ למשמרות
    for (let day = 0; day < 7; day++) {
      for (let timeSlot of timeSlots) {
        for (let task of tasks) {
          const shiftId = `${task}_${day}_${timeSlot}`;
          
          // חיפוש חייל זמין
          const availableSoldiers = soldiers.filter(soldier => {
            const userAvailability = availability.find(a => a.userId === soldier.id && a.week === week);
            
            if (!userAvailability) return true;
            
            const isUnavailable = userAvailability.preferences?.unavailable?.some(
              unavailable => unavailable.day === day && unavailable.timeSlot === timeSlot
            );
            
            return !isUnavailable;
          });
          
          if (availableSoldiers.length > 0) {
            availableSoldiers.sort((a, b) => soldierShiftCount[a.name] - soldierShiftCount[b.name]);
            const selectedSoldier = availableSoldiers[0];
            
            assignments[shiftId] = selectedSoldier.name;
            soldierShiftCount[selectedSoldier.name]++;
          }
        }
      }
    }
    
    // שמירה ישירה ללא קריאה לפונקציה אחרת
    const shifts = await dataService.getShifts();
    const filteredShifts = shifts.filter(s => s.week !== week);
    
    const newShifts = Object.entries(assignments).map(([shiftId, soldierName]) => ({
      id: shiftId,
      week,
      soldierName,
      updatedAt: new Date().toISOString()
    }));
    
    const allShifts = [...filteredShifts, ...newShifts];
    await dataService.saveShifts(allShifts);
    
    console.log(`Auto assignment completed: ${Object.keys(assignments).length} shifts assigned`);
    
    res.json({
      message: 'שיבוץ אוטומטי הושלם בהצלחה',
      assignedShifts: Object.keys(assignments).length,
      assignments
    });
    
  } catch (error) {
    console.error('Error in auto assignment:', error);
    res.status(500).json({ error: 'שגיאת שרת בשיבוץ אוטומטי' });
  }
};

module.exports = { 
  getShifts, 
  updateShift, 
  saveAllShifts,
  autoAssign 
};