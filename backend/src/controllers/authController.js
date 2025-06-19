const dataService = require('../services/dataService');

const login = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'נדרש מספר טלפון' });
    }
    
    const users = await dataService.getUsers();
    console.log('Users loaded:', users.length);
    
    const user = users.find(u => u.phone === phone);
    console.log('User found:', user);

    if (!user) {
      return res.status(404).json({ error: 'משתמש לא נמצא' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

const getMe = async (req, res) => {
  res.json({ message: 'Not implemented yet' });
};

module.exports = { login, getMe };