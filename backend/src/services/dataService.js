const { MongoClient } = require('mongodb');
require('dotenv').config();

// URI מהמשתנה סביבה או ברירת מחדל
const uri = process.env.MONGODB_URI || 'mongodb+srv://ysiraamit:nJ6vcyK2HtnGdFCF@cluster0.5onidcr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔍 MongoDB URI loaded, length:', uri.length);

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5, // Maintain a minimum of 5 socket connections
  bufferMaxEntries: 0, // Disable mongoose buffering
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let db = null;
let isConnecting = false;

// חיבור למסד הנתונים עם retry logic
const connectDB = async (retries = 3) => {
  if (db) {
    console.log('✅ Using existing MongoDB connection');
    return db;
  }
  
  if (isConnecting) {
    console.log('⏳ MongoDB connection already in progress...');
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return db;
  }
  
  isConnecting = true;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 MongoDB connection attempt ${attempt}/${retries}`);
      
      await client.connect();
      db = client.db('shiftmanagement');
      
      // Test the connection
      await db.admin().ping();
      
      console.log('✅ Connected to MongoDB Atlas successfully');
      isConnecting = false;
      return db;
      
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        isConnecting = false;
        console.error('🛑 All MongoDB connection attempts failed');
        throw new Error(`MongoDB connection failed after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Helper function to ensure connection
const ensureConnection = async () => {
  if (!db) {
    await connectDB();
  }
  return db;
};

// ========== USERS ==========
const getUsers = async () => {
  try {
    console.log('👥 Getting users...');
    const database = await ensureConnection();
    const users = await database.collection('users').find({}).toArray();
    
    console.log(`👥 Found ${users.length} users`);
    
    // אם אין משתמשים, צור משתמש admin בסיסי
    if (users.length === 0) {
      console.log('👥 No users found, creating default users...');
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
    console.error('❌ Error getting users:', error);
    // Return empty array instead of throwing
    return [];
  }
};

const saveUsers = async (users) => {
  try {
    console.log(`👥 Saving ${users.length} users...`);
    const database = await ensureConnection();
    
    // מחיקת כל המשתמשים הקיימים והכנסת החדשים
    await database.collection('users').deleteMany({});
    if (users.length > 0) {
      await database.collection('users').insertMany(users);
    }
    console.log('✅ Users saved to MongoDB');
  } catch (error) {
    console.error('❌ Error saving users:', error);
    throw error;
  }
};

// ========== SHIFTS ==========
const getShifts = async () => {
  try {
    console.log('📊 Getting shifts...');
    const database = await ensureConnection();
    const shifts = await database.collection('shifts').find({}).toArray();
    console.log(`📊 Found ${shifts.length} shifts`);
    return shifts;
  } catch (error) {
    console.error('❌ Error getting shifts:', error);
    // Return empty array instead of throwing
    return [];
  }
};

const saveShifts = async (shifts) => {
  try {
    console.log(`📊 Saving ${shifts.length} shifts...`);
    const database = await ensureConnection();
    
    // מחיקת כל המשמרות והכנסת החדשות
    await database.collection('shifts').deleteMany({});
    if (shifts.length > 0) {
      await database.collection('shifts').insertMany(shifts);
    }
    console.log('✅ Shifts saved to MongoDB');
  } catch (error) {
    console.error('❌ Error saving shifts:', error);
    throw error;
  }
};

// ========== AVAILABILITY ==========
const getAvailability = async () => {
  try {
    console.log('📅 Getting availability...');
    const database = await ensureConnection();
    const availability = await database.collection('availability').find({}).toArray();
    console.log(`📅 Found ${availability.length} availability records`);
    return availability;
  } catch (error) {
    console.error('❌ Error getting availability:', error);
    // Return empty array instead of throwing
    return [];
  }
};

const saveAvailability = async (availability) => {
  try {
    console.log(`📅 Saving ${availability.length} availability records...`);
    const database = await ensureConnection();
    
    // מחיקת כל הזמינויות והכנסת החדשות
    await database.collection('availability').deleteMany({});
    if (availability.length > 0) {
      await database.collection('availability').insertMany(availability);
    }
    console.log('✅ Availability saved to MongoDB');
  } catch (error) {
    console.error('❌ Error saving availability:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing MongoDB connection...');
  if (client) {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
  process.exit(0);
});

module.exports = {
  connectDB,
  getUsers,
  saveUsers,
  getShifts,
  saveShifts,
  getAvailability,
  saveAvailability
};