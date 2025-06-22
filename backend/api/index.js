const express = require('express');
const cors = require('cors');

// Import routes directly with absolute paths
const authController = require('../src/controllers/authController');
const userController = require('../src/controllers/userController');
const shiftController = require('../src/controllers/shiftController');
const availabilityController = require('../src/controllers/availabilityController');
const { connectDB } = require('../src/services/dataService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authController.getMe);

// User routes
app.get('/api/users', userController.getUsers);
app.post('/api/users', userController.createUser);

// Shift routes
app.get('/api/shifts/:week', shiftController.getShifts);
app.put('/api/shifts/:id', shiftController.updateShift);
app.post('/api/shifts/save-all', shiftController.saveAllShifts);
app.post('/api/shifts/auto-assign', shiftController.autoAssign);

// Availability routes
app.get('/api/availability/:week', availabilityController.getAvailability);
app.post('/api/availability', availabilityController.submitAvailability);
app.get('/api/availability/status/:week', availabilityController.getStatus);
app.get('/api/availability/:userId/:week', availabilityController.getUserAvailability);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running on Vercel' });
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
initConnectionIfNeeded();

module.exports = app;