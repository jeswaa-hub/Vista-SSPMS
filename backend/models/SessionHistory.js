const mongoose = require('mongoose');

const SessionHistorySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId
  },
  sessionDay: {
    type: Number,
    required: true
  },
  sessionTitle: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completionDate: {
    type: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Add file attachment support for history (legacy single attachment)
  attachmentUrl: {
    type: String
  },
  attachmentOriginalName: {
    type: String
  },
  attachmentMimeType: {
    type: String
  },
  attachmentSize: {
    type: Number
  },
  attachmentUploadedAt: {
    type: Date
  },
  attachmentData: {
    type: String // Base64 encoded file data
  },
  // Multiple attachments support
  attachments: [{
    fileName: String,
    originalName: String,
    mimeType: String,
    size: Number,
    data: String, // Base64 encoded file data
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  hasAttachment: {
    type: Boolean,
    default: false
  },
  // Rejection tracking fields
  rejectionStatus: {
    type: String,
    enum: ['none', 'rejected', 'resubmitted'],
    default: 'none'
  },
  rejectionReason: {
    type: String
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  semester: {
    type: String,
    required: true,
    enum: ['1st Semester', '2nd Semester']
  },
  schoolYear: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Additional fields for better display in history views
  classDetails: {
    yearLevel: String,
    section: String,
    room: String,
    daySchedule: String,
    timeSchedule: String
  },
  subjectDetails: {
    name: String,
    sspCode: String
  },
  // Student information for easier querying
  studentName: String,
  studentIdNumber: String,
  // Archive metadata
  archivedAt: {
    type: Date,
    default: Date.now
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  archiveReason: String
});

module.exports = mongoose.model('SessionHistory', SessionHistorySchema); 