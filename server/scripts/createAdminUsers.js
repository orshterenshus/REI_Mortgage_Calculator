const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const bcrypt = require('bcrypt');

const users = [
  {
    username: 'or803803',
    password: 'Or207186156',
    firstName: 'אור',
    lastName: 'שטרנשוס',
    email: 'or803803@gmail.com',
    role: 'admin'
  },
  {
    username: 'admin',
    password: 'admin',
    firstName: 'admin',
    lastName: 'admin',
    email: 'admin@gmail.com',
    role: 'admin'
  }
];

async function createAdmins() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/apartment-calculator', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  for (const userData of users) {
    const existing = await User.findOne({ username: userData.username });
    if (existing) {
      console.log(`User ${userData.username} already exists.`);
      continue;
    }
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const user = new User({
      username: userData.username,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role
    });
    await user.save();
    console.log(`Created admin user: ${user.username}`);
  }
  await mongoose.disconnect();
  console.log('Done.');
}

createAdmins(); 