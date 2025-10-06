const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  }
});

const GoalSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  steps: [StepSchema]
});

const OdysseyPlanSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    required: true,
    enum: [1, 2]
  },
  goals: [GoalSchema],
  adviserNotes: [
    {
      note: { type: String, required: true },
      adviser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  status: {
    type: String,
    enum: ['Submitted', 'Approved', 'Rejected'],
    default: 'Submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness of year/semester combination per student
OdysseyPlanSchema.index({ student: 1, year: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('OdysseyPlan', OdysseyPlanSchema); 