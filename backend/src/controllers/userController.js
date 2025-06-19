const dataService = require('../services/dataService');

const getUsers = async (req, res) => {
  try {
    const users = await dataService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, phone, role } = req.body;
    const users = await dataService.getUsers();

    const newUser = {
      id: Date.now().toString(),
      name,
      phone,
      role: role || 'soldier'
    };

    users.push(newUser);
    await dataService.saveUsers(users);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

module.exports = { getUsers, createUser };
