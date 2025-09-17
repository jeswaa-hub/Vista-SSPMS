const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['drop_request', 'system', 'info', 'warning', 'error'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Related data for drop requests
  dropRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DropRequest'
  },
  studentInfo: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    idNumber: String
  },
  classInfo: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    yearLevel: String,
    section: String,
    major: String
  },
  requesterInfo: {
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    role: String
  },
  reason: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Additional data for other notification types
  details: String,
  actionUrl: String,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
adminNotificationSchema.index({ read: 1, createdAt: -1 });
adminNotificationSchema.index({ type: 1, createdAt: -1 });
adminNotificationSchema.index({ priority: 1, createdAt: -1 });
adminNotificationSchema.index({ status: 1, type: 1 });

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
