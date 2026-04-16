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
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    // 1. Find user by email ONLY (automatic role identification)
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user)
      return res.status(404).json({ success: false, message: 'No account found with this email' });

    // 2. Compare password using bcrypt.compare()
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Incorrect password' });

    // 3. Return user role for role-based routing
    return res.json({ 
      success: true, 
      token: genToken(user._id, user.role), 
      user: safeUser(user),
      role: user.role // Explicitly adding for clarity
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
