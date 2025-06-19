const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

const getUsers = async () => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'users.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveUsers = async (users) => {
  await fs.writeFile(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));
};

const getShifts = async () => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'shifts.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveShifts = async (shifts) => {
  await fs.writeFile(path.join(DATA_DIR, 'shifts.json'), JSON.stringify(shifts, null, 2));
};

const getAvailability = async () => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'availability.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveAvailability = async (availability) => {
  await fs.writeFile(path.join(DATA_DIR, 'availability.json'), JSON.stringify(availability, null, 2));
};

module.exports = {
  getUsers,
  saveUsers,
  getShifts,
  saveShifts,
  getAvailability,
  saveAvailability
};
