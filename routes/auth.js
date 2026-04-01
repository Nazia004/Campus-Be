const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const genToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password || !role)
      return res.status(400).json({ success: false, message: 'Email, password and role are required' });

    const user = await User.findOne({ email: email.trim().toLowerCase(), role }).select('+password');
    if (!user)
      return res.status(404).json({ success: false, message: 'No account found with this email and role' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Incorrect password' });

    return res.json({ success: true, token: genToken(user._id, user.role), user: safeUser(user) });
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
