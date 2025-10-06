const mongoose = require('mongoose');

const mmSubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  // New preferred field: class reference (use this going forward)
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: false
  },
  // Backward-compat: keep classId for existing records; will be deprecated
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: false
  },
  schoolYear: {
    type: String,
    required: false, // Optional for backward compatibility
    default: '2025-2026'
  },
  yearLevel: {
    type: String,
    required: true,
    enum: ['2nd', '3rd', '4th']
  },
  semester: {
    type: String,
    required: true,
    enum: ['1st', '2nd']
  },
  examType: {
    type: String,
    required: true,
    enum: ['P1', 'P2', 'P3']
  },
  imageUrl: {
    type: String,
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  feedback: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true,
  // Updated index to include schoolYear for better filtering
  index: { student: 1, schoolYear: 1, yearLevel: 1, semester: 1, examType: 1 },
  unique: false // Remove unique constraint to allow multiple submissions across school years
});

const MMSubmission = mongoose.model('MMSubmission', mmSubmissionSchema);

module.exports = MMSubmission; 