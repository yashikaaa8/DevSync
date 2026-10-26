// ==============================================================================
// Database Seeder (backend/seed.js)
// Populates MongoDB with realistic campus clubs for demo & testing
// Run via: npm run seed
// ==============================================================================

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Club = require('./models/Club');
const Membership = require('./models/Membership');

const sampleClubs = [
  {
    name: 'ByteCrafters Coding Club',
    description: 'A student developer community dedicated to competitive programming, web development, open-source contributions, and hackathons.',
    category: 'Technology & Coding',
    president: 'Aarav Sharma',
    meetingDay: 'Wednesday',
    meetingTime: '5:00 PM - 6:30 PM'
  },
  {
    name: 'RoboKnights Robotics Society',
    description: 'Hands-on hardware club exploring embedded systems, Arduino, Raspberry Pi, robotics design, and inter-college combat bot competitions.',
    category: 'Technology & Coding',
    president: 'Priya Patel',
    meetingDay: 'Friday',
    meetingTime: '4:30 PM - 6:00 PM'
  },
  {
    name: 'Rhythm & Beats Dance Troupe',
    description: 'The premier collegiate dance society covering contemporary, hip-hop, classical fusion, and street dance performances across campus fests.',
    category: 'Cultural & Performing Arts',
    president: 'Sneha Roy',
    meetingDay: 'Tuesday',
    meetingTime: '5:30 PM - 7:00 PM'
  },
  {
    name: 'Stride & Spike Athletics Club',
    description: 'Fostering campus fitness, intramural tournaments, marathon training, basketball leagues, and recreational athletics for all students.',
    category: 'Sports & Fitness',
    president: 'Rohan Verma',
    meetingDay: 'Saturday',
    meetingTime: '7:00 AM - 9:00 AM'
  },
  {
    name: 'Veritas Debate & Literary Guild',
    description: 'Encouraging critical thinking, Parliamentary debate, model United Nations conferences, public speaking workshops, and literary publications.',
    category: 'Academic & Research',
    president: 'Ananya Iyer',
    meetingDay: 'Monday',
    meetingTime: '4:00 PM - 5:30 PM'
  },
  {
    name: 'EcoWarriors Green Campus Initiative',
    description: 'Student-led environmental sustainability group organizing tree plantation drives, e-waste recycling, cleanliness audits, and climate talks.',
    category: 'Social Service & Environment',
    president: 'Vikram Joshi',
    meetingDay: 'Thursday',
    meetingTime: '4:00 PM - 5:00 PM'
  }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing clubs and memberships in database...');
    try {
      await mongoose.connection.collection('clubs').drop();
    } catch (err) {
      // Collection might not exist yet; safe to ignore
    }
    try {
      await mongoose.connection.collection('memberships').drop();
    } catch (err) {
      // safe to ignore
    }

    console.log('[Seed] Inserting sample campus clubs...');
    const createdClubs = await Club.insertMany(sampleClubs);

    console.log(`[Seed] Successfully inserted ${createdClubs.length} campus clubs!`);
    createdClubs.forEach((club, index) => {
      console.log(`   ${index + 1}. [${club.category}] ${club.name} (President: ${club.president})`);
    });

    if (createdClubs.length > 0) {
      await Membership.create([
        {
          clubId: createdClubs[0]._id,
          studentName: 'Dev Patel',
          studentId: 'STU202401',
          email: 'dev.patel@campus.edu'
        },
        {
          clubId: createdClubs[0]._id,
          studentName: 'Isha Mehra',
          studentId: 'STU202402',
          email: 'isha.mehra@campus.edu'
        }
      ]);
      console.log('[Seed] Added sample memberships for ByteCrafters Coding Club.');
    }

    console.log('[Seed] Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

seedData();
