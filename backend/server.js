const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();
if (!process.env.MONGODB_URI) {
  const parentEnvPath = path.resolve(__dirname, '../.env');
  dotenv.config({ path: parentEnvPath });
}

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'https://sspms-frontend.onrender.com',
      'https://sspms-backend.onrender.com',
      'https://sscms-au.com',
      'http://sscms-au.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    
    // Add custom domain from environment variable if set
    if (process.env.CUSTOM_DOMAIN) {
      allowedOrigins.push(`https://${process.env.CUSTOM_DOMAIN}`);
      allowedOrigins.push(`http://${process.env.CUSTOM_DOMAIN}`);
    }
    
    // Allow any local network IP on port 5173 (for development)
    const isLocalNetwork = /^http:\/\/192\.168\.\d+\.\d+:5173$/.test(origin) ||
                          /^http:\/\/10\.\d+\.\d+\.\d+:5173$/.test(origin) ||
                          /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:5173$/.test(origin);
    
    // Allow any HTTPS origin in production (for custom domains)
    const isHttpsOrigin = process.env.NODE_ENV === 'production' && origin.startsWith('https://');
    
    if (allowedOrigins.includes(origin) || isLocalNetwork || isHttpsOrigin) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint - MUST be first for Railway
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  let dbStatus;
  
  switch (dbState) {
    case 0:
      dbStatus = 'disconnected';
      break;
    case 1:
      dbStatus = 'connected';
      break;
    case 2:
      dbStatus = 'connecting';
      break;
    case 3:
      dbStatus = 'disconnecting';
      break;
    default:
      dbStatus = 'unknown';
  }
  
  // Always return 200 OK for health check, even if DB is not connected yet
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    database: {
      status: dbStatus,
      uri: process.env.MONGODB_URI ? 'configured' : 'not configured'
    },
    server: 'running'
  });
});

// Basic API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'SSP Management System API',
    version: '1.0.0',
    health: '/api/health',
    environment: process.env.NODE_ENV || 'development'
  });
});

const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssp_management';

// Database connection
mongoose.connect(dbUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Import and use API routes
console.log('🔄 Loading API routes...');
const authRoutes = require('./routes/auth');
console.log('✅ Auth routes loaded');
const adviserRoutes = require('./routes/advisers');
console.log('✅ Adviser routes loaded');
const classRoutes = require('./routes/classes');
console.log('✅ Class routes loaded');
const subjectRoutes = require('./routes/subjects');
console.log('✅ Subject routes loaded');
const studentRoutes = require('./routes/students');
console.log('✅ Student routes loaded');
const announcementRoutes = require('./routes/announcements');
console.log('✅ Announcement routes loaded');
const userRoutes = require('./routes/users');
console.log('✅ User routes loaded');
const sessionRoutes = require('./routes/sessions');
console.log('✅ Session routes loaded');
const systemOptionsRoutes = require('./routes/systemOptions');
console.log('✅ System options routes loaded');
const attendanceRoutes = require('./routes/attendance');
console.log('✅ Attendance routes loaded');
const surveyRoutes = require('./routes/surveys');
console.log('✅ Survey routes loaded');
const notificationRoutes = require('./routes/notifications');
console.log('✅ Notification routes loaded');
const odysseyPlanRoutes = require('./routes/odysseyPlans');
console.log('✅ Odyssey plan routes loaded');
const mmSubmissionRoutes = require('./routes/midtermFinals');
console.log('✅ MM submission routes loaded');
const consultationRoutes = require('./routes/consultations');
console.log('✅ Consultation routes loaded');
const adminRoutes = require('./routes/admin');
console.log('✅ Admin routes loaded');
const dropRequestRoutes = require('./routes/dropRequests');
console.log('✅ Drop request routes loaded');
const adminNotificationRoutes = require('./routes/adminNotifications');
console.log('✅ Admin notification routes loaded');
const examPermitRoutes = require('./routes/examPermits');
console.log('✅ Exam permit routes loaded');

// API Routes
console.log('🔄 Mounting API routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted at /api/auth');
app.use('/api/advisers', adviserRoutes);
console.log('✅ Adviser routes mounted at /api/advisers');
app.use('/api/classes', classRoutes);
console.log('✅ Class routes mounted at /api/classes');
app.use('/api/subjects', subjectRoutes);
console.log('✅ Subject routes mounted at /api/subjects');
app.use('/api/students', studentRoutes);
console.log('✅ Student routes mounted at /api/students');
app.use('/api/announcements', announcementRoutes);
console.log('✅ Announcement routes mounted at /api/announcements');
app.use('/api/users', userRoutes);
console.log('✅ User routes mounted at /api/users');
app.use('/api/sessions', sessionRoutes);
console.log('✅ Session routes mounted at /api/sessions');
app.use('/api/system-options', systemOptionsRoutes);
console.log('✅ System options routes mounted at /api/system-options');
app.use('/api/attendance', attendanceRoutes);
console.log('✅ Attendance routes mounted at /api/attendance');
app.use('/api/surveys', surveyRoutes);
console.log('✅ Survey routes mounted at /api/surveys');
app.use('/api/notifications', notificationRoutes);
console.log('✅ Notification routes mounted at /api/notifications');
app.use('/api/odyssey-plans', odysseyPlanRoutes);
console.log('✅ Odyssey plan routes mounted at /api/odyssey-plans');
app.use('/api/mm-submissions', mmSubmissionRoutes);
console.log('✅ MM submission routes mounted at /api/mm-submissions');
app.use('/api/consultations', consultationRoutes);
console.log('✅ Consultation routes mounted at /api/consultations');
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes mounted at /api/admin');
app.use('/api/admin/drop-requests', dropRequestRoutes);
console.log('✅ Drop request routes mounted at /api/admin/drop-requests');
app.use('/api/admin/notifications', adminNotificationRoutes);
console.log('✅ Admin notification routes mounted at /api/admin/notifications');
app.use('/api/exam-permits', examPermitRoutes);
console.log('✅ Exam permit routes mounted at /api/exam-permits');
console.log('🎉 All API routes mounted successfully!');

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Only handle API routes - frontend is served separately
app.get('/', (req, res) => {
  res.json({ 
    message: 'SSCMS Backend API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      message: 'API endpoint not found',
      path: req.path,
      method: req.method 
    });
  }
  
  res.status(404).json({ 
    message: 'Route not found. This is a backend API service.',
    availableRoutes: ['/api/health', '/api/auth', '/api/consultations', '/api/students']
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler for API routes only (in development)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      message: 'API endpoint not found',
      path: req.path,
      method: req.method,
      availableRoutes: [
        '/api/health',
        '/api/auth',
        '/api/advisers',
        '/api/classes',
        '/api/subjects',
        '/api/students'
      ]
    });
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.MONGODB_URI ? 'configured' : 'not configured'}`);
}); 