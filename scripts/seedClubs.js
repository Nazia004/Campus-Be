/**
 * Seeds the database with the actual campus clubs.
 * Replaces ALL existing clubs with the new list.
 *
 * Usage: node scripts/seedClubs.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Club = require('../models/Club');
const User = require('../models/User');

const CLUBS = [
  // Technical Clubs
  { name: 'Coding Club', category: 'Technical', description: 'A community for coding enthusiasts to practice competitive programming, build projects, and participate in hackathons.' },
  { name: 'Cyber Security Club', category: 'Technical', description: 'Explores cybersecurity concepts, ethical hacking, CTF challenges, and digital safety awareness.' },
  { name: 'Google Developer Groups (GDG on Campus)', category: 'Technical', description: 'A Google-supported developer community focusing on Google technologies, workshops, and developer events.' },
  { name: 'Sir C.V. Raman Science Club', category: 'Technical', description: 'Promotes scientific temper through experiments, science exhibitions, guest lectures, and research discussions.' },

  // Cultural Clubs
  { name: 'Anubhuti Dramatic Club', category: 'Cultural', description: 'A platform for theatre lovers to showcase acting, directing, and scriptwriting talent through plays and skits.' },
  { name: 'Art Club', category: 'Cultural', description: 'For creative minds passionate about painting, sketching, digital art, and visual storytelling.' },
  { name: 'Music/Band Club', category: 'Cultural', description: 'A band club for music enthusiasts who play instruments, sing, and perform at campus events and fests.' },
  { name: 'Atithya Club', category: 'Cultural', description: 'Focuses on hospitality, event management, and cultural celebrations to foster campus community spirit.' },

  // Academic & Professional Clubs
  { name: 'Agriverse', category: 'Academic & Professional', description: 'Agriculture and Allied Sciences club that bridges academic knowledge with real-world agricultural innovation.' },
  { name: 'Marketing Club', category: 'Academic & Professional', description: 'Develops marketing skills through case studies, brand campaigns, workshops, and industry interactions.' },

  // Sports Clubs
  { name: 'Badminton Club', category: 'Sports', description: 'Open to boys and girls — organizes badminton tournaments, coaching sessions, and inter-college competitions.' },
  { name: 'Basketball Club', category: 'Sports', description: 'Open to boys and girls — trains students, organizes matches, and represents the campus in basketball tournaments.' },
  { name: 'Football Club', category: 'Sports', description: 'For football enthusiasts — regular practice sessions, intra-college leagues, and inter-college tournaments.' },
  { name: 'Volleyball Club', category: 'Sports', description: 'Open to boys and girls — organizes volleyball tournaments, practice matches, and team events.' },
  { name: 'Cricket Club', category: 'Sports', description: 'For cricket enthusiasts — regular net practice, intra-college leagues, and inter-college tournaments.' },
  { name: 'Athletics Club', category: 'Sports', description: 'Focuses on track and field events, marathons, fitness training, and relay sports.' },
  { name: 'Table Tennis Club', category: 'Sports', description: 'Indoor sports club for table tennis players of all skill levels, featuring casual play and formal tournaments.' },

  // Social & Environmental Clubs
  { name: 'NSS (National Service Scheme)', category: 'Social & Environmental', description: 'A government-backed initiative for community service, social awareness drives, and rural development programs.' },
  { name: 'Net Zero Club', category: 'Social & Environmental', description: 'Focuses on environment and sustainability — tree planting, waste management, carbon footprint awareness, and green campus initiatives.' },
];

async function seedClubs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find an admin or club-role user to set as createdBy
    let creator = await User.findOne({ role: 'admin' });
    if (!creator) {
      creator = await User.findOne({ role: 'club' });
    }
    if (!creator) {
      creator = await User.findOne({});
    }
    if (!creator) {
      console.error('❌ No users found in database. Please create at least one user first.');
      process.exit(1);
    }
    console.log(`📌 Using creator: ${creator.name} (${creator.role})`);

    // Delete all existing clubs
    const deleted = await Club.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing clubs`);

    // Insert new clubs
    const clubDocs = CLUBS.map(c => ({
      ...c,
      createdBy: creator._id,
      members: [],
    }));

    const inserted = await Club.insertMany(clubDocs);
    console.log(`\n✅ Successfully inserted ${inserted.length} clubs:\n`);

    // Print summary
    const categories = [...new Set(CLUBS.map(c => c.category))];
    for (const cat of categories) {
      const catClubs = inserted.filter(c => c.category === cat);
      console.log(`  📂 ${cat} (${catClubs.length})`);
      catClubs.forEach(c => console.log(`     • ${c.name}`));
    }

    console.log('\n🎉 Done!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedClubs();
