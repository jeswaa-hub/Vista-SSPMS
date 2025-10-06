const mongoose = require('mongoose');

const ExamPermitSchema = new mongoose.Schema({
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
  adviser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // Extracted permit data
  studentNumber: {
    type: String,
    required: true,
    trim: true
  },
  referenceNumber: {
    type: String,
    required: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  period: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4'], // Period 1, 2, 3, 4
    trim: true
  },
  schoolYear: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['1st Semester', '2nd Semester'],
    trim: true
  },
  // File attachments
  permitAttachment: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  // OCR extraction metadata
  extractionData: {
    extractedText: String,
    confidence: Number,
    extractionMethod: {
      type: String,
      enum: ['tesseract', 'google-vision', 'manual'],
      default: 'tesseract'
    },
    extractedAt: {
      type: Date,
      default: Date.now
    }
  },
  // Validation status
  isValid: {
    type: Boolean,
    default: false
  },
  validationNotes: {
    type: String,
    trim: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: {
    type: Date
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'validated', 'rejected', 'expired'],
    default: 'pending'
  },
  // Exam session verification
  examSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionCompletion'
  },
  examSessionVerified: {
    type: Boolean,
    default: false
  },
  examSessionVerifiedAt: {
    type: Date
  },
  // Additional metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
ExamPermitSchema.index({ student: 1, class: 1 });
ExamPermitSchema.index({ period: 1, schoolYear: 1, semester: 1 });
ExamPermitSchema.index({ status: 1 });
ExamPermitSchema.index({ studentNumber: 1 });
ExamPermitSchema.index({ referenceNumber: 1 });

// Update the updatedAt field before saving
ExamPermitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ExamPermit', ExamPermitSchema);
