const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 0,
    max: 17
  },
  title: {
    type: String,
    required: true,
    trim: true
  }
});

const SubjectSchema = new mongoose.Schema({
  sspCode: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  yearLevel: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th'],
    required: true
  },
  schoolYear: {
    type: String,
    required: true,
    trim: true,
    default: '2024 - 2025'
  },
  semester: {
    type: String,
    enum: ['1st Semester', '2nd Semester'],
    required: true
  },
  hours: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
    default: 1
  },
  sessions: {
    type: [SessionSchema],
    validate: [
      {
        validator: function(sessions) {
          return sessions.length <= 18;
        },
        message: 'Maximum 18 sessions allowed per subject'
      }
    ]
  },
  secondSemesterSessions: {
    type: [SessionSchema],
    validate: [
      {
        validator: function(sessions) {
          return sessions.length <= 18;
        },
        message: 'Maximum 18 sessions allowed for second semester'
      }
    ]
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

// Add a compound index for sspCode + semester instead of unique on sspCode only
// This allows the same SSP code to be used for different semesters
SubjectSchema.index({ sspCode: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Subject', SubjectSchema); 