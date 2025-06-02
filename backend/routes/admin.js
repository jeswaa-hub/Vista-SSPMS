const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AdvisoryClass = require('../models/AdvisoryClass');
const SessionCompletion = require('../models/SessionCompletion');
const Consultation = require('../models/Consultation');

// Get all classes with adviser information for admin dashboard
router.get('/dashboard/classes', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Get all active classes
    const classes = await Class.find({ status: 'active' })
      .populate('sspSubject', 'sspCode name sessions semester schoolYear hours')
      .lean();
    
    // Get all advisory class assignments
    const advisoryClasses = await AdvisoryClass.find()
      .populate('adviser', 'firstName lastName salutation email status')
      .lean();
    
    // Create a map of class to adviser
    const classAdviserMap = {};
    advisoryClasses.forEach(ac => {
      if (ac.class && ac.adviser) {
        classAdviserMap[ac.class.toString()] = ac.adviser;
      }
    });
    
    // Get student counts for each class
    const enhancedClasses = await Promise.all(classes.map(async (classItem) => {
      const studentCount = await Student.countDocuments({
        class: classItem._id,
        status: 'active'
      });
      
      return {
        ...classItem,
        adviser: classAdviserMap[classItem._id.toString()] || null,
        studentCount
      };
    }));
    
    res.json(enhancedClasses);
  } catch (error) {
    console.error('Error fetching admin dashboard classes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching classes' 
    });
  }
});

// Get system-wide statistics for admin dashboard
router.get('/dashboard/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Count active advisers
    const totalAdvisers = await User.countDocuments({ 
      role: 'adviser', 
      status: 'active' 
    });
    
    // Count total consultations across all advisers
    const totalConsultations = await Consultation.countDocuments();
    
    // Get all students
    const allStudents = await Student.find({ status: 'active' });
    
    let totalSSPCompletion = 0;
    let studentsAtRisk = 0;
    let totalComplianceScore = 0;
    
    // Analyze each student
    for (const student of allStudents) {
      try {
        // Get SSP completion
        const sessionCompletions = await SessionCompletion.find({
          student: student._id
        });
        
        const totalSessions = sessionCompletions.length;
        const completedSessions = sessionCompletions.filter(sc => sc.completed).length;
        const studentSSPCompletion = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
        
        totalSSPCompletion += studentSSPCompletion;
        
        // Check if student is at risk (low completion rates or missing requirements)
        if (studentSSPCompletion < 50) {
          studentsAtRisk++;
        }
        
        // Calculate compliance score (simplified)
        let complianceScore = 0;
        
        // Check Odyssey Plan
        const odysseyPlans = await require('../models/OdysseyPlan').find({
          student: student._id
        });
        if (odysseyPlans.length > 0) complianceScore += 30;
        
        // Check M&M submissions
        const mmSubmissions = await require('../models/MidtermFinals').find({
          student: student._id
        });
        if (mmSubmissions.length >= 3) complianceScore += 40;
        
        // Check SSP completion
        if (studentSSPCompletion >= 70) complianceScore += 30;
        
        totalComplianceScore += complianceScore;
        
      } catch (studentError) {
        console.warn(`Error analyzing student ${student._id}:`, studentError);
      }
    }
    
    const totalStudentCount = allStudents.length || 1;
    
    // Calculate average response time (mock data for now)
    const avgResponseTime = Math.floor(Math.random() * 24) + 1;
    
    // Calculate high performers (mock data)
    const highPerformers = Math.floor(totalAdvisers * 0.7);
    
    // Calculate active sessions (mock data)
    const activeSessions = Math.floor(totalStudentCount * 0.3);
    
    res.json({
      totalAdvisers,
      totalConsultations,
      studentsAtRisk,
      avgSSPCompletion: Math.round(totalSSPCompletion / totalStudentCount),
      complianceRate: Math.round(totalComplianceScore / totalStudentCount),
      avgResponseTime,
      highPerformers,
      activeSessions
    });
    
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching stats'
    });
  }
});

// Get class analytics for specific class (admin view)
router.get('/dashboard/classes/:classId/analytics', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Get students in this class
    const students = await Student.find({ class: classId, status: 'active' });
    const totalStudents = students.length;
    
    if (totalStudents === 0) {
      return res.json({
        avgSSPCompletion: 0,
        complianceRate: 0,
        studentsAtRisk: 0,
        totalConsultations: 0
      });
    }
    
    let totalSSPCompletion = 0;
    let studentsAtRisk = 0;
    let totalComplianceScore = 0;
    let totalConsultations = 0;
    
    // Analyze each student
    for (const student of students) {
      try {
        // Get SSP completion
        const sessionCompletions = await SessionCompletion.find({
          student: student._id,
          class: classId
        });
        
        const totalSessions = sessionCompletions.length;
        const completedSessions = sessionCompletions.filter(sc => sc.completed).length;
        const studentSSPCompletion = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
        
        totalSSPCompletion += studentSSPCompletion;
        
        // Check if student is at risk
        if (studentSSPCompletion < 50) {
          studentsAtRisk++;
        }
        
        // Calculate compliance score
        let complianceScore = 0;
        
        const odysseyPlans = await require('../models/OdysseyPlan').find({
          student: student._id
        });
        if (odysseyPlans.length > 0) complianceScore += 30;
        
        const mmSubmissions = await require('../models/MidtermFinals').find({
          student: student._id
        });
        if (mmSubmissions.length >= 3) complianceScore += 40;
        
        if (studentSSPCompletion >= 70) complianceScore += 30;
        
        totalComplianceScore += complianceScore;
        
        // Count consultations for this student
        const consultations = await Consultation.find({
          'bookings.student': student._id
        });
        totalConsultations += consultations.reduce((count, consultation) => {
          return count + consultation.bookings.filter(booking => 
            booking.student.toString() === student._id.toString()
          ).length;
        }, 0);
        
      } catch (studentError) {
        console.warn(`Error analyzing student ${student._id}:`, studentError);
      }
    }
    
    res.json({
      avgSSPCompletion: Math.round(totalSSPCompletion / totalStudents),
      complianceRate: Math.round(totalComplianceScore / totalStudents),
      studentsAtRisk,
      totalConsultations
    });
    
  } catch (error) {
    console.error('Error fetching class analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics'
    });
  }
});

// Get chart data for all classes (admin overview)
router.get('/dashboard/chart-data', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Get all students across all classes
    const students = await Student.find({ status: 'active' })
      .populate('user', 'firstName lastName');
    
    // Get all class IDs
    const classIds = [...new Set(students.map(s => s.class).filter(Boolean))];
    
    const chartData = {
      sspProgress: await generateSSPProgressData(students, classIds),
      performance: await generatePerformanceData(students, classIds),
      mmTimeline: await generateMMTimelineData(students, classIds),
      consultations: await generateSystemConsultationData()
    };
    
    res.json(chartData);
    
  } catch (error) {
    console.error('Error fetching system chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching chart data'
    });
  }
});

// Get chart data for specific class (admin view)
router.get('/dashboard/classes/:classId/chart-data', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Get students in this specific class
    const students = await Student.find({ 
      class: classId, 
      status: 'active' 
    }).populate('user', 'firstName lastName');
    
    const chartData = {
      sspProgress: await generateSSPProgressData(students, [classId]),
      performance: await generatePerformanceData(students, [classId]),
      mmTimeline: await generateMMTimelineData(students, [classId]),
      consultations: await generateClassConsultationData(classId)
    };
    
    res.json(chartData);
    
  } catch (error) {
    console.error('Error fetching class chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching class chart data'
    });
  }
});

// Helper function to generate SSP progress timeline data
async function generateSSPProgressData(students, classIds) {
  try {
    const weeks = [];
    const completionRates = [];
    const targets = [];
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (8 * 7)); // 8 weeks ago
    
    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      weeks.push(`Week ${i + 1}`);
      
      // Calculate completion rate for this week
      let totalSessions = 0;
      let completedSessions = 0;
      
      for (const student of students) {
        const sessionCompletions = await SessionCompletion.find({
          student: student._id,
          class: { $in: classIds },
          completedAt: {
            $gte: weekStart,
            $lte: weekEnd
          }
        });
        
        const allSessions = await SessionCompletion.find({
          student: student._id,
          class: { $in: classIds },
          createdAt: { $lte: weekEnd }
        });
        
        totalSessions += allSessions.length;
        completedSessions += allSessions.filter(s => s.completed && s.completedAt <= weekEnd).length;
      }
      
      const weekRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
      completionRates.push(weekRate);
      
      // Target rate increases progressively
      const targetRate = Math.min(85, 40 + (i * 6));
      targets.push(targetRate);
    }
    
    return {
      labels: weeks,
      completionRates,
      targets
    };
    
  } catch (error) {
    console.error('Error generating SSP progress data:', error);
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
      completionRates: [0, 0, 0, 0, 0, 0, 0, 0],
      targets: [40, 46, 52, 58, 64, 70, 76, 82]
    };
  }
}

// Helper function to generate performance distribution data
async function generatePerformanceData(students, classIds) {
  try {
    const performance = {
      excellent: 0,
      good: 0,
      average: 0,
      belowAverage: 0,
      poor: 0
    };
    
    for (const student of students) {
      const sessionCompletions = await SessionCompletion.find({
        student: student._id,
        class: { $in: classIds }
      });
      
      const totalSessions = sessionCompletions.length;
      const completedSessions = sessionCompletions.filter(sc => sc.completed).length;
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
      
      if (completionRate >= 90) {
        performance.excellent++;
      } else if (completionRate >= 80) {
        performance.good++;
      } else if (completionRate >= 70) {
        performance.average++;
      } else if (completionRate >= 60) {
        performance.belowAverage++;
      } else {
        performance.poor++;
      }
    }
    
    return performance;
    
  } catch (error) {
    console.error('Error generating performance data:', error);
    return {
      excellent: 0,
      good: 0,
      average: 0,
      belowAverage: 0,
      poor: 0
    };
  }
}

// Helper function to generate M&M submission timeline data
async function generateMMTimelineData(students, classIds) {
  try {
    const MidtermFinals = require('../models/MidtermFinals');
    
    const weeks = [];
    const p1Submissions = [];
    const p2Submissions = [];
    const p3Submissions = [];
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (12 * 7)); // 12 weeks ago
    
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      weeks.push(`W${i + 1}`);
      
      const weekSubmissions = await MidtermFinals.find({
        student: { $in: students.map(s => s._id) },
        submissionDate: {
          $gte: weekStart,
          $lte: weekEnd
        }
      });
      
      const p1Count = weekSubmissions.filter(s => s.examType === 'Prelims').length;
      const p2Count = weekSubmissions.filter(s => s.examType === 'Midterms').length;
      const p3Count = weekSubmissions.filter(s => s.examType === 'Finals').length;
      
      p1Submissions.push(p1Count);
      p2Submissions.push(p2Count);
      p3Submissions.push(p3Count);
    }
    
    return {
      labels: weeks,
      p1Submissions,
      p2Submissions,
      p3Submissions
    };
    
  } catch (error) {
    console.error('Error generating M&M timeline data:', error);
    return {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
      p1Submissions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      p2Submissions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      p3Submissions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
  }
}

// Helper function to generate system-wide consultation data
async function generateSystemConsultationData() {
  try {
    const consultations = await Consultation.find();
    
    const concerns = {};
    
    for (const consultation of consultations) {
      for (const booking of consultation.bookings) {
        if (booking.concern) {
          concerns[booking.concern] = (concerns[booking.concern] || 0) + 1;
        }
      }
    }
    
    const labels = Object.keys(concerns);
    const values = Object.values(concerns);
    
    return {
      labels: labels.length > 0 ? labels : ['No Data'],
      values: values.length > 0 ? values : [1]
    };
    
  } catch (error) {
    console.error('Error generating system consultation data:', error);
    return {
      labels: ['Academic Performance', 'Career Planning', 'Time Management', 'Financial Concerns', 'Mental Health', 'Other'],
      values: [0, 0, 0, 0, 0, 0]
    };
  }
}

// Helper function to generate consultation data for specific class
async function generateClassConsultationData(classId) {
  try {
    const students = await Student.find({ class: classId });
    const studentIds = students.map(s => s._id);
    
    const consultations = await Consultation.find();
    
    const concerns = {};
    
    for (const consultation of consultations) {
      for (const booking of consultation.bookings) {
        if (booking.concern && studentIds.includes(booking.student)) {
          concerns[booking.concern] = (concerns[booking.concern] || 0) + 1;
        }
      }
    }
    
    const labels = Object.keys(concerns);
    const values = Object.values(concerns);
    
    return {
      labels: labels.length > 0 ? labels : ['No Data'],
      values: values.length > 0 ? values : [1]
    };
    
  } catch (error) {
    console.error('Error generating class consultation data:', error);
    return {
      labels: ['Academic Performance', 'Career Planning', 'Time Management', 'Financial Concerns', 'Mental Health', 'Other'],
      values: [0, 0, 0, 0, 0, 0]
    };
  }
}

module.exports = router; 