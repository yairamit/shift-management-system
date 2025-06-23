// server.js (או index.js)
require('dotenv').config();        // נטען רק אם אתה משתמש בקובץ .env
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./services/dataService');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const shiftRoutes = require('./routes/shifts');
const availabilityRoutes = require('./routes/availability');

const app = express();

app.use(cors({
  origin: [
    'https://shift-management-system-amber.vercel.app/', 
    'shift-management-system-production.up.railway.app'
  ]
}));

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

// קביעת הפורט
const PORT = process.env.PORT || 3001;

// חיבור ל‑MongoDB ואז התחלת ה‑server
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
