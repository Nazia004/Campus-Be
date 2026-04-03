const router = require('express').Router();
const Placement = require('../models/Placement');
const Application = require('../models/Application');
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
    const item = await Placement.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    
    const applications = await Application.find({ placement: req.params.id })
      .populate('user', 'name email rollNumber department year');
      
    res.json({ success: true, data: applications });
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
      
    // Fetch applications for all these placements to compute counts and hasApplied
    const placementIds = data.map(d => d._id);
    const applications = await Application.find({ placement: { $in: placementIds } });
    
    const result = data.map((d) => {
      const pApps = applications.filter(a => String(a.placement) === String(d._id));
      return {
        ...d.toObject(),
        applicantCount: pApps.length,
        hasApplied: pApps.some(a => String(a.user) === String(req.user._id))
      };
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/apply', studentOnly, async (req, res) => {
  try {
    const { resumeUrl, fullName, email, phone, branch, year, cgpa, skills, coverLetter } = req.body;
    const item = await Placement.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    
    const existing = await Application.findOne({ placement: req.params.id, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already applied' });
    
    await Application.create({
      placement: req.params.id,
      user: req.user._id,
      fullName, email, phone, branch, year, cgpa, skills, coverLetter,
      resumeUrl
    });
    
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
    
    await Application.findOneAndDelete({ placement: req.params.id, user: req.user._id });
    
    res.json({ success: true, message: 'Withdrawn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
