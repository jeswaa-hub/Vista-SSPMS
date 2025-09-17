const express = require('express');
const router = express.Router();
const AdminNotification = require('../models/AdminNotification');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Get all admin notifications
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { 
      type, 
      status, 
      read, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;

    const query = {};
    
    // Apply filters
    if (type) query.type = type;
    if (status) query.status = status;
    if (read !== undefined) query.read = read === 'true';
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const notifications = await AdminNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AdminNotification.countDocuments(query);
    const unreadCount = await AdminNotification.countDocuments({ read: false });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read/unread
router.put('/:id/read', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;

    const notification = await AdminNotification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = read;
    notification.readAt = read ? new Date() : null;
    await notification.save();

    res.json({
      success: true,
      message: `Notification marked as ${read ? 'read' : 'unread'}`,
      data: notification
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification'
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await AdminNotification.updateMany(
      { read: false },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await AdminNotification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Create system notification (for internal use)
router.post('/system', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'system',
      details
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const notification = new AdminNotification({
      title,
      message,
      type,
      details
    });

    await notification.save();

    res.json({
      success: true,
      message: 'System notification created',
      data: notification
    });

  } catch (error) {
    console.error('Error creating system notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create system notification'
    });
  }
});

// Get notification statistics
router.get('/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const stats = await AdminNotification.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          unread: [{ $match: { read: false } }, { $count: "count" }],
          byType: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 }
              }
            }
          ],
          byPriority: [
            {
              $group: {
                _id: "$priority",
                count: { $sum: 1 }
              }
            }
          ],
          recent: [
            { $match: { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
            { $count: "count" }
          ]
        }
      }
    ]);

    const result = {
      total: stats[0].total[0]?.count || 0,
      unread: stats[0].unread[0]?.count || 0,
      recent24h: stats[0].recent[0]?.count || 0,
      byType: stats[0].byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: stats[0].byPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics'
    });
  }
});

module.exports = router;
