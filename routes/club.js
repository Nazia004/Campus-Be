const router = require('express').Router();
const Club = require('../models/Club');
const Event = require('../models/Event');
const { protect, requireRole } = require('../middleware/auth');

const clubOnly = [protect, requireRole('club')];

// ── CLUBS ─────────────────────────────────────────────────────────────────────

// GET all clubs (created by this user)
router.get('/clubs', clubOnly, async (req, res) => {
  try {
    const clubs = await Club.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: clubs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create club
router.post('/clubs', clubOnly, async (req, res) => {
  try {
    const { name, description, category, venue } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Club name is required' });
    const club = await Club.create({ name, description, category, venue, createdBy: req.user._id });
    res.status(201).json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update club
router.put('/clubs/:id', clubOnly, async (req, res) => {
  try {
    const club = await Club.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE club
router.delete('/clubs/:id', clubOnly, async (req, res) => {
  try {
    const club = await Club.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    // also delete related events
    await Event.deleteMany({ club: req.params.id });
    res.json({ success: true, message: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── EVENTS ────────────────────────────────────────────────────────────────────

// GET all events (created by this user)
router.get('/events', clubOnly, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id })
      .populate('club', 'name')
      .sort({ date: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create event
router.post('/events', clubOnly, async (req, res) => {
  try {
    const { title, description, date, time, venue, club } = req.body;
    if (!title || !date) return res.status(400).json({ success: false, message: 'Title and date are required' });
    const event = await Event.create({ title, description, date, time, venue, club: club || null, createdBy: req.user._id });
    await event.populate('club', 'name');
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update event
router.put('/events/:id', clubOnly, async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('club', 'name');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE event
router.delete('/events/:id', clubOnly, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET enrolled members of a club
router.get('/clubs/:id/members', clubOnly, async (req, res) => {
  try {
    const club = await Club.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate('members', 'name email rollNumber department year');
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.json({ success: true, data: club.members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET registrations of an event
router.get('/events/:id/registrations', clubOnly, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate('registrations', 'name email rollNumber department year');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event.registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
