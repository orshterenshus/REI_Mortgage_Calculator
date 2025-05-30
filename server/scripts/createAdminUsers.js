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
  const uri = process.env.MONGO_URI || 'mongodb+srv://or803803:Aa123456@mortgageapp.y0bkyzu.mongodb.net/mortgageApp';
  console.log("Connecting to DB using URI (or fallback):", uri);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  for (const userData of users) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const userPlain = { username: userData.username, passwordHash, firstName: userData.firstName, lastName: userData.lastName, email: userData.email, role: userData.role };
    const result = await User.findOneAndUpdate({ username: userData.username }, userPlain, { upsert: true, new: true });
    console.log(`User ${userData.username} (${result._id}) upserted (inserted or updated).`);
  }
  await mongoose.disconnect();
  console.log('Done.');
}

createAdmins(); 