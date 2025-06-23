const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const shiftRoutes = require('./routes/shifts');
const availabilityRoutes = require('./routes/availability');
const { connectDB } = require('./services/dataService');

const app = express();

// CORS configuration מורחב
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://shift-management-system-amber.vercel.app',
    /\.vercel\.app$/,
    /\.railway\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'Origin', 
    'X-Requested-With',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  optionsSuccessStatus: 200 // עבור Legacy browsers
};

// הפעלת CORS
app.use(cors(corsOptions));

// טיפול מפורש ב-preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/availability', availabilityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running on Railway',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Debug middleware להראות בקשות
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Initialize DB connection
let dbConnected = false;

async function initConnectionIfNeeded() {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log('✅ MongoDB connected');
    } catch (err) {
      console.error('🛑 MongoDB connection failed:', err);
    }
  }
}

// רק אם מריצים את הקובץ הזה ישירות
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  connectDB()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🟢 Express מאזין על: http://0.0.0.0:${PORT}`);
        console.log('🌐 CORS enabled for:', corsOptions.origin);
      });
    })
    .catch((err) => {
      console.error('🛑 שגיאה בהתחברות ל‑MongoDB:', err);
      process.exit(1);
    });
} else {
  initConnectionIfNeeded();
}

module.exports = app;