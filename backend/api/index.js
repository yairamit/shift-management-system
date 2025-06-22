const express = require('express');
const cors = require('cors');

console.log('🚀 Starting API server...');

// Import routes directly with relative paths from api folder
let authController, userController, shiftController, availabilityController, connectDB;

try {
  authController = require('../src/controllers/authController');
  console.log('✅ authController loaded');
} catch (error) {
  console.error('❌ Error loading authController:', error.message);
}

try {
  userController = require('../src/controllers/userController');
  console.log('✅ userController loaded');
} catch (error) {
  console.error('❌ Error loading userController:', error.message);
}

try {
  shiftController = require('../src/controllers/shiftController');
  console.log('✅ shiftController loaded');
} catch (error) {
  console.error('❌ Error loading shiftController:', error.message);
}

try {
  availabilityController = require('../src/controllers/availabilityController');
  console.log('✅ availabilityController loaded');
} catch (error) {
  console.error('❌ Error loading availabilityController:', error.message);
}

try {
  const dataService = require('../src/services/dataService');
  connectDB = dataService.connectDB;
  console.log('✅ dataService loaded');
} catch (error) {
  console.error('❌ Error loading dataService:', error.message);
}

console.log('📦 All modules imported successfully');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://shift-management-system-amber.vercel.app',
    'https://shift-management-system-server.vercel.app',
    /\.vercel\.app$/  // כל הדומיינים של vercel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json());

// Handle preflight requests
app.options('*', cors());

console.log('🔧 Middleware configured');

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    if (!authController) {
      throw new Error('authController not loaded');
    }
    await authController.login(req, res);
  } catch (error) {
    console.error('❌ Auth login error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    if (!authController) {
      throw new Error('authController not loaded');
    }
    await authController.getMe(req, res);
  } catch (error) {
    console.error('❌ Auth me error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

// User routes
app.get('/api/users', async (req, res) => {
  try {
    if (!userController) {
      throw new Error('userController not loaded');
    }
    await userController.getUsers(req, res);
  } catch (error) {
    console.error('❌ Users get error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    if (!userController) {
      throw new Error('userController not loaded');
    }
    await userController.createUser(req, res);
  } catch (error) {
    console.error('❌ Users create error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

// Shift routes
app.get('/api/shifts/:week', async (req, res) => {
  try {
    if (!shiftController) {
      throw new Error('shiftController not loaded');
    }
    await shiftController.getShifts(req, res);
  } catch (error) {
    console.error('❌ Shifts get error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

app.put('/api/shifts/:id', async (req, res) => {
  try {
    if (!shiftController) {
      throw new Error('shiftController not loaded');
    }
    await shiftController.updateShift(req, res);
  } catch (error) {
    console.error('❌ Shifts update error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

app.post('/api/shifts/save-all', async (req, res) => {
  try {
    if (!shiftController) {
      throw new Error('shiftController not loaded');
    }
    await shiftController.saveAllShifts(req, res);
  } catch (error) {
    console.error('❌ Shifts save-all error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

app.post('/api/shifts/auto-assign', async (req, res) => {
  try {
    if (!shiftController) {
      throw new Error('shiftController not loaded');
    }
    await shiftController.autoAssign(req, res);
  } catch (error) {
    console.error('❌ Shifts auto-assign error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

// Availability routes
app.get('/api/availability/:week', async (req, res) => {
  try {
    if (!availabilityController) {
      throw new Error('availabilityController not loaded');
    }
    await availabilityController.getAvailability(req, res);
  } catch (error) {
    console.error('❌ Availability get error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

app.post('/api/availability', async (req, res) => {
  try {
    if (!availabilityController) {
      throw new Error('availabilityController not loaded');
    }
    await availabilityController.submitAvailability(req, res);
  } catch (error) {
    console.error('❌ Availability submit error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

app.get('/api/availability/status/:week', async (req, res) => {
  try {
    if (!availabilityController) {
      throw new Error('availabilityController not loaded');
    }
    await availabilityController.getStatus(req, res);
  } catch (error) {
    console.error('❌ Availability status error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

app.get('/api/availability/:userId/:week', async (req, res) => {
  try {
    if (!availabilityController) {
      throw new Error('availabilityController not loaded');
    }
    await availabilityController.getUserAvailability(req, res);
  } catch (error) {
    console.error('❌ Availability user error:', error);
    res.status(500).json({ error: 'שגיאת שרת', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Server is running on Vercel - Direct Routes',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /api/health',
      'GET /api/users',
      'POST /api/auth/login',
      'GET /api/shifts/:week',
      'GET /api/availability/:week'
    ]
  });
});

// Root route
app.get('/', (req, res) => {
  console.log('🏠 Root route requested');
  res.json({ 
    message: 'Shift Management API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      auth: '/api/auth/login',
      shifts: '/api/shifts/:week',
      availability: '/api/availability/:week'
    }
  });
});

// Catch-all for debugging
app.get('*', (req, res) => {
  console.log(`❓ Unknown route requested: ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      '/api/health',
      '/api/users',
      '/api/auth/login',
      '/api/shifts/:week',
      '/api/availability/:week'
    ]
  });
});

console.log('🛣️ All routes configured');

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

// Initialize on startup
initConnectionIfNeeded();

console.log('🎯 API server ready');

module.exports = app;