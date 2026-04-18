require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Club = require('../models/Club');
const User = require('../models/User');

const EVENT_IMAGE_MAP = {
  // Technical
  'Coding Club': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
  'Cyber Security Club': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop',
  'Google Developer Groups': 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=400&fit=crop',
  'Sir C.V. Raman Science Club': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop',

  // Cultural
  'Anubhuti Dramatic Club': 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&h=400&fit=crop',
  'Art Club': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=400&fit=crop',
  'Music/Band Club': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=400&fit=crop',
  'Atithya Club': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop',

  // Academic & Professional
  'Agriverse': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop',
  'Marketing Club': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop',

  // Sports
  'Badminton Club': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=400&fit=crop',
  'Basketball Club': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop',
  'Football Club': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=400&fit=crop',
  'Volleyball Club': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop',
  'Cricket Club': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop',
  'Athletics Club': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop',
  'Table Tennis Club': 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&h=400&fit=crop',

  // Social & Environmental
  'NSS': 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=400&fit=crop',
  'Net Zero Club': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop',
  
  // General fallback
  'General': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
};

const EVENT_TEMPLATES = [
  // Tech Clubs (Coding Club, GDG, Cyber Security, Science)
  { clubRef: 'Coding Club', title: 'National Hackathon 2025', description: 'A 24-hour coding hackathon open to all students.', venue: 'Innovation Lab', time: '9:00 AM' },
  { clubRef: 'Google Developer Groups', title: 'Web Dev Workshop', description: 'Hands-on workshop covering React and Node.js basics.', venue: 'CS Seminar Hall', time: '10:00 AM' },
  { clubRef: 'Cyber Security Club', title: 'Cybersecurity Bootcamp', description: 'Learn ethical hacking and network security fundamentals.', venue: 'Lab Block 2', time: '9:30 AM' },
  { clubRef: 'Coding Club', title: 'Coding Contest — Round 1', description: 'Competitive programming contest with cash prizes.', venue: 'Computer Lab 3', time: '2:00 PM' },
  { clubRef: 'Google Developer Groups', title: 'Flutter App Dev Workshop', description: 'Build your first cross-platform mobile app with Flutter.', venue: 'CS Lab 1', time: '10:00 AM' },
  { clubRef: 'Google Developer Groups', title: 'Cloud Computing Workshop', description: 'Introduction to AWS and Azure for beginners.', venue: 'CS Seminar Hall', time: '10:30 AM' },
  { clubRef: 'Coding Club', title: 'Data Science Seminar', description: 'Deep dive into data analysis and visualization tools.', venue: 'Auditorium B', time: '11:30 AM' },
  { clubRef: 'Cyber Security Club', title: 'Blockchain Workshop', description: 'Introduction to blockchain technology and smart contracts.', venue: 'CS Seminar Hall', time: '11:00 AM' },
  { clubRef: 'Sir C.V. Raman Science Club', title: 'Science Exhibition', description: 'Students showcase innovative science projects and models.', venue: 'Exhibition Hall', time: '10:00 AM' },
  { clubRef: 'Sir C.V. Raman Science Club', title: 'Robotics Challenge', description: 'Build and race autonomous robots in a timed challenge.', venue: 'Robotics Lab', time: '10:00 AM' },
  { clubRef: 'Coding Club', title: 'Linux & Open Source Day', description: 'Explore the world of open-source software and Linux.', venue: 'Lab Block 1', time: '10:00 AM' },

  // Cultural Clubs (Anubhuti, Music, Art, Atithya)
  { clubRef: 'Anubhuti Dramatic Club', title: 'Drama & Theatre Fest', description: 'Annual theatre festival featuring original student plays.', venue: 'Main Auditorium', time: '5:30 PM' },
  { clubRef: 'Music/Band Club', title: 'Annual Music Fest', description: 'Live performances by student bands and solo artists.', venue: 'Open Air Theatre', time: '5:00 PM' },
  { clubRef: 'Music/Band Club', title: 'Open Mic Night', description: 'Share your poetry, comedy, or music with the campus.', venue: 'Student Lounge', time: '7:00 PM' },
  { clubRef: 'Anubhuti Dramatic Club', title: 'Cultural Night', description: 'A celebration of diverse cultures through dance and music.', venue: 'Main Auditorium', time: '6:00 PM' },
  { clubRef: 'Art Club', title: 'Photography Contest', description: 'Submit your best campus shots and win prizes.', venue: 'Art Gallery', time: '9:00 AM' },
  { clubRef: 'Art Club', title: 'UI/UX Design Workshop', description: 'Learn Figma and design principles for modern interfaces.', venue: 'Design Studio', time: '11:00 AM' },
  { clubRef: 'Atithya Club', title: 'Inter-Dept Quiz Competition', description: 'General knowledge and technical quiz for all departments.', venue: 'Seminar Hall C', time: '3:30 PM' },

  // Academic & Marketing
  { clubRef: 'Marketing Club', title: 'Entrepreneurship Summit', description: 'Panel discussion with successful alumni entrepreneurs.', venue: 'Conference Hall', time: '12:00 PM' },
  { clubRef: 'Marketing Club', title: 'Startup Pitch Day', description: 'Students pitch their startup ideas to a panel of judges.', venue: 'Conference Hall', time: '1:00 PM' },
  { clubRef: 'Marketing Club', title: 'Debate Competition', description: 'Parliamentary-style debate on current affairs.', venue: 'Seminar Room B', time: '3:00 PM' },

  // Sports Teams
  { clubRef: 'Basketball Club', title: 'Inter-College Basketball Tournament', description: 'Sports tournament featuring visiting college teams.', venue: 'Sports Complex', time: '8:00 AM' },
  { clubRef: 'Badminton Club', title: 'Badminton Championship', description: 'Singles and doubles badminton tournament for students.', venue: 'Indoor Stadium', time: '8:30 AM' },
  { clubRef: 'Football Club', title: 'Football Inter-Department League', description: 'Cheer for your department in the grand football league.', venue: 'Main Ground', time: '4:00 PM' },
  { clubRef: 'Volleyball Club', title: 'Volleyball Practice Match', description: 'Open practice and selection rounds for the university team.', venue: 'Volleyball Court', time: '5:00 PM' },
  { clubRef: 'Cricket Club', title: 'Cricket T20 Campus Cup', description: 'Annual cricket tournament with students and faculty.', venue: 'Cricket Stadium', time: '9:00 AM' },
  { clubRef: 'Athletics Club', title: 'Annual Track & Field Sports Day', description: 'Track and field events, relay races, and marathons.', venue: 'Sports Complex', time: '6:30 AM' },
  { clubRef: 'Table Tennis Club', title: 'Table Tennis Singles Championship', description: 'Knockout table tennis tournament with cash rewards.', venue: 'Indoor Sports Room', time: '10:00 AM' },
  { clubRef: 'Athletics Club', title: 'Campus Marathon', description: 'A 5km run across the campus to promote health and fitness.', venue: 'Main Gate', time: '6:00 AM' },

  // Social & Environmental
  { clubRef: 'NSS', title: 'Environment Awareness Walk', description: 'Campus walk to promote sustainability and green practices.', venue: 'Campus Ground', time: '7:00 AM' },
  { clubRef: 'Net Zero Club', title: 'Tree Plantation Drive', description: 'Join us to plant 100+ saplings around the university campus.', venue: 'North Campus', time: '8:00 AM' },
  { clubRef: 'NSS', title: 'Blood Donation Camp', description: 'Annual blood donation drive in collaboration with City Hospital.', venue: 'Student Center', time: '9:30 AM' },
  { clubRef: 'Net Zero Club', title: 'Sustainability Workshop', description: 'Guest lecture on reducing carbon footprint in daily life.', venue: 'Auditorium C', time: '2:00 PM' },

  // General/Placement related
  { clubRef: 'General', title: 'Career Guidance Seminar', description: 'Industry experts share insights on career paths and growth.', venue: 'Auditorium A', time: '2:00 PM' },
  { clubRef: 'General', title: 'Resume Building Workshop', description: 'Tips and tricks to craft an industry-ready resume.', venue: 'Placement Cell', time: '2:30 PM' },
  { clubRef: 'General', title: 'Mock Interview Drive', description: 'Practice technical and HR interviews with industry mentors.', venue: 'Placement Cell', time: '9:00 AM' },
];

const futureDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Delete all old events
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');

    // 2. Fetch all clubs from DB
    const clubsInDb = await Club.find({});
    
    // Find creator
    let creator = await User.findOne({ role: 'admin' }) || await User.findOne({ role: 'club' }) || await User.findOne({});
    if (!creator) throw new Error("No users found to set as event creator");

    const eventsToInsert = [];
    
    EVENT_TEMPLATES.forEach((t, i) => {
      // Find matching club dynamically
      let matchingClub = null;
      if (t.clubRef !== 'General') {
        matchingClub = clubsInDb.find(c => c.name.toLowerCase().includes(t.clubRef.toLowerCase()));
      }
      // If we don't find a matching club, we assign a random one from DB (or leave null if needed, but schema wants a club ID ideally)
      const clubId = matchingClub ? matchingClub._id : clubsInDb[Math.floor(Math.random() * clubsInDb.length)]._id;

      eventsToInsert.push({
        title:         t.title,
        description:   t.description,
        date:          futureDate(i + 1), // Spread them out day by day
        time:          t.time,
        venue:         t.venue,
        club:          clubId,
        createdBy:     creator._id,
        registrations: [],
        image:         EVENT_IMAGE_MAP[t.clubRef] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
      });
    });

    // 3. Insert new events
    await Event.insertMany(eventsToInsert);
    console.log(`✅ Successfully seeded ${eventsToInsert.length} events tailored to the new sports and cultural clubs!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
