const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('🚀 Starting API server...');
console.log('📁 Current directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

// בVercel הנתיב צריך להיות יחסי לתיקיית הbackend
// מהתיקיה api/ אנחנו צריכים ללכת ל../src/
const backendRoot = path.resolve(__dirname, '..');
const controllersPath = path.join(backendRoot, 'src', 'controllers');
const servicesPath = path.join(backendRoot, 'src', 'services');

console.log('📁 Backend root:', backendRoot);
console.log('📁 Controllers path:', controllersPath);
console.log('📁 Services path:', servicesPath);

// בדיקה שהתיקיות קיימות
const fs = require('fs');
console.log('📁 Controllers exists:', fs.existsSync(controllersPath));
console.log('📁 Services exists:', fs.existsSync(servicesPath));

// בדיקה מה יש בתיקיות
try {
  const controllersFiles = fs.readdirSync(controllersPath);
  console.log('📁 Controllers files:', controllersFiles);
} catch (error) {
  console.log('❌ Cannot read controllers directory:', error.message);
}

try {
  const servicesFiles = fs.readdirSync(servicesPath);
  console.log('📁 Services files:', servicesFiles);
} catch (error) {
  console.log('❌ Cannot read services directory:', error.message);
}

// בדיקה מה יש בתיקייה הראשית
try {
  const backendFiles = fs.readdirSync(backendRoot);
  console.log('📁 Backend root files:', backendFiles);
} catch (error) {
  console.log('❌ Cannot read backend root:', error.message);
}

// Import routes with correct paths
let authController, userController, shiftController, availabilityController, connectDB;

try {
  // נסה נתיבים שונים
  const possiblePaths = [
    path.join(controllersPath, 'authController.js'),
    path.join(controllersPath, 'authController'),
    path.join(backendRoot, 'src', 'controllers', 'authController.js'),
    '../src/controllers/authController.js',
    '../src/controllers/authController'
  ];
  
  for (const testPath of possiblePaths) {
    try {
      console.log(`🔍 Trying authController path: ${testPath}`);
      console.log(`🔍 File exists: ${fs.existsSync(testPath)}`);
      
      authController = require(testPath);
      console.log('✅ authController loaded from:', testPath);
      break;
    } catch (error) {
      console.log(`❌ Failed to load from ${testPath}:`, error.message);
    }
  }
  
  if (!authController) {
    console.error('❌ Could not load authController from any path');
  }
  
} catch (error) {
  console.error('❌ Error loading authController:', error.message);
}

try {
  userController = require(path.join(controllersPath, 'userController.js'));
  console.log('✅ userController loaded');
} catch (error) {
  console.error('❌ Error loading userController:', error.message);
}

try {
  shiftController = require(path.join(controllersPath, 'shiftController.js'));
  console.log('✅ shiftController loaded');
} catch (error) {
  console.error('❌ Error loading shiftController:', error.message);
}

try {
  availabilityController = require(path.join(controllersPath, 'availabilityController.js'));
  console.log('✅ availabilityController loaded');
} catch (error) {
  console.error('❌ Error loading availabilityController:', error.message);
}

try {
  const dataService = require(path.join(servicesPath, 'dataService.js'));
  connectDB = dataService.connectDB;
  console.log('✅ dataService loaded');
} catch (error) {
  console.error('❌ Error loading dataService:', error.message);
  console.error('❌ Tried path:', path.join(servicesPath, 'dataService.js'));
}

console.log('📦 Module loading complete');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://shift-management-system-amber.vercel.app',
    'https://shift-management-system-server.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json());
app.options('*', cors());

console.log('🔧 Middleware configured');

// Debug middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login route called');
    
    if (!authController) {
      console.error('❌ authController not loaded');
      return res.status(500).json({ error: 'authController not loaded' });
    }
    
    await authController.login(req, res);
    
  } catch (error) {
    console.error('❌ Auth login route error:', error);
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
    message: 'Server is running on Vercel',
    timestamp: new Date().toISOString(),
    controllers: {
      auth: !!authController,
      user: !!userController,
      shift: !!shiftController,
      availability: !!availabilityController,
      dataService: !!connectDB
    },
    paths: {
      backendRoot,
      controllersPath,
      servicesPath
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Shift Management API',
    version: '1.0.0',
    status: 'ready'
  });
});

// Catch-all
app.get('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

console.log('🛣️ All routes configured');

// Initialize DB connection
if (connectDB) {
  connectDB().then(() => {
    console.log('✅ MongoDB connected');
  }).catch(err => {
    console.error('🛑 MongoDB connection failed:', err);
  });
}

console.log('🎯 API server ready');

module.exports = app;