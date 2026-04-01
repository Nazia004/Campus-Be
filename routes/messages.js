const router = require('express').Router();
const User = require('../models/User');
const Message = require('../models/Message');
const { auth, requireRole } = require('../middleware/auth');

// Get all faculty members (for student to pick recipient)
router.get('/faculty', auth, async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }, 'name email');
    res.json(faculty);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message/doubt (student → faculty)
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, subject, body, type } = req.body;
    const msg = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      subject,
      body,
      type: type || 'message',
    });
    res.status(201).json(msg);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all messages sent by the logged-in student
router.get('/sent', auth, async (req, res) => {
  try {
    const msgs = await Message.find({ sender: req.user.id })
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });
    res.json(msgs);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all messages received by the logged-in faculty
router.get('/inbox', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const msgs = await Message.find({ receiver: req.user.id })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });
    res.json(msgs);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty replies to a message
router.patch('/reply/:id', auth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    msg.reply = req.body.reply;
    msg.repliedAt = new Date();
    msg.read = true;
    await msg.save();
    res.json(msg);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
