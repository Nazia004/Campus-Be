const router = require('express').Router();
const Club = require('../models/Club');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { protect, requireRole } = require('../middleware/auth');

const studentOnly = [protect, requireRole('student')];

// ── CLUBS ─────────────────────────────────────────────────────────────────────

// GET all clubs with join status
router.get('/clubs', studentOnly, async (req, res) => {
  try {
    const clubs = await Club.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    const data = clubs.map((c) => ({
      ...c.toObject(),
      memberCount: c.members.length,
      isJoined: c.members.map(String).includes(String(req.user._id)),
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST join club
router.post('/clubs/:id/join', studentOnly, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    if (club.members.map(String).includes(String(req.user._id)))
      return res.status(400).json({ success: false, message: 'Already a member' });
    club.members.push(req.user._id);
    await club.save();
    res.json({ success: true, message: 'Joined club successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE leave club
router.delete('/clubs/:id/leave', studentOnly, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    club.members = club.members.filter((m) => String(m) !== String(req.user._id));
    await club.save();
    res.json({ success: true, message: 'Left club successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET my joined clubs
router.get('/my-clubs', studentOnly, async (req, res) => {
  try {
    const clubs = await Club.find({ members: req.user._id }).populate('createdBy', 'name');
    res.json({ success: true, data: clubs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── EVENTS ────────────────────────────────────────────────────────────────────

// GET all events with registration status
router.get('/events', studentOnly, async (req, res) => {
  try {
    const events = await Event.find().populate('club', 'name').populate('createdBy', 'name').sort({ date: 1 });
    const data = events.map((e) => ({
      ...e.toObject(),
      registrationCount: e.registrations.length,
      isRegistered: e.registrations.map(String).includes(String(req.user._id)),
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST register for event
router.post('/events/:id/register', studentOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.registrations.map(String).includes(String(req.user._id)))
      return res.status(400).json({ success: false, message: 'Already registered' });
    event.registrations.push(req.user._id);
    await event.save();
    res.json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE unregister from event
router.delete('/events/:id/unregister', studentOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.registrations = event.registrations.filter((r) => String(r) !== String(req.user._id));
    await event.save();
    res.json({ success: true, message: 'Unregistered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET my registered events
router.get('/my-events', studentOnly, async (req, res) => {
  try {
    const events = await Event.find({ registrations: req.user._id }).populate('club', 'name').sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET notifications (global + user-specific), newest first, limit 10
router.get('/notifications', studentOnly, async (req, res) => {
  try {
    const data = await Notification.find({
      $or: [{ user: null }, { user: req.user._id }],
    }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
