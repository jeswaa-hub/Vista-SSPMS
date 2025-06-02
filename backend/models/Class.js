const mongoose = require('mongoose');

// Define a schema for semester-specific details
const SemesterDetailsSchema = new mongoose.Schema({
  daySchedule: {
    type: String,
    required: false
  },
  timeSchedule: {
    type: String,
    required: false
  },
  room: {
    type: String,
    required: false
  },
  sspSubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: false
  },
  hours: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  }
}, { _id: false });

const ClassSchema = new mongoose.Schema({
  yearLevel: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  major: {
    type: String,
    enum: ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
    required: true
  },
  schoolYear: {
    type: String,
    required: true,
    default: '2025-2026'
  },
  // Keep original fields for backward compatibility and for displaying in lists
  daySchedule: {
    type: String,
    required: true
  },
  timeSchedule: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  hours: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  },
  adviser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sspSubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  // Add nested objects for first and second semester details
  firstSemester: {
    type: SemesterDetailsSchema,
    default: () => ({})
  },
  secondSemester: {
    type: SemesterDetailsSchema,
    default: () => ({})
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  lastActive: {
    type: Date,
    default: Date.now
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

module.exports = mongoose.model('Class', ClassSchema);