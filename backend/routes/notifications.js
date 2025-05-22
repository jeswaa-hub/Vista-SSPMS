const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all notifications for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ 
      recipient: userId 
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'firstName lastName role');
    
    res.json(notifications.map(notification => ({
      ...notification.toObject(),
      senderName: notification.sender ? `${notification.sender.firstName} ${notification.sender.lastName} (${notification.sender.role})` : null
    })));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Mark a notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    // Ensure notification exists and belongs to the authenticated user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Update the notification to mark as read
    notification.read = true;
    await notification.save();
    
    res.json({ 
      success: true, 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

// Mark all notifications as read for the authenticated user
router.put('/mark-all-read', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );
    
    res.json({ 
      success: true, 
      message: 'All notifications marked as read',
      count: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
});

// Create a new notification
router.post('/create', authenticate, async (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'Recipient ID, title, and message are required' });
    }
    
    // Create the notification
    const notification = new Notification({
      recipient: userId,
      sender: req.user.id,  // Current user is the sender
      title,
      message,
      type: type || 'info',
      link: link || null,
      read: false
    });
    
    await notification.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Notification created successfully',
      notification 
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
});

// Delete a notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    // Ensure notification exists and belongs to the authenticated user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Delete the notification
    await notification.delete();
    
    res.json({ 
      success: true, 
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

// Get unread notifications count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
});

module.exports = router; 