require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

(async () => {
  try {
    const uri = 'mongodb+srv://naziaquadri67:TusQ5ZqT6m6e1P5m@cluster0.imv5lyx.mongodb.net/campus_hub';
    await mongoose.connect(uri);
    
    console.log("Connected to campus_hub database!");
    
    const user = await User.findOne({ email: 'stu1@student.com' });
    if (!user) {
        console.log("Test user not found!");
        process.exit(1);
    }
    console.log("Testing aggregate for user", user._id);
    
    const data = await Event.aggregate([
      {
        $lookup: {
          from: 'clubs',
          localField: 'club',
          foreignField: '_id',
          as: 'clubInfo'
        }
      },
      { $unwind: { path: '$clubInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          registrationCount: { $size: { $ifNull: ['$registrations', []] } },
          isRegistered: { $in: [user._id, { $ifNull: ['$registrations', []] }] },
          club: { _id: '$clubInfo._id', name: '$clubInfo.name' },
          createdBy: { _id: '$creator._id', name: '$creator.name' }
        }
      },
      { $project: { registrations: 0, clubInfo: 0, creator: 0 } },
      { $sort: { date: 1 } }
    ]);
    
    console.log("Success! Returned " + data.length + " events.");
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
