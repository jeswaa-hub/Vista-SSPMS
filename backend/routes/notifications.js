const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Student = require('../models/Student');

// Send congratulation notification
router.post('/send-congratulation', authenticate, async (req, res) => {
  try {
    const { studentId, message, type } = req.body;
    
    if (!studentId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and message are required'
      });
    }

    // Find the student
    const student = await Student.findById(studentId).populate('user');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Create notification (use correct schema fields)
    const notification = new Notification({
      recipient: student.user._id,
      title: type === 'graduation' ? '🎓 Congratulations on Your Graduation!' : '🎉 Congratulations!'
        ,
      message: message,
      type: 'success',
      read: false
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Congratulation notification sent successfully',
      notificationId: notification._id
    });

  } catch (error) {
    console.error('Error sending congratulation notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send congratulation notification',
      error: error.message
    });
  }
});

// Get notifications for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const list = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(list || []);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json(count);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// Create notification (used by advisers to send notifications to students)
router.post('/create', authenticate, async (req, res) => {
  try {
    const { userId, title, message, type = 'info', link } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, title, and message are required'
      });
    }

    // Create notification using the correct schema fields
    const notification = new Notification({
      recipient: userId, // Note: using 'recipient' not 'user' as per schema
      sender: req.user._id,
      title: title,
      message: message,
      type: type,
      link: link,
      read: false
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Notification created successfully',
      notificationId: notification._id
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

// Create M&M notification with tracking (used by advisers to send M&M reminders)
router.post('/create-mm', authenticate, async (req, res) => {
  try {
    const { userId, title, message, type = 'urgent', link, examType, studentId } = req.body;
    
    if (!userId || !title || !message || !examType || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'User ID, title, message, exam type, and student ID are required'
      });
    }

    // Create notification using the correct schema fields
    const notification = new Notification({
      recipient: userId,
      sender: req.user._id,
      title: title,
      message: message,
      type: type,
      link: link,
      read: false
    });

    await notification.save();

    // Track this notification for flagging system
    try {
      const NotificationTracker = require('../models/NotificationTracker');
      const AdvisoryClass = require('../models/AdvisoryClass');
      const Student = require('../models/Student');
      
      // Find the adviser for this student through AdvisoryClass
      let adviserId = null;
      const student = await Student.findById(studentId).populate('class');
      if (student && student.class) {
        const advisoryClass = await AdvisoryClass.findOne({
          class: student.class._id,
          status: 'active'
        });
        if (advisoryClass) {
          adviserId = advisoryClass.adviser;
        }
      }
      
      // If no adviser found, use the requesting user as fallback
      if (!adviserId) {
        adviserId = req.user._id;
        console.warn(`No adviser found for student ${studentId}, using requesting user ${req.user._id} as fallback`);
      }
      
      const notificationType = `mm_${examType.toLowerCase()}`;
      await NotificationTracker.trackNotification(
        studentId,
        adviserId,
        notificationType,
        notification._id
      );
      console.log(`Tracked M&M notification for student ${studentId}, exam ${examType}, adviser ${adviserId}`);
    } catch (trackingError) {
      console.error('Error tracking M&M notification:', trackingError);
    }

    res.json({
      success: true,
      message: 'M&M notification created and tracked successfully',
      notificationId: notification._id
    });

  } catch (error) {
    console.error('Error creating M&M notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create M&M notification',
      error: error.message
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

module.exports = router;