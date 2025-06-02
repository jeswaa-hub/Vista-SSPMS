const mongoose = require('mongoose');

const mmSubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
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
  // Ensure unique submission per student, year, semester, and exam type
  index: { student: 1, yearLevel: 1, semester: 1, examType: 1 },
  unique: true
});

const MMSubmission = mongoose.model('MMSubmission', mmSubmissionSchema);

module.exports = MMSubmission; 