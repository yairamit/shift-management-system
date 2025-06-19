const express = require('express');
const cors = require('cors');

const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const shiftRoutes = require('../routes/shifts');
const availabilityRoutes = require('../routes/availability');
const { connectDB } = require('../services/dataService');

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
  res.json({ status: 'OK', message: 'Server is running on Vercel' });
});

// Connect to MongoDB (on cold start of serverless function)
connectDB().catch((err) => {
  console.error('🛑 שגיאה בהתחברות ל‑MongoDB:', err);
});

// Export for Vercel
module.exports = app;
