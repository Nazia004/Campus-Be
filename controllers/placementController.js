const Placement = require("../models/Placement");
const { createNotification } = require('../utils/notify');

exports.getPlacements = async (req, res) => {
  try {
    const jobs = await Placement.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch placements' });
  }
};

exports.getPlacementById = async (req, res) => {
  try {
    const job = await Placement.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Placement not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch placement' });
  }
};

exports.applyPlacement = async (req, res) => {
  try {
    const job = await Placement.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Placement not found' });
    if (job.applicants.includes(req.user.id))
      return res.status(400).json({ message: 'Already applied' });
    job.applicants.push(req.user.id);
    await job.save();
    createNotification({
      title: 'Application Update',
      message: `Your application for ${job.title} is submitted`,
      type: 'placement',
      user: req.user.id,
    });
    res.json({ message: 'Applied successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to apply' });
  }
};

exports.createPlacement = async (req, res) => {
  try {
    const job = await Placement.create(req.body);
    createNotification({
      title: 'New Opportunity Posted',
      message: `${job.title}${job.company ? ' at ' + job.company : ''} is now available`,
      type: 'placement',
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create placement' });
  }
};