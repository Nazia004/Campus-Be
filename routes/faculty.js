const router = require('express').Router();
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

const facultyOnly = [protect, requireRole('faculty')];

// GET stats for faculty's department
router.get('/stats', facultyOnly, async (req, res) => {
  try {
    const dept = req.user.department;
    if (!dept) return res.status(400).json({ success: false, message: 'Faculty department not assigned' });

    const studentCount = await User.countDocuments({ role: 'student', department: dept });
    
    res.json({
      success: true,
      data: {
        department: dept,
        studentCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET list of students in faculty's department
router.get('/students', facultyOnly, async (req, res) => {
  try {
    const dept = req.user.department;
    if (!dept) return res.status(400).json({ success: false, message: 'Faculty department not assigned' });

    const students = await User.find({ role: 'student', department: dept })
      .select('name email rollNumber year')
      .sort({ name: 1 });

    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
