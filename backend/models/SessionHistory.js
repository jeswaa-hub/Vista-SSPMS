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