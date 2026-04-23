require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://campusync.co.in',
  'https://www.campusync.co.in'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/club', require('./routes/club'));
app.use('/api/student', require('./routes/student'));
app.use('/api/placement', require('./routes/placement'));
app.use('/api/upload', require('./routes/upload'));
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: 'Internal server error' });
});
app.get('/', (req, res) => res.send('Campus Hub API is running'));

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
