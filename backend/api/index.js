const path = require('path');
const fs = require('fs');

console.log('🚀 Simple API starting...');
console.log('📁 __dirname:', __dirname);
console.log('📁 process.cwd():', process.cwd());

// בדיקת הנתיב
const serverPath = path.join(__dirname, '..', 'src', 'server.js');
console.log('📁 Looking for server at:', serverPath);
console.log('📁 Server file exists:', fs.existsSync(serverPath));

// ניסיון טעינה
let app;
try {
  console.log('🔄 Attempting to load server...');
  app = require('../src/server');
  console.log('✅ Server loaded successfully!');
} catch (error) {
  console.error('❌ Failed to load server:', error.message);
  console.error('❌ Stack:', error.stack);
  
  // fallback - יצירת שרת בסיסי
  const express = require('express');
  const cors = require('cors');
  
  app = express();
  app.use(cors());
  app.use(express.json());
  
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'FALLBACK', 
      message: 'Fallback server running',
      error: error.message
    });
  });
  
  app.get('*', (req, res) => {
    res.status(500).json({ 
      error: 'Main server failed to load',
      details: error.message
    });
  });
}

module.exports = app;