const jwt = require('jsonwebtoken');
const User = require('../models/User');

const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const invalidateUserCache = (userId) => {
  if (userId) userCache.delete(userId.toString());
  else userCache.clear();
};

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const cached = userCache.get(decoded.id);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      req.user = cached.data;
      return next();
    }
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    userCache.set(decoded.id, { data: req.user, time: Date.now() });
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ success: false, message: 'Access denied' });
  next();
};

module.exports = { protect, requireRole, invalidateUserCache };
