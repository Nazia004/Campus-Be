require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');

// ── Dummy IDs ────────────────────────────────────────────────────────────────
const CLUB_IDS = [
  '665f1a2b3c4d5e6f7a8b9c01',
  '665f1a2b3c4d5e6f7a8b9c02',
  '665f1a2b3c4d5e6f7a8b9c03',
  '665f1a2b3c4d5e6f7a8b9c04',
  '665f1a2b3c4d5e6f7a8b9c05',
].map((id) => new mongoose.Types.ObjectId(id));

const CREATED_BY = new mongoose.Types.ObjectId('665f1a2b3c4d5e6f7a8b9c00');

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

// Tracks last used index per category to avoid consecutive repeats
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
  if (/music|fest|cultural|open mic|drama|theatre/.test(t))  return 'music';
  if (/tournament|sports|badminton|chess|championship|game/.test(t)) return 'sports';
  return 'seminar';
}

// ── Event templates ──────────────────────────────────────────────────────────
const TEMPLATES = [
  { title: 'National Hackathon 2025',         description: 'A 24-hour coding hackathon open to all students.',          venue: 'Innovation Lab',      time: '9:00 AM'  },
  { title: 'Web Dev Workshop',                description: 'Hands-on workshop covering React and Node.js basics.',       venue: 'CS Seminar Hall',     time: '10:00 AM' },
  { title: 'Inter-College Tournament',        description: 'Sports tournament featuring football and basketball.',       venue: 'Sports Complex',      time: '8:00 AM'  },
  { title: 'AI/ML Seminar',                   description: 'Expert talk on the latest trends in AI and machine learning.', venue: 'Auditorium A',     time: '11:00 AM' },
  { title: 'Coding Contest — Round 1',        description: 'Competitive programming contest with cash prizes.',          venue: 'Computer Lab 3',     time: '2:00 PM'  },
  { title: 'Annual Music Fest',               description: 'Live performances by student bands and solo artists.',       venue: 'Open Air Theatre',   time: '5:00 PM'  },
  { title: 'Debate Competition',              description: 'Parliamentary-style debate on current affairs.',             venue: 'Seminar Room B',     time: '3:00 PM'  },
  { title: 'Cloud Computing Workshop',        description: 'Introduction to AWS and Azure for beginners.',               venue: 'CS Seminar Hall',     time: '10:30 AM' },
  { title: 'Startup Pitch Day',               description: 'Students pitch their startup ideas to a panel of judges.',   venue: 'Conference Hall',    time: '1:00 PM'  },
  { title: 'Photography Contest',             description: 'Submit your best campus shots and win prizes.',              venue: 'Art Gallery',        time: '9:00 AM'  },
  { title: 'Cybersecurity Bootcamp',          description: 'Learn ethical hacking and network security fundamentals.',   venue: 'Lab Block 2',        time: '9:30 AM'  },
  { title: 'Cultural Night',                  description: 'A celebration of diverse cultures through dance and music.', venue: 'Main Auditorium',    time: '6:00 PM'  },
  { title: 'Data Science Seminar',            description: 'Deep dive into data analysis and visualization tools.',      venue: 'Auditorium B',       time: '11:30 AM' },
  { title: 'Open Mic Night',                  description: 'Share your poetry, comedy, or music with the campus.',       venue: 'Student Lounge',     time: '7:00 PM'  },
  { title: 'Resume Building Workshop',        description: 'Tips and tricks to craft an industry-ready resume.',         venue: 'Placement Cell',     time: '2:30 PM'  },
  { title: 'Robotics Challenge',              description: 'Build and race autonomous robots in a timed challenge.',     venue: 'Robotics Lab',       time: '10:00 AM' },
  { title: 'Inter-Dept Quiz Competition',     description: 'General knowledge and technical quiz for all departments.',  venue: 'Seminar Hall C',     time: '3:30 PM'  },
  { title: 'Flutter App Dev Workshop',        description: 'Build your first cross-platform mobile app with Flutter.',   venue: 'CS Lab 1',           time: '10:00 AM' },
  { title: 'Entrepreneurship Summit',         description: 'Panel discussion with successful alumni entrepreneurs.',     venue: 'Conference Hall',    time: '12:00 PM' },
  { title: 'Chess Tournament',                description: 'Individual and team chess competition for all skill levels.', venue: 'Recreation Room',   time: '9:00 AM'  },
  { title: 'Blockchain Workshop',             description: 'Introduction to blockchain technology and smart contracts.',  venue: 'CS Seminar Hall',    time: '11:00 AM' },
  { title: 'Drama & Theatre Fest',            description: 'Annual theatre festival featuring original student plays.',   venue: 'Main Auditorium',   time: '5:30 PM'  },
  { title: 'Linux & Open Source Day',         description: 'Explore the world of open-source software and Linux.',       venue: 'Lab Block 1',        time: '10:00 AM' },
  { title: 'Career Guidance Seminar',         description: 'Industry experts share insights on career paths and growth.', venue: 'Auditorium A',     time: '2:00 PM'  },
  { title: 'Badminton Championship',          description: 'Singles and doubles badminton tournament for students.',      venue: 'Indoor Stadium',    time: '8:30 AM'  },
  { title: 'UI/UX Design Workshop',           description: 'Learn Figma and design principles for modern interfaces.',   venue: 'Design Studio',      time: '11:00 AM' },
  { title: 'Science Exhibition',             description: 'Students showcase innovative science projects and models.',   venue: 'Exhibition Hall',    time: '10:00 AM' },
  { title: 'Mock Interview Drive',            description: 'Practice technical and HR interviews with industry mentors.', venue: 'Placement Cell',    time: '9:00 AM'  },
  { title: 'Environment Awareness Walk',      description: 'Campus walk to promote sustainability and green practices.',  venue: 'Campus Ground',     time: '7:00 AM'  },
  { title: 'Annual Sports Day',               description: 'Track and field events, relay races, and team sports.',      venue: 'Sports Complex',     time: '8:00 AM'  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const futureDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
};

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Event.deleteMany({});
  console.log('Cleared existing events');

  const events = TEMPLATES.map((t, i) => ({
    title:         t.title,
    description:   t.description,
    date:          futureDate(i + 1),
    time:          t.time,
    venue:         t.venue,
    club:          rand(CLUB_IDS),
    createdBy:     CREATED_BY,
    registrations: [],
    image:         pickImage(detectCategory(t.title)),
  }));

  await Event.insertMany(events);
  console.log('30 events inserted');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
