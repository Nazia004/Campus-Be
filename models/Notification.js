const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type:    { type: String, enum: ['event', 'club', 'placement'], required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
