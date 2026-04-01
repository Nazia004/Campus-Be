const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['internship', 'job', 'campus_drive', 'workshop', 'conference'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  description: { type: String, trim: true },
  location: { type: String, trim: true },
  deadline: { type: Date },
  date: { type: Date },
  stipend: { type: String, trim: true },       // for internship
  salary: { type: String, trim: true },         // for job
  eligibility: { type: String, trim: true },
  applyLink: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Placement', placementSchema);
