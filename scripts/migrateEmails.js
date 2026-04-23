const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrateEmails() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    const oldDomain = '@campuszone.co.in';
    const newDomain = '@campusync.co.in';

    // Find users with the old domain email
    const usersToUpdate = await User.find({ email: { $regex: `${oldDomain}$`, $options: 'i' } });
    
    console.log(`\nFound ${usersToUpdate.length} users to migrate.`);

    for (const user of usersToUpdate) {
      const newEmail = user.email.replace(oldDomain, newDomain);
      console.log(`🔄 Migrating: ${user.email} -> ${newEmail}`);
      
      // Check if the new email already exists to avoid unique constraint error
      const existing = await User.findOne({ email: newEmail });
      if (existing) {
        console.log(`  ⚠️  Skipping: ${newEmail} already exists.`);
        continue;
      }

      user.email = newEmail;
      // We use findOneAndUpdate to skip the pre-save hook and avoid rehashing passwords
      await User.updateOne({ _id: user._id }, { $set: { email: newEmail } });
      console.log(`  ✅ Success.`);
    }

    console.log('\n✨ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrateEmails();
