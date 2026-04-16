const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const users = [
  {
    name: 'System Admin',
    email: 'admin@campuszone.co.in',
    password: 'Admin@2025',
    role: 'admin'
  },
  {
    name: 'Student User',
    email: 'student@campuszone.co.in',
    password: 'Student@2025',
    role: 'student',
    rollNumber: 'CS2025001',
    department: 'Computer Science',
    year: 3
  },
  {
    name: 'Club Coordinator',
    email: 'club@campuszone.co.in',
    password: 'Club@2025',
    role: 'club'
  },
  {
    name: 'Placement Officer',
    email: 'placement@campuszone.co.in',
    password: 'Placement@2025',
    role: 'placement'
  }
];

async function seedUsers() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    for (const userData of users) {
      console.log(`\n🔄 Processing ${userData.role}: ${userData.email}`);
      
      // Delete existing user with this email to ensure "only these" access
      await User.deleteOne({ email: userData.email });
      console.log(`  - Removed existing account.`);

      // Create new user (Mongoose hook will hash the password)
      const user = new User(userData);
      await user.save();
      console.log(`  - Successfully seeded new account.`);
    }

    console.log('\n✨ All master users seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedUsers();
