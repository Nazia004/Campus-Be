require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const userId = new mongoose.Types.ObjectId();
    
    console.log("Testing aggregate...");
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
          isRegistered: { $in: [userId, { $ifNull: ['$registrations', []] }] },
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
