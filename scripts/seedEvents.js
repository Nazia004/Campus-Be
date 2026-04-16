require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Club = require('../models/Club');
const User = require('../models/User');

// ── Image pools (category-based, no repeats within a pool) ─────────────────
const IMAGES = {
  tech: [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
  ],
  music: [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
  ],
  sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=800',
    'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800',
  ],
  seminar: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    'https://images.unsplash.com/photo-1560439514-4e9645039924?w=800',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
  ],
};

const lastUsed = { tech: -1, music: -1, sports: -1, seminar: -1 };

function pickImage(category) {
  const pool = IMAGES[category];
  let idx;
  do { idx = Math.floor(Math.random() * pool.length); } while (idx === lastUsed[category] && pool.length > 1);
  lastUsed[category] = idx;
  return pool[idx];
}

function detectCategory(title) {
  const t = title.toLowerCase();
  if (/hackathon|coding|code|tech|web|app|cloud|cyber|blockchain|linux|robot|flutter|data|ai|ml|ui|ux|science/.test(t)) return 'tech';
  if (/music|fest|cultural|open mic|drama|theatre|art/.test(t))  return 'music';
  if (/tournament|sports|badminton|basketball|football|volleyball|cricket|athletics|table tennis|chess|championship|game|league/.test(t)) return 'sports';
  return 'seminar';
}

const EVENT_TEMPLATES = [
  // Tech Clubs (Coding Club, GDG, Cyber Security, Science)
  { clubRef: 'Coding Club', title: 'National Hackathon 2025', description: 'A 24-hour coding hackathon open to all students.', venue: 'Innovation Lab', time: '9:00 AM' },
  { clubRef: 'GDG', title: 'Web Dev Workshop', description: 'Hands-on workshop covering React and Node.js basics.', venue: 'CS Seminar Hall', time: '10:00 AM' },
  { clubRef: 'Cyber Security Club', title: 'Cybersecurity Bootcamp', description: 'Learn ethical hacking and network security fundamentals.', venue: 'Lab Block 2', time: '9:30 AM' },
  { clubRef: 'Coding Club', title: 'Coding Contest — Round 1', description: 'Competitive programming contest with cash prizes.', venue: 'Computer Lab 3', time: '2:00 PM' },
  { clubRef: 'GDG', title: 'Flutter App Dev Workshop', description: 'Build your first cross-platform mobile app with Flutter.', venue: 'CS Lab 1', time: '10:00 AM' },
  { clubRef: 'GDG', title: 'Cloud Computing Workshop', description: 'Introduction to AWS and Azure for beginners.', venue: 'CS Seminar Hall', time: '10:30 AM' },
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
        image:         pickImage(detectCategory(t.title)),
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
