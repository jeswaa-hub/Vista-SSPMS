const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  adviser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 4 // Monday (0) to Friday (4)
  },
  startTime: {
    type: Number,
    required: true,
    min: 7,
    max: 17 // 7 AM to 5 PM
  },
  endTime: {
    type: Number,
    required: true,
    min: 7,
    max: 18 // 7 AM to 6 PM (end time can be 6 PM if start is 3 PM)
  },
  duration: {
    type: Number,
    required: true,
    default: 3 // 3 hours
  },
  maxStudents: {
    type: Number,
    required: true,
    default: 5,
    min: 1,
    max: 10
  },
  bookedStudents: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Full'],
    default: 'Active'
  },
  notes: {
    type: String,
    trim: true
  },
  // Array of student bookings
  bookings: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending'
    },
    concern: {
      type: String,
      enum: [
        'Academic Performance and Grades',
        'Career Planning and Future Goals', 
        'Time Management and Workload',
        'Financial Concerns',
        'Mental Health and Personal Well-being',
        'Other'
      ],
      required: true
    },
    notes: String,
    feedback: {
      type: String,
      trim: true
    },
    feedbackAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
ConsultationSchema.index({ adviser: 1, dayOfWeek: 1, startTime: 1 });
ConsultationSchema.index({ status: 1 });

// Virtual for checking if consultation is full
ConsultationSchema.virtual('isFull').get(function() {
  return this.bookedStudents >= this.maxStudents;
});

// Virtual for available slots
ConsultationSchema.virtual('availableSlots').get(function() {
  return this.maxStudents - this.bookedStudents;
});

// Pre-save middleware to update status based on bookings
ConsultationSchema.pre('save', function(next) {
  // Update bookedStudents count
  this.bookedStudents = this.bookings.filter(booking => 
    booking.status === 'Pending' || booking.status === 'Confirmed'
  ).length;
  
  // Update status based on availability
  if (this.bookedStudents >= this.maxStudents) {
    this.status = 'Full';
  } else if (this.status === 'Full' && this.bookedStudents < this.maxStudents) {
    this.status = 'Active';
  }
  
  next();
});

// Static method to find available consultations for a specific day and time
ConsultationSchema.statics.findAvailable = function(dayOfWeek, startTime, endTime) {
  return this.find({
    dayOfWeek: dayOfWeek,
    startTime: { $lte: startTime },
    endTime: { $gte: endTime },
    status: 'Active'
  }).populate('adviser', 'firstName lastName email');
};

// Static method to find consultations by adviser
ConsultationSchema.statics.findByAdviser = function(adviserId) {
  return this.find({ adviser: adviserId })
    .populate('adviser', 'firstName lastName email')
    .populate('bookings.student', 'user')
    .populate({
      path: 'bookings.student',
      populate: {
        path: 'user',
        select: 'firstName lastName email idNumber'
      }
    });
};

module.exports = mongoose.model('Consultation', ConsultationSchema); 