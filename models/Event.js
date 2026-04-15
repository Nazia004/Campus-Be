const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  date: { type: Date, required: true, index: true },
  time: { type: String, trim: true },
  venue: { type: String, trim: true },
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  image: { type: String, trim: true },
}, { timestamps: true });

eventSchema.index({ club: 1, date: 1 });
eventSchema.index({ registrations: 1 });

module.exports = mongoose.model('Event', eventSchema);
