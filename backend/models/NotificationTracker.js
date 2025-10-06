const mongoose = require('mongoose');

const NotificationTrackerSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  adviser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notificationType: {
    type: String,
    enum: ['session_completion', 'mm_p1', 'mm_p2', 'mm_p3'],
    required: true
  },
  consecutiveCount: {
    type: Number,
    default: 1
  },
  lastNotificationDate: {
    type: Date,
    default: Date.now
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  notifications: [{
    sentAt: {
      type: Date,
      default: Date.now
    },
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
NotificationTrackerSchema.index({ student: 1, adviser: 1, notificationType: 1 });
NotificationTrackerSchema.index({ consecutiveCount: -1, isResolved: 1 });

// Static method to track notification and check for triggers
NotificationTrackerSchema.statics.trackNotification = async function(studentId, adviserId, notificationType, notificationId) {
  try {
    // Find existing tracker for this student-adviser-type combination
    let tracker = await this.findOne({
      student: studentId,
      adviser: adviserId,
      notificationType: notificationType,
      isResolved: false
    });

    if (tracker) {
      // Check if this is within 7 days of last notification (consecutive)
      const daysSinceLastNotification = Math.floor((Date.now() - tracker.lastNotificationDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastNotification <= 7) {
        // Consecutive notification
        tracker.consecutiveCount += 1;
        tracker.lastNotificationDate = new Date();
        tracker.notifications.push({
          sentAt: new Date(),
          notificationId: notificationId
        });
        
        await tracker.save();
        
        // Check for trigger thresholds
        if (tracker.consecutiveCount >= 3) {
          await this.checkAndCreateAdminReport(tracker);
        }
        
        return tracker;
      } else {
        // Reset counter if gap is too long
        tracker.consecutiveCount = 1;
        tracker.lastNotificationDate = new Date();
        tracker.notifications = [{
          sentAt: new Date(),
          notificationId: notificationId
        }];
        
        return await tracker.save();
      }
    } else {
      // Create new tracker
      tracker = await this.create({
        student: studentId,
        adviser: adviserId,
        notificationType: notificationType,
        consecutiveCount: 1,
        lastNotificationDate: new Date(),
        notifications: [{
          sentAt: new Date(),
          notificationId: notificationId
        }]
      });
      
      return tracker;
    }
  } catch (error) {
    console.error('Error tracking notification:', error);
    throw error;
  }
};

// Method to check and create admin report when threshold is reached
NotificationTrackerSchema.statics.checkAndCreateAdminReport = async function(tracker) {
  try {
    const AdminReport = require('./AdminReport');
    const Student = require('./Student');
    const User = require('./User');
    const Class = require('./Class');
    
    // Get student and adviser data
    const student = await Student.findById(tracker.student).populate('user').populate('class');
    const adviser = await User.findById(tracker.adviser);
    
    if (!student || !adviser) {
      console.error('Student or adviser not found for admin report creation');
      return;
    }
    
    // Get semester from student's current class SSP subject
    let semester = '1st'; // default
    if (student.class) {
      // Populate the class with SSP subject to get semester information
      const populatedClass = await Class.findById(student.class._id)
        .populate('sspSubject', 'semester')
        .populate('firstSemester.sspSubject', 'semester')
        .populate('secondSemester.sspSubject', 'semester');
      
      if (populatedClass) {
        // Check if the class has the new semester structure
        if (populatedClass.firstSemester?.sspSubject || populatedClass.secondSemester?.sspSubject) {
          // Use the SSP subject semester from the current semester structure
          if (populatedClass.firstSemester?.sspSubject?.semester) {
            semester = populatedClass.firstSemester.sspSubject.semester.includes('1st') ? '1st' : '2nd';
          } else if (populatedClass.secondSemester?.sspSubject?.semester) {
            semester = populatedClass.secondSemester.sspSubject.semester.includes('2nd') ? '2nd' : '1st';
          }
        } else if (populatedClass.sspSubject?.semester) {
          // For legacy classes, use the main SSP subject semester
          semester = populatedClass.sspSubject.semester.includes('2nd') ? '2nd' : '1st';
        }
      }
    }
    
    if (tracker.notificationType === 'session_completion') {
      // Create session submission report
      await AdminReport.createSessionSubmissionReport(student, adviser, tracker.consecutiveCount, semester);
      console.log(`Created session submission report for student ${student._id} after ${tracker.consecutiveCount} notifications in ${semester} semester`);
    } else if (['mm_p1', 'mm_p2', 'mm_p3'].includes(tracker.notificationType)) {
      // Create M&M enrollment risk report
      const mmType = tracker.notificationType.replace('mm_', '').toUpperCase();
      await AdminReport.createMMEnrollmentReport(student, adviser, mmType, tracker.consecutiveCount, semester);
      console.log(`Created M&M enrollment risk report for student ${student._id}, type ${mmType} after ${tracker.consecutiveCount} notifications in ${semester} semester`);
    }
  } catch (error) {
    console.error('Error creating admin report:', error);
  }
};

// Static method to resolve tracker (when student responds)
NotificationTrackerSchema.statics.resolveTracker = async function(studentId, adviserId, notificationType) {
  try {
    const tracker = await this.findOne({
      student: studentId,
      adviser: adviserId,
      notificationType: notificationType,
      isResolved: false
    });
    
    if (tracker) {
      tracker.isResolved = true;
      tracker.resolvedAt = new Date();
      await tracker.save();
      
      console.log(`Resolved notification tracker for student ${studentId}, type ${notificationType}`);
      return tracker;
    }
  } catch (error) {
    console.error('Error resolving tracker:', error);
  }
};

module.exports = mongoose.model('NotificationTracker', NotificationTrackerSchema);
