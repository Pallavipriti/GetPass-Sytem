import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import connectDB from './src/config/db.js';

dotenv.config();
connectDB();

const seedUsers = async () => {
  try {
    await User.deleteMany();
    
    const users = [
      {
        name: 'Admin User',
        email: 'admin@gatepass.com',
        password: 'admin123',
        role: 'admin',
        phone: '1234567890',
      },
      {
        name: 'Gate Guard',
        email: 'guard@gatepass.com',
        password: 'guard123',
        role: 'guard',
        phone: '1234567891',
      },
      {
        name: 'John Resident',
        email: 'resident@gatepass.com',
        password: 'resident123',
        role: 'resident',
        phone: '1234567892',
        apartmentNo: 'A-101',
      },
    ];
    
    await User.insertMany(users);
    console.log('Users seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();