const { MongoClient } = require('mongodb');

// URI קבוע (זמנית עד שנתקן את ה-.env)
const uri = 'mongodb+srv://ysiraamit:nJ6vcyK2HtnGdFCF@cluster0.5onidcr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔍 MongoDB URI loaded');

const client = new MongoClient(uri);

let db = null;

// חיבור למסד הנתונים
const connectDB = async () => {
  if (!db) {
    try {
      await client.connect();
      db = client.db('shiftmanagement');
      console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
    }
  }
  return db;
};

// ========== USERS ==========
const getUsers = async () => {
  try {
    const database = await connectDB();
    const users = await database.collection('users').find({}).toArray();
    
    // אם אין משתמשים, צור משתמש admin בסיסי
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: "admin",
          name: "מנהל המערכת",
          phone: "0509999999",
          role: "manager"
        },
        {
          id: "1",
          name: "דוד כהן",
          phone: "0501234567",
          role: "soldier"
        },
        {
          id: "2",
          name: "משה לוי",
          phone: "0507654321",
          role: "soldier"
        }
      ];
      
      await database.collection('users').insertMany(defaultUsers);
      console.log('✅ Default users created in MongoDB');
      return defaultUsers;
    }
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

const saveUsers = async (users) => {
  try {
    const database = await connectDB();
    // מחיקת כל המשתמשים הקיימים והכנסת החדשים
    await database.collection('users').deleteMany({});
    await database.collection('users').insertMany(users);
    console.log('✅ Users saved to MongoDB');
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
};

// ========== SHIFTS ==========
const getShifts = async () => {
  try {
    const database = await connectDB();
    const shifts = await database.collection('shifts').find({}).toArray();
    return shifts;
  } catch (error) {
    console.error('Error getting shifts:', error);
    return [];
  }
};

const saveShifts = async (shifts) => {
  try {
    const database = await connectDB();
    // מחיקת כל המשמרות והכנסת החדשות
    await database.collection('shifts').deleteMany({});
    if (shifts.length > 0) {
      await database.collection('shifts').insertMany(shifts);
    }
    console.log('✅ Shifts saved to MongoDB');
  } catch (error) {
    console.error('Error saving shifts:', error);
    throw error;
  }
};

// ========== AVAILABILITY ==========
const getAvailability = async () => {
  try {
    const database = await connectDB();
    const availability = await database.collection('availability').find({}).toArray();
    return availability;
  } catch (error) {
    console.error('Error getting availability:', error);
    return [];
  }
};

const saveAvailability = async (availability) => {
  try {
    const database = await connectDB();
    // מחיקת כל הזמינויות והכנסת החדשות
    await database.collection('availability').deleteMany({});
    if (availability.length > 0) {
      await database.collection('availability').insertMany(availability);
    }
    console.log('✅ Availability saved to MongoDB');
  } catch (error) {
    console.error('Error saving availability:', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  getUsers,
  saveUsers,
  getShifts,
  saveShifts,
  getAvailability,
  saveAvailability
};