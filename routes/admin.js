const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

const adminOnly = [protect, requireRole('admin')];

// GET all students
router.get('/students', adminOnly, async (req, res) => {
  const students = await User.find({ role: 'student' }).select('-__v');
  res.json({ success: true, data: students });
});

// POST add student
router.post('/students', adminOnly, async (req, res) => {
  try {
    const { name, email, password, rollNumber, department, year } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    const student = await User.create({ name, email, password, role: 'student', rollNumber, department, year });
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update student
router.put('/students/:id', adminOnly, async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const update = { ...rest };
    if (password) update.password = await bcrypt.hash(password, 12);

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      update,
      { new: true, runValidators: true }
    );
    if (!student)
      return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE student
router.delete('/students/:id', adminOnly, async (req, res) => {
  try {
    const student = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
    if (!student)
      return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── CLUBS ─────────────────────────────────────────────────────────────────────

router.get('/clubs', adminOnly, async (req, res) => {
  const clubs = await User.find({ role: 'club' }).select('-__v');
  res.json({ success: true, data: clubs });
});

router.post('/clubs', adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
    const club = await User.create({ name, email, password, role: 'club' });
    res.status(201).json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/clubs/:id', adminOnly, async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const update = { ...rest };
    if (password) update.password = await bcrypt.hash(password, 12);
    const club = await User.findOneAndUpdate({ _id: req.params.id, role: 'club' }, update, { new: true, runValidators: true });
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.json({ success: true, data: club });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/clubs/:id', adminOnly, async (req, res) => {
  try {
    const club = await User.findOneAndDelete({ _id: req.params.id, role: 'club' });
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.json({ success: true, message: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PLACEMENTS ────────────────────────────────────────────────────────────────

router.get('/placements', adminOnly, async (req, res) => {
  const placements = await User.find({ role: 'placement' }).select('-__v');
  res.json({ success: true, data: placements });
});

router.post('/placements', adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
    const placement = await User.create({ name, email, password, role: 'placement' });
    res.status(201).json({ success: true, data: placement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/placements/:id', adminOnly, async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const update = { ...rest };
    if (password) update.password = await bcrypt.hash(password, 12);
    const placement = await User.findOneAndUpdate({ _id: req.params.id, role: 'placement' }, update, { new: true, runValidators: true });
    if (!placement) return res.status(404).json({ success: false, message: 'Placement user not found' });
    res.json({ success: true, data: placement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/placements/:id', adminOnly, async (req, res) => {
  try {
    const placement = await User.findOneAndDelete({ _id: req.params.id, role: 'placement' });
    if (!placement) return res.status(404).json({ success: false, message: 'Placement user not found' });
    res.json({ success: true, message: 'Placement user deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
