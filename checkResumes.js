require('dotenv').config();
const mongoose = require('mongoose');
const Placement = require('./models/Placement');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas...');
    
    // Find placements that have at least one applicant with a resumeUrl
    const placements = await Placement.find({ 'applicants.resumeUrl': { $exists: true, $ne: null } });
      
    if (placements.length === 0) {
      console.log('\nNo applications found yet. Once someone applies, they will show up here.');
    } else {
      require('fs').writeFileSync('output.json', JSON.stringify(placements, null, 2));
      console.log('Results saved to output.json');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected.');
  }
}

check();
