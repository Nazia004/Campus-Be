const router = require('express').Router();
const Placement = require('../models/Placement');
const { protect, requireRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notify');

const placementOnly = [protect, requireRole('placement')];
const studentOnly = [protect, requireRole('student')];
const authOnly = [protect];

// ── PLACEMENT CELL (create / update / delete) ─────────────────────────────────

router.get('/manage', placementOnly, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { createdBy: req.user._id };
    if (type) filter.type = type;
    const data = await Placement.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/manage', placementOnly, async (req, res) => {
  try {
    const { type, title } = req.body;
    if (!type || !title) return res.status(400).json({ success: false, message: 'Type and title are required' });
    const item = await Placement.create({ ...req.body, createdBy: req.user._id });
    createNotification({
      title: 'New Opportunity Posted',
      message: `${item.title}${item.company ? ' at ' + item.company : ''} is now available`,
      type: 'placement',
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/manage/:id', placementOnly, async (req, res) => {
  try {
    const item = await Placement.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/manage/:id', placementOnly, async (req, res) => {
  try {
    const item = await Placement.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET applicants for a listing
router.get('/manage/:id/applicants', placementOnly, async (req, res) => {
  try {
    const item = await Placement.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate('applicants', 'name email rollNumber department year');
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item.applicants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── STUDENT (browse + apply) ──────────────────────────────────────────────────

router.get('/', authOnly, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    const data = await Placement.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    const result = data.map((d) => ({
      ...d.toObject(),
      applicantCount: d.applicants.length,
      hasApplied: d.applicants.map(String).includes(String(req.user._id)),
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/apply', studentOnly, async (req, res) => {
  try {
    const item = await Placement.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    if (item.applicants.map(String).includes(String(req.user._id)))
      return res.status(400).json({ success: false, message: 'Already applied' });
    item.applicants.push(req.user._id);
    await item.save();
    createNotification({
      title: 'Application Update',
      message: `Your application for ${item.title} is submitted`,
      type: 'placement',
      user: req.user._id,
    });
    res.json({ success: true, message: 'Applied successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id/withdraw', studentOnly, async (req, res) => {
  try {
    const item = await Placement.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    item.applicants = item.applicants.filter((a) => String(a) !== String(req.user._id));
    await item.save();
    res.json({ success: true, message: 'Withdrawn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
