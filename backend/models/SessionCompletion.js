const mongoose = require('mongoose');

const SessionCompletionSchema = new mongoose.Schema({
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
    ref: 'Subject',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
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
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  // Add file attachment support (multiple files)
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
  
  // Legacy single attachment fields (for backward compatibility)
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
  hasAttachment: {
    type: Boolean,
    default: false
  },
  // Add rejection tracking fields
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
    enum: ['1st Semester', '2nd Semester', '1st Semester (Completed)'],
    default: '1st Semester'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure uniqueness per student-session combination
SessionCompletionSchema.index(
  { student: 1, session: 1 },
  { unique: true }
);

module.exports = mongoose.model('SessionCompletion', SessionCompletionSchema); 