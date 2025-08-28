const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

// Import backend routes
const consultationRoutes = require('./backend/routes/consultations');
const notificationRoutes = require('./backend/routes/notifications');
const authRoutes = require('./backend/routes/auth');
const studentRoutes = require('./backend/routes/students');
const sessionRoutes = require('./backend/routes/sessions');
const mmRoutes = require('./backend/routes/midtermFinals');
const announcementRoutes = require('./backend/routes/announcements');
const odysseyRoutes = require('./backend/routes/odysseyPlans');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/consultations', consultationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/midterm-finals', mmRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/odyssey-plans', odysseyRoutes);

// Only handle API routes - frontend is served separately
app.get('/', (req, res) => {
  res.json({ message: 'SSPMS Backend API is running' });
});

// Catch-all for non-API routes
app.get('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sspms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});
