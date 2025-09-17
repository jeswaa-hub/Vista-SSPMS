const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Announcement = require('../models/Announcement');
const Class = require('../models/Class');
const Student = require('../models/Student');
const { authenticate, authorizeAdmin, authorizeAdviser } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/announcements');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'announcement-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Test endpoint for debugging
router.get('/test', authenticate, async (req, res) => {
  try {
    console.log('Test endpoint hit - User role:', req.user.role);
    
    // Test database connection
    const announcementCount = await Announcement.countDocuments();
    const classCount = await Class.countDocuments();
    
    res.json({
      message: 'Test endpoint working',
      user: {
        id: req.user._id,
        role: req.user.role
      },
      database: {
        announcements: announcementCount,
        classes: classCount
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: 'Test endpoint failed', error: error.message });
  }
});

// Get all announcements
router.get('/', authenticate, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'student') {
      // For students, get their class information
      const student = await Student.findOne({ user: req.user._id }).populate('class');
      
      filter = {
        $or: [
          { targetAudience: 'all' },
          { 
            targetAudience: 'students',
            $or: [
              { targetClasses: { $size: 0 } }, // No specific classes targeted
              { targetClasses: { $exists: false } }, // No targetClasses field
              ...(student && student.class ? [{ targetClasses: student.class._id }] : [])
            ]
          }
        ]
      };
    } else if (req.user.role === 'adviser') {
      filter = {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'advisers' }
        ]
      };
    }
    
    // Get announcements and populate author and target classes
    const announcements = await Announcement.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .populate('author', 'firstName lastName')
      .populate('targetClasses', 'yearLevel section major');
    
    // Add isLiked status for each announcement
    const announcementsWithLikeStatus = announcements.map(announcement => {
      const announcementObj = announcement.toObject();
      announcementObj.isLiked = announcement.likes.some(like => like.user.toString() === req.user._id.toString());
      return announcementObj;
    });
    
    res.json(announcementsWithLikeStatus);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all active classes for announcement targeting (MUST be before /:id route)
router.get('/classes/active', authenticate, async (req, res) => {
  try {
    console.log('GET /classes/active - User role:', req.user.role);
    
    // Allow both admin and adviser to access this endpoint
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Access denied. Admin or adviser role required.' });
    }
    
    const classes = await Class.find({ status: 'active' })
      .select('yearLevel section major')
      .sort({ yearLevel: 1, section: 1 });
    
    console.log(`Found ${classes.length} active classes`);
    res.json(classes);
  } catch (error) {
    console.error('Get active classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve announcement images (MUST be before /:id route)
router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads/announcements', filename);
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

// Get announcement by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'firstName lastName')
      .populate('targetClasses', 'yearLevel section major');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Check if user has permission to view this announcement
    if (req.user.role === 'student' && announcement.targetAudience === 'advisers') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (req.user.role === 'adviser' && announcement.targetAudience === 'students') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Add isLiked status
    const announcementObj = announcement.toObject();
    announcementObj.isLiked = announcement.likes.some(like => like.user.toString() === req.user._id.toString());
    
    res.json(announcementObj);
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add error handling for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  } else if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({ message: 'Upload error: ' + err.message });
  }
  next();
};

// Create new announcement
router.post('/', authenticate, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload middleware error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      }
      return res.status(400).json({ message: 'Upload error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('POST /announcements - Creating new announcement');
    console.log('User role:', req.user.role);
    console.log('Request body:', req.body);
    console.log('File uploaded:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'No file');
    
    // Check if user is admin or adviser
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Access denied. Admin or adviser role required.' });
    }
    
    const { title, content, targetAudience, isPinned, targetClasses } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Parse targetClasses if it's a string
    let parsedTargetClasses = [];
    if (targetClasses) {
      try {
        if (typeof targetClasses === 'string') {
          parsedTargetClasses = targetClasses ? JSON.parse(targetClasses) : [];
        } else if (Array.isArray(targetClasses)) {
          parsedTargetClasses = targetClasses;
        }
        console.log('Parsed targetClasses:', parsedTargetClasses);
      } catch (e) {
        console.error('Error parsing targetClasses:', e);
        return res.status(400).json({ message: 'Invalid target classes format' });
      }
    }
    
    // Create announcement data
    const announcementData = {
      title,
      content,
      author: req.user._id,
      targetAudience: targetAudience || 'all',
      isPinned: isPinned === 'true' || isPinned === true,
      targetClasses: parsedTargetClasses
    };
    
    // Add image if uploaded
    if (req.file) {
      announcementData.image = req.file.filename;
    }
    
    console.log('Creating announcement with data:', announcementData);
    
    const announcement = new Announcement(announcementData);
    console.log('Announcement object created, attempting to save...');
    
    await announcement.save();
    console.log('Announcement saved successfully with ID:', announcement._id);
    
    // Populate the saved announcement for response
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'firstName lastName')
      .populate('targetClasses', 'yearLevel section major');
    
    console.log('Announcement populated and ready to send response');
    
    res.status(201).json({ 
      message: 'Announcement created successfully', 
      announcement: populatedAnnouncement 
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file if announcement creation failed
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/announcements', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update announcement
router.put('/:id', authenticate, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Update upload middleware error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      }
      return res.status(400).json({ message: 'Upload error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('PUT /announcements/:id - Updating announcement:', req.params.id);
    console.log('User role:', req.user.role);
    console.log('Request body:', req.body);
    console.log('File uploaded:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'No file');
    
    // Check if user is admin or adviser
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Access denied. Admin or adviser role required.' });
    }
    
    const { title, content, targetAudience, isPinned, targetClasses, removeImage } = req.body;
    
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Check if user is the author or admin
    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only edit your own announcements' });
    }
    
    // Update basic fields
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    
    // Parse targetClasses if provided
    if (targetClasses) {
      try {
        announcement.targetClasses = Array.isArray(targetClasses) ? targetClasses : JSON.parse(targetClasses);
      } catch (e) {
        console.error('Error parsing targetClasses:', e);
      }
    }
    
    // Handle image updates
    if (removeImage === 'true' && announcement.image) {
      // Remove existing image
      const oldImagePath = path.join(__dirname, '../uploads/announcements', announcement.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      announcement.image = null;
    } else if (req.file) {
      // Replace with new image
      if (announcement.image) {
        const oldImagePath = path.join(__dirname, '../uploads/announcements', announcement.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      announcement.image = req.file.filename;
    }
    
    // Only admin can change targetAudience and pinned status
    if (req.user.role === 'admin') {
      if (targetAudience) announcement.targetAudience = targetAudience;
      if (isPinned !== undefined) announcement.isPinned = isPinned === 'true' || isPinned === true;
    }
    
    announcement.updatedAt = Date.now();
    await announcement.save();
    
    // Return populated announcement
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'firstName lastName')
      .populate('targetClasses', 'yearLevel section major');
    
    res.json({ 
      message: 'Announcement updated successfully',
      announcement: populatedAnnouncement 
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    
    // Clean up uploaded file if update failed
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/announcements', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete announcement
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is admin or adviser
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Access denied. Admin or adviser role required.' });
    }
    
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Check if user is the author or admin
    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete your own announcements' });
    }
    
    // Delete associated image file
    if (announcement.image) {
      const imagePath = path.join(__dirname, '../uploads/announcements', announcement.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Announcement.deleteOne({ _id: announcement._id });
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pin/unpin announcement (admin only)
router.put('/:id/pin', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { isPinned } = req.body;
    
    if (isPinned === undefined) {
      return res.status(400).json({ message: 'isPinned field is required' });
    }
    
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    announcement.isPinned = isPinned;
    announcement.updatedAt = Date.now();
    
    await announcement.save();
    
    res.json({ message: `Announcement ${isPinned ? 'pinned' : 'unpinned'} successfully` });
  } catch (error) {
    console.error('Pin announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike announcement
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const announcementId = req.params.id;
    const userId = req.user._id;
    
    const announcement = await Announcement.findById(announcementId);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    // Check if user already liked this announcement
    const existingLike = announcement.likes.find(like => like.user.toString() === userId.toString());
    
    if (existingLike) {
      // Unlike - remove the like
      announcement.likes = announcement.likes.filter(like => like.user.toString() !== userId.toString());
      announcement.likeCount = Math.max(0, announcement.likeCount - 1);
    } else {
      // Like - add the like
      announcement.likes.push({ user: userId });
      announcement.likeCount = announcement.likes.length;
    }
    
    await announcement.save();
    
    res.json({
      isLiked: !existingLike,
      likeCount: announcement.likeCount
    });
  } catch (error) {
    console.error('Like announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 