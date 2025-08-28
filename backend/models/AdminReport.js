const mongoose = require('mongoose');

const AdminReportSchema = new mongoose.Schema({
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
  issueType: {
    type: String,
    enum: ['session_submission', 'enrollment_risk', 'consultation_escalation'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'dismissed'],
    default: 'open'
  },
  semester: {
    type: String,
    enum: ['1st', '2nd'],
    required: true
  },
  triggerData: {
    // For session submission issues
    sessionNotificationCount: Number,
    lastSessionNotification: Date,
    
    // For enrollment risk issues  
    mmNotificationCount: Number,
    mmType: String, // P1, P2, P3
    lastMMNotification: Date,
    
    // For consultation escalation
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation'
    },
    bookingId: mongoose.Schema.Types.ObjectId,
    escalationReason: String,
    consultationFeedback: String,
    concern: String
  },
  adminNotes: String,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
AdminReportSchema.index({ student: 1, issueType: 1 });
AdminReportSchema.index({ status: 1, createdAt: -1 });
AdminReportSchema.index({ adviser: 1, createdAt: -1 });

// Static method to create session submission report
AdminReportSchema.statics.createSessionSubmissionReport = async function(student, adviser, notificationCount, semester = '1st') {
  const existingReport = await this.findOne({
    student: student._id,
    adviser: adviser._id,
    issueType: 'session_submission',
    semester: semester,
    status: { $in: ['open', 'in_progress'] }
  });

  if (existingReport) {
    // Update existing report
    existingReport.triggerData.sessionNotificationCount = notificationCount;
    existingReport.triggerData.lastSessionNotification = new Date();
    existingReport.updatedAt = new Date();
    
    if (notificationCount >= 5) {
      existingReport.severity = 'high';
    } else if (notificationCount >= 7) {
      existingReport.severity = 'critical';
    }
    
    return await existingReport.save();
  } else {
    // Create new report
    return await this.create({
      student: student._id,
      adviser: adviser._id,
      issueType: 'session_submission',
      semester: semester,
      title: `Session Submission Issues - ${student.user?.firstName} ${student.user?.lastName} (${semester} Semester)`,
      description: `Student has received ${notificationCount} consecutive session completion reminders without response in ${semester} semester. Requires immediate attention to prevent academic delays.`,
      severity: notificationCount >= 5 ? 'high' : 'medium',
      triggerData: {
        sessionNotificationCount: notificationCount,
        lastSessionNotification: new Date()
      }
    });
  }
};

// Static method to create M&M enrollment risk report
AdminReportSchema.statics.createMMEnrollmentReport = async function(student, adviser, mmType, notificationCount, semester = '1st') {
  const existingReport = await this.findOne({
    student: student._id,
    adviser: adviser._id,
    issueType: 'enrollment_risk',
    semester: semester,
    'triggerData.mmType': mmType,
    status: { $in: ['open', 'in_progress'] }
  });

  if (existingReport) {
    // Update existing report
    existingReport.triggerData.mmNotificationCount = notificationCount;
    existingReport.triggerData.lastMMNotification = new Date();
    existingReport.updatedAt = new Date();
    
    if (notificationCount >= 5) {
      existingReport.severity = 'critical';
    }
    
    return await existingReport.save();
  } else {
    // Create new report
    return await this.create({
      student: student._id,
      adviser: adviser._id,
      issueType: 'enrollment_risk',
      semester: semester,
      title: `Enrollment Risk - ${mmType} Exam Issues - ${student.user?.firstName} ${student.user?.lastName} (${semester} Semester)`,
      description: `Student has received ${notificationCount} consecutive ${mmType} exam reminders without submission in ${semester} semester. High risk of not meeting enrollment requirements for next semester.`,
      severity: 'high',
      triggerData: {
        mmNotificationCount: notificationCount,
        mmType: mmType,
        lastMMNotification: new Date()
      }
    });
  }
};

// Static method to create consultation escalation report
AdminReportSchema.statics.createConsultationEscalation = async function(student, adviser, consultationData, semester = '1st') {
  return await this.create({
    student: student._id,
    adviser: adviser._id,
    issueType: 'consultation_escalation',
    semester: semester,
    title: `Consultation Escalation - ${student.user?.firstName} ${student.user?.lastName} (${semester} Semester)`,
    description: `Adviser has escalated a consultation concern requiring administrative intervention in ${semester} semester. Concern: ${consultationData.concern}. Reason for escalation: ${consultationData.reason}.`,
    severity: 'high',
    triggerData: {
      consultationId: consultationData.consultationId,
      bookingId: consultationData.bookingId,
      escalationReason: consultationData.reason,
      consultationFeedback: consultationData.feedback,
      concern: consultationData.concern
    }
  });
};

module.exports = mongoose.model('AdminReport', AdminReportSchema);
