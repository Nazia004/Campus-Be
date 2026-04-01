const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'club', 'placement', 'admin'], default: 'student' },
  // student-specific
  rollNumber: { type: String },
  department: { type: String },
  year: { type: Number },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model('User', userSchema);
