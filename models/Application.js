const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  placement: { type: mongoose.Schema.Types.ObjectId, ref: 'Placement', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  branch: { type: String, trim: true },
  year: { type: String, trim: true },
  cgpa: { type: String, trim: true },
  skills: { type: String, trim: true },
  coverLetter: { type: String, trim: true },
  resumeUrl: { type: String, required: true },
  status: { type: String, enum: ['Applied', 'Shortlisted', 'Interviewing', 'Selected', 'Rejected'], default: 'Applied' },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ placement: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
