require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Club = require('../models/Club');
const User = require('../models/User');

const EVENT_TEMPLATES = [
  // Tech Clubs
  { 
    clubRef: 'Coding Club', 
    title: 'National Hackathon 2025', 
    description: 'A 24-hour coding hackathon open to all students.', 
    venue: 'Innovation Lab', 
    time: '9:00 AM',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Google Developer Groups', 
    title: 'Web Dev Workshop', 
    description: 'Hands-on workshop covering React and Node.js basics.', 
    venue: 'CS Seminar Hall', 
    time: '10:00 AM',
    image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Cyber Security Club', 
    title: 'Cybersecurity Bootcamp', 
    description: 'Learn ethical hacking and network security fundamentals.', 
    venue: 'Lab Block 2', 
    time: '9:30 AM',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Coding Club', 
    title: 'Coding Contest — Round 1', 
    description: 'Competitive programming contest with cash prizes.', 
    venue: 'Computer Lab 3', 
    time: '2:00 PM',
    image: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Google Developer Groups', 
    title: 'Flutter App Dev Workshop', 
    description: 'Build your first cross-platform mobile app with Flutter.', 
    venue: 'CS Lab 1', 
    time: '10:00 AM',
    image: 'https://images.unsplash.com/photo-1522252234503-e356532cafd5?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Google Developer Groups', 
    title: 'Cloud Computing Workshop', 
    description: 'Introduction to AWS and Azure for beginners.', 
    venue: 'CS Seminar Hall', 
    time: '10:30 AM',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Coding Club', 
    title: 'Data Science Seminar', 
    description: 'Deep dive into data analysis and visualization tools.', 
    venue: 'Auditorium B', 
    time: '11:30 AM',
    image: 'https://images.unsplash.com/photo-1551288049-bbda38a594a0?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Cyber Security Club', 
    title: 'Blockchain Workshop', 
    description: 'Introduction to blockchain technology and smart contracts.', 
    venue: 'CS Seminar Hall', 
    time: '11:00 AM',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Sir C.V. Raman Science Club', 
    title: 'Science Exhibition', 
    description: 'Students showcase innovative science projects and models.', 
    venue: 'Exhibition Hall', 
    time: '10:00 AM',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Sir C.V. Raman Science Club', 
    title: 'Robotics Challenge', 
    description: 'Build and race autonomous robots in a timed challenge.', 
    venue: 'Robotics Lab', 
    time: '10:00 AM',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Coding Club', 
    title: 'Linux & Open Source Day', 
    description: 'Explore the world of open-source software and Linux.', 
    venue: 'Lab Block 1', 
    time: '10:00 AM',
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=400&fit=crop'
  },

  // Cultural Clubs
  { 
    clubRef: 'Anubhuti Dramatic Club', 
    title: 'Drama & Theatre Fest', 
    description: 'Annual theatre festival featuring original student plays.', 
    venue: 'Main Auditorium', 
    time: '5:30 PM',
    image: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Music/Band Club', 
    title: 'Annual Music Fest', 
    description: 'Live performances by student bands and solo artists.', 
    venue: 'Open Air Theatre', 
    time: '5:00 PM',
    image: 'https://images.unsplash.com/photo-1459746244111-7504bf5292ceea?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Music/Band Club', 
    title: 'Open Mic Night', 
    description: 'Share your poetry, comedy, or music with the campus.', 
    venue: 'Student Lounge', 
    time: '7:00 PM',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Anubhuti Dramatic Club', 
    title: 'Cultural Night', 
    description: 'A celebration of diverse cultures through dance and music.', 
    venue: 'Main Auditorium', 
    time: '6:00 PM',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Art Club', 
    title: 'Photography Contest', 
    description: 'Submit your best campus shots and win prizes.', 
    venue: 'Art Gallery', 
    time: '9:00 AM',
    image: 'https://images.unsplash.com/photo-1502982722880-0e86cb68249a?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Art Club', 
    title: 'UI/UX Design Workshop', 
    description: 'Learn Figma and design principles for modern interfaces.', 
    venue: 'Design Studio', 
    time: '11:00 AM',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Atithya Club', 
    title: 'Inter-Dept Quiz Competition', 
    description: 'General knowledge and technical quiz for all departments.', 
    venue: 'Seminar Hall C', 
    time: '3:30 PM',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop'
  },

  // Academic & Marketing
  { 
    clubRef: 'Marketing Club', 
    title: 'Entrepreneurship Summit', 
    description: 'Panel discussion with successful alumni entrepreneurs.', 
    venue: 'Conference Hall', 
    time: '12:00 PM',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Marketing Club', 
    title: 'Startup Pitch Day', 
    description: 'Students pitch their startup ideas to a panel of judges.', 
    venue: 'Conference Hall', 
    time: '1:00 PM',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Marketing Club', 
    title: 'Debate Competition', 
    description: 'Parliamentary-style debate on current affairs.', 
    venue: 'Seminar Room B', 
    time: '3:00 PM',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e443d1fe?w=800&h=400&fit=crop'
  },

  // Sports Teams
  { 
    clubRef: 'Basketball Club', 
    title: 'Inter-College Basketball Tournament', 
    description: 'Sports tournament featuring visiting college teams.', 
    venue: 'Sports Complex', 
    time: '8:00 AM',
    image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Badminton Club', 
    title: 'Badminton Championship', 
    description: 'Singles and doubles badminton tournament for students.', 
    venue: 'Indoor Stadium', 
    time: '8:30 AM',
    image: 'https://images.unsplash.com/photo-1613918431703-aa49219ea2a1?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Football Club', 
    title: 'Football Inter-Department League', 
    description: 'Cheer for your department in the grand football league.', 
    venue: 'Main Ground', 
    time: '4:00 PM',
    image: 'https://images.unsplash.com/photo-1510567198184-8124bb82ded9?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Volleyball Club', 
    title: 'Volleyball Practice Match', 
    description: 'Open practice and selection rounds for the university team.', 
    venue: 'Volleyball Court', 
    time: '5:00 PM',
    image: 'https://images.unsplash.com/photo-1592656094267-764a451195b5?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Cricket Club', 
    title: 'Cricket T20 Campus Cup', 
    description: 'Annual cricket tournament with students and faculty.', 
    venue: 'Cricket Stadium', 
    time: '9:00 AM',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Athletics Club', 
    title: 'Annual Track & Field Sports Day', 
    description: 'Track and field events, relay races, and marathons.', 
    venue: 'Sports Complex', 
    time: '6:30 AM',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Table Tennis Club', 
    title: 'Table Tennis Singles Championship', 
    description: 'Knockout table tennis tournament with cash rewards.', 
    venue: 'Indoor Sports Room', 
    time: '10:00 AM',
    image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Athletics Club', 
    title: 'Campus Marathon', 
    description: 'A 5km run across the campus to promote health and fitness.', 
    venue: 'Main Gate', 
    time: '6:00 AM',
    image: 'https://images.unsplash.com/photo-1452626012836-439f6888651b?w=800&h=400&fit=crop'
  },

  // Social & Environmental
  { 
    clubRef: 'NSS', 
    title: 'Environment Awareness Walk', 
    description: 'Campus walk to promote sustainability and green practices.', 
    venue: 'Campus Ground', 
    time: '7:00 AM',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Net Zero Club', 
    title: 'Tree Plantation Drive', 
    description: 'Join us to plant 100+ saplings around the university campus.', 
    venue: 'North Campus', 
    time: '8:00 AM',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'NSS', 
    title: 'Blood Donation Camp', 
    description: 'Annual blood donation drive in collaboration with City Hospital.', 
    venue: 'Student Center', 
    time: '9:30 AM',
    image: 'https://images.unsplash.com/photo-1615461066841-6116ecaabb04?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'Net Zero Club', 
    title: 'Sustainability Workshop', 
    description: 'Guest lecture on reducing carbon footprint in daily life.', 
    venue: 'Auditorium C', 
    time: '2:00 PM',
    image: 'https://images.unsplash.com/photo-1518173946687-a4c8a9b749f5?w=800&h=400&fit=crop'
  },

  // General/Placement related
  { 
    clubRef: 'General', 
    title: 'Career Guidance Seminar', 
    description: 'Industry experts share insights on career paths and growth.', 
    venue: 'Auditorium A', 
    time: '2:00 PM',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'General', 
    title: 'Resume Building Workshop', 
    description: 'Tips and tricks to craft an industry-ready resume.', 
    venue: 'Placement Cell', 
    time: '2:30 PM',
    image: 'https://images.unsplash.com/photo-1507679799987-c7377ec486b8?w=800&h=400&fit=crop'
  },
  { 
    clubRef: 'General', 
    title: 'Mock Interview Drive', 
    description: 'Practice technical and HR interviews with industry mentors.', 
    venue: 'Placement Cell', 
    time: '9:00 AM',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2923216?w=800&h=400&fit=crop'
  },
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

    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');

    const clubsInDb = await Club.find({});
    
    let creator = await User.findOne({ role: 'admin' }) || await User.findOne({ role: 'club' }) || await User.findOne({});
    if (!creator) throw new Error("No users found to set as event creator");

    const eventsToInsert = [];
    
    EVENT_TEMPLATES.forEach((t, i) => {
      let matchingClub = null;
      if (t.clubRef !== 'General') {
        matchingClub = clubsInDb.find(c => c.name.toLowerCase().includes(t.clubRef.toLowerCase()));
      }
      const clubId = matchingClub ? matchingClub._id : (clubsInDb.length > 0 ? clubsInDb[Math.floor(Math.random() * clubsInDb.length)]._id : null);

      eventsToInsert.push({
        title:         t.title,
        description:   t.description,
        date:          futureDate(i + 1),
        time:          t.time,
        venue:         t.venue,
        club:          clubId,
        createdBy:     creator._id,
        registrations: [],
        image:         t.image
      });
    });

    await Event.insertMany(eventsToInsert);
    console.log(`✅ Successfully seeded ${eventsToInsert.length} events with 100% UNIQUE images!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
