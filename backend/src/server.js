const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const shiftRoutes = require('./routes/shifts');
const availabilityRoutes = require('./routes/availability');
const { connectDB } = require('./services/dataService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/availability', availabilityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// עבור Vercel (serverless) - לא מריץ app.listen
// רק מנסה להתחבר לבסיס הנתונים פעם אחת
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

// רק אם מריצים את הקובץ הזה ישירות (לא דרך require)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  connectDB()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🟢 Express מאזין על: http://127.0.0.1:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('🛑 שגיאה בהתחברות ל‑MongoDB:', err);
      process.exit(1);
    });
} else {
  // אם הקובץ נטען דרך require, פשוט התחבר לDB
  initConnectionIfNeeded();
}

module.exports = app;