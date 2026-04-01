require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({
  origin: (origin, cb) => (!origin || /^http:\/\/localhost:\d+$/.test(origin) ? cb(null, true) : cb(new Error('CORS'))),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/club', require('./routes/club'));
app.use('/api/student', require('./routes/student'));
app.use('/api/placement', require('./routes/placement'));

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: 'Internal server error' });
});

async function seedAdmin() {
  const User = require('./models/User');
  const exists = await User.findOne({ email: 'admin@admin.com' });
  if (!exists) {
    await User.create({ name: 'Admin', email: 'admin@admin.com', password: 'admin@123', role: 'admin' });
    console.log('Admin seeded: admin@admin.com / admin@123');
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin();
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => { console.error('[DB ERROR]', err.message); process.exit(1); });
