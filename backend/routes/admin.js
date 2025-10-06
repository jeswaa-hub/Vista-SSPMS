const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const AdvisoryClass = require('../models/AdvisoryClass');
const SessionCompletion = require('../models/SessionCompletion');
const Consultation = require('../models/Consultation');
const AdminReport = require('../models/AdminReport');
const NotificationTracker = require('../models/NotificationTracker');
const SessionHistory = require('../models/SessionHistory');
const OdysseyPlan = require('../models/OdysseyPlan');
const SystemOption = require('../models/SystemOption');

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
    console.log('📊 Admin dashboard stats requested...');
    
    // Simple counts without complex calculations
    const totalStudents = await Student.countDocuments({ status: 'active' });
    console.log(`Found ${totalStudents} active students`);
    
    const totalAdvisers = await User.countDocuments({ 
      role: 'adviser', 
      status: 'active' 
    });
    
    console.log(`Found ${totalAdvisers} active advisers`);
    
    const totalConsultations = await Consultation.countDocuments();
    console.log(`Found ${totalConsultations} total consultations`);
    
    const totalClasses = await Class.countDocuments();
    console.log(`Found ${totalClasses} total classes`);
    
    const stats = {
      totalStudents,
      totalAdvisers,
      totalConsultations,
      totalClasses,
      success: true
    };
    
    console.log('✅ Dashboard stats compiled:', stats);
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
      totalStudents: 0,
      totalAdvisers: 0,
      totalConsultations: 0,
      totalClasses: 0
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
    console.log('📈 Chart data requested...');
    
    // Simple chart data structure
    const chartData = {
      sspProgress: { data: [], averageCompletion: 0 },
      mmStatus: { approved: 0, pending: 0, rejected: 0 },
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      yearLevelDistribution: { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 },
      consultationTrends: { labels: [], data: [] },
      totalStudents: 0
    };
    
    // Get basic student count
    const totalStudents = await Student.countDocuments({ status: 'active' });
    chartData.totalStudents = totalStudents;
    
    console.log('✅ Chart data compiled:', chartData);
    res.json(chartData);
    
  } catch (error) {
    console.error('❌ Chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
      sspProgress: { data: [], averageCompletion: 0 },
      mmStatus: { approved: 0, pending: 0, rejected: 0 },
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      yearLevelDistribution: { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 },
      consultationTrends: { labels: [], data: [] },
      totalStudents: 0
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

// Get comprehensive student risk analysis
router.get('/dashboard/student-risk-analysis', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const students = await Student.find({ status: 'active' })
      .populate('user', 'firstName lastName idNumber email')
      .populate('class', 'yearLevel section major');

    const riskAnalysis = [];
    
    for (const student of students) {
      try {
        // Get session completions
        const sessionCompletions = await SessionCompletion.find({ student: student._id });
        const totalSessions = sessionCompletions.length;
        const completedSessions = sessionCompletions.filter(sc => sc.completed).length;
        const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

        // Get M&M submissions
        const mmSubmissions = await require('../models/MidtermFinals').find({ student: student._id });
        const mmCompletionRate = mmSubmissions.length > 0 ? (mmSubmissions.filter(mm => mm.status === 'approved').length / mmSubmissions.length) * 100 : 0;

        // Get consultation history
        const consultations = await Consultation.find({ 'bookings.student': student._id });
        const totalConsultations = consultations.reduce((count, consultation) => {
          return count + consultation.bookings.filter(booking => 
            booking.student.toString() === student._id.toString()
          ).length;
        }, 0);

        // Get recent consultation concerns (financial issues indicator)
        const financialConcerns = consultations.reduce((count, consultation) => {
          return count + consultation.bookings.filter(booking => 
            booking.student.toString() === student._id.toString() && 
            booking.concern === 'Financial Concerns'
          ).length;
        }, 0);

        // Calculate risk score (0-100, higher = more at risk)
        let riskScore = 0;
        const riskFactors = [];

        // Session completion risk (40% weight)
        if (completionRate < 30) {
          riskScore += 40;
          riskFactors.push('Very low session completion (<30%)');
        } else if (completionRate < 50) {
          riskScore += 25;
          riskFactors.push('Low session completion (<50%)');
        } else if (completionRate < 70) {
          riskScore += 15;
          riskFactors.push('Below average session completion (<70%)');
        }

        // M&M submission risk (30% weight)
        if (mmSubmissions.length === 0) {
          riskScore += 20;
          riskFactors.push('No M&M submissions');
        } else if (mmCompletionRate < 50) {
          riskScore += 30;
          riskFactors.push('Low M&M approval rate');
        }

        // Consultation patterns (20% weight)
        if (totalConsultations === 0) {
          riskScore += 15;
          riskFactors.push('No consultation history');
        } else if (financialConcerns > 0) {
          riskScore += 20;
          riskFactors.push('Financial concerns reported');
        }

        // Engagement risk (10% weight)
        const recentActivity = sessionCompletions.filter(sc => 
          new Date(sc.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;
        
        if (recentActivity === 0) {
          riskScore += 10;
          riskFactors.push('No recent activity (30 days)');
        }

        // Determine risk level
        let riskLevel = 'Low';
        if (riskScore >= 70) riskLevel = 'Critical';
        else if (riskScore >= 50) riskLevel = 'High';
        else if (riskScore >= 30) riskLevel = 'Medium';

        riskAnalysis.push({
          student: {
            _id: student._id,
            name: `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim(),
            idNumber: student.user?.idNumber,
            email: student.user?.email,
            class: student.class ? `${student.class.yearLevel} ${student.class.major} - ${student.class.section}` : 'No class assigned'
          },
          riskScore,
          riskLevel,
          riskFactors,
          metrics: {
            sessionCompletion: Math.round(completionRate),
            mmCompletion: Math.round(mmCompletionRate),
            totalConsultations,
            financialConcerns,
            recentActivity
          },
          lastActivity: sessionCompletions.length > 0 ? 
            Math.max(...sessionCompletions.map(sc => new Date(sc.updatedAt).getTime())) : null
        });

      } catch (studentError) {
        console.warn(`Error analyzing student ${student._id}:`, studentError);
      }
    }

    // Sort by risk score (highest first)
    riskAnalysis.sort((a, b) => b.riskScore - a.riskScore);

    // Get summary statistics
    const summary = {
      total: riskAnalysis.length,
      critical: riskAnalysis.filter(s => s.riskLevel === 'Critical').length,
      high: riskAnalysis.filter(s => s.riskLevel === 'High').length,
      medium: riskAnalysis.filter(s => s.riskLevel === 'Medium').length,
      low: riskAnalysis.filter(s => s.riskLevel === 'Low').length,
      avgRiskScore: Math.round(riskAnalysis.reduce((sum, s) => sum + s.riskScore, 0) / riskAnalysis.length)
    };

    res.json({
      summary,
      students: riskAnalysis.slice(0, 50) // Return top 50 at-risk students
    });

  } catch (error) {
    console.error('Error fetching student risk analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching risk analysis'
    });
  }
});

// Get dashboard chart data with real analytics
router.get('/dashboard/chart-data', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Get all students with populated data
    const students = await Student.find({ status: 'active' })
      .populate('user', 'firstName lastName')
      .populate('class', 'yearLevel section major');

    // SSP Progress Distribution
    const sspProgressData = [];
    const mmStatusData = { approved: 0, pending: 0, rejected: 0, none: 0 };
    const riskDistribution = { critical: 0, high: 0, medium: 0, low: 0 };
    const yearLevelData = {};

    for (const student of students) {
      try {
        // SSP Progress
        const sessionCompletions = await SessionCompletion.find({ student: student._id });
        const totalSessions = sessionCompletions.length;
        const completedSessions = sessionCompletions.filter(sc => sc.completed).length;
        const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
        
        sspProgressData.push({
          studentId: student._id,
          name: `${student.user?.firstName} ${student.user?.lastName}`,
          completionRate: Math.round(completionRate),
          yearLevel: student.class?.yearLevel || 'Unassigned'
        });

        // M&M Status
        const mmSubmissions = await require('../models/MidtermFinals').find({ student: student._id });
        if (mmSubmissions.length === 0) {
          mmStatusData.none++;
        } else {
          const approved = mmSubmissions.filter(mm => mm.status === 'approved').length;
          const pending = mmSubmissions.filter(mm => mm.status === 'pending').length;
          const rejected = mmSubmissions.filter(mm => mm.status === 'rejected').length;
          
          if (approved > 0) mmStatusData.approved++;
          else if (pending > 0) mmStatusData.pending++;
          else if (rejected > 0) mmStatusData.rejected++;
        }

        // Risk distribution (simplified calculation)
        let riskScore = 0;
        if (completionRate < 30) riskScore += 40;
        else if (completionRate < 50) riskScore += 25;
        else if (completionRate < 70) riskScore += 15;

        if (mmSubmissions.length === 0) riskScore += 20;

        if (riskScore >= 70) riskDistribution.critical++;
        else if (riskScore >= 50) riskDistribution.high++;
        else if (riskScore >= 30) riskDistribution.medium++;
        else riskDistribution.low++;

        // Year level distribution
        const yearLevel = student.class?.yearLevel || 'Unassigned';
        yearLevelData[yearLevel] = (yearLevelData[yearLevel] || 0) + 1;

      } catch (studentError) {
        console.warn(`Error processing student ${student._id}:`, studentError);
      }
    }

    // Consultation trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const consultationTrends = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthlyConsultations = await Consultation.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });
      
      consultationTrends.unshift({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthlyConsultations
      });
    }

    res.json({
      sspProgress: {
        data: sspProgressData.slice(0, 20), // Top 20 for chart readability
        averageCompletion: Math.round(sspProgressData.reduce((sum, s) => sum + s.completionRate, 0) / sspProgressData.length)
      },
      mmStatus: mmStatusData,
      riskDistribution,
      yearLevelDistribution: yearLevelData,
      consultationTrends,
      totalStudents: students.length
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching chart data'
    });
  }
});

// Get admin reports (flagged students)
router.get('/reports', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { status = 'open', issueType, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    if (status !== 'all') {
      query.status = status;
    }
    if (issueType) {
      query.issueType = issueType;
    }
    
    // Get reports with pagination
    const reports = await AdminReport
      .find(query)
      .populate({
        path: 'student',
        select: 'contactNumber address user class',
        populate: [
          {
            path: 'user',
            select: 'firstName lastName idNumber email contactNumber address'
          },
          {
            path: 'class',
            select: 'yearLevel section major'
          }
        ]
      })
      .populate('adviser', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Get total count for pagination
    const totalReports = await AdminReport.countDocuments(query);
    
    // Get summary statistics
    const summary = await AdminReport.aggregate([
      { $match: { status: { $in: ['open', 'in_progress'] } } },
      { $group: {
        _id: '$issueType',
        count: { $sum: 1 },
        highPriority: {
          $sum: {
            $cond: [{ $in: ['$severity', ['high', 'critical']] }, 1, 0]
          }
        }
      }}
    ]);
    
    const summaryData = {
      session_submission: { count: 0, highPriority: 0 },
      enrollment_risk: { count: 0, highPriority: 0 },
      consultation_escalation: { count: 0, highPriority: 0 }
    };
    
    summary.forEach(item => {
      if (summaryData[item._id]) {
        summaryData[item._id] = {
          count: item.count,
          highPriority: item.highPriority
        };
      }
    });
    
    res.json({
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReports / parseInt(limit)),
        totalReports,
        limit: parseInt(limit)
      },
      summary: summaryData
    });
    
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reports'
    });
  }
});

// Update admin report status
router.put('/reports/:reportId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;
    
    const validStatuses = ['open', 'in_progress', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const report = await AdminReport.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Update report
    report.status = status;
    if (adminNotes) {
      report.adminNotes = adminNotes;
    }
    
    if (status === 'resolved') {
      report.resolvedBy = req.user._id;
      report.resolvedAt = new Date();
    }
    
    await report.save();
    
    res.json({
      message: 'Report updated successfully',
      report
    });
    
  } catch (error) {
    console.error('Error updating admin report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating report'
    });
  }
});

// Get notification tracking statistics
router.get('/notification-tracking', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Get active trackers with high consecutive counts
    const activeTrackers = await NotificationTracker
      .find({ 
        isResolved: false,
        consecutiveCount: { $gte: 2 }
      })
      .populate('student', 'user')
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'firstName lastName idNumber'
        }
      })
      .populate('adviser', 'firstName lastName')
      .sort({ consecutiveCount: -1, lastNotificationDate: -1 })
      .limit(50);
    
    // Get summary by notification type
    const summary = await NotificationTracker.aggregate([
      { $match: { isResolved: false } },
      { $group: {
        _id: '$notificationType',
        count: { $sum: 1 },
        avgConsecutive: { $avg: '$consecutiveCount' },
        maxConsecutive: { $max: '$consecutiveCount' }
      }}
    ]);
    
    res.json({
      activeTrackers,
      summary
    });
    
  } catch (error) {
    console.error('Error fetching notification tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tracking data'
    });
  }
});

// Admin Analytics Endpoints

// Get analytics stats for admin dashboard
router.get('/analytics/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { yearLevel, section, major } = req.query;
    
    // Build filter for students
    const studentFilter = { status: 'active' };
    if (yearLevel) studentFilter['classDetails.yearLevel'] = yearLevel;
    if (section) studentFilter['classDetails.section'] = section;
    if (major) studentFilter['classDetails.major'] = major;
    
    // Get total students with filters
    const totalStudents = await Student.countDocuments(studentFilter);
    
    // Get total consultations with filters
    let consultationFilter = {};
    if (yearLevel || section || major) {
      // Get student IDs that match the filters
      const filteredStudents = await Student.find(studentFilter).select('_id');
      const studentIds = filteredStudents.map(s => s._id);
      
      consultationFilter = {
        'bookings.student': { $in: studentIds }
      };
    }
    
    const totalConsultations = await Consultation.aggregate([
      { $match: consultationFilter },
      { $unwind: '$bookings' },
      { $count: 'total' }
    ]);
    
    // Get at-risk students (students with low SSP completion)
    const atRiskStudents = await Student.aggregate([
      { $match: studentFilter },
      {
        $lookup: {
          from: 'sessionhistories',
          localField: '_id',
          foreignField: 'student',
          as: 'sessions'
        }
      },
      {
        $addFields: {
          sessionCount: { $size: '$sessions' }
        }
      },
      {
        $match: {
          sessionCount: { $lt: 2 } // Less than 2 sessions completed
        }
      },
      {
        $count: 'total'
      }
    ]);
    
    // Calculate average completion rate
    const completionData = await Student.aggregate([
      { $match: studentFilter },
      {
        $lookup: {
          from: 'sessionhistories',
          localField: '_id',
          foreignField: 'student',
          as: 'sessions'
        }
      },
      {
        $addFields: {
          sessionCount: { $size: '$sessions' }
        }
      },
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: '$sessionCount' }
        }
      }
    ]);
    
    const avgCompletion = completionData.length > 0 ? Math.round(completionData[0].avgCompletion * 25) : 0; // Assuming 4 sessions = 100%
    
    res.json({
      totalStudents,
      totalConsultations: totalConsultations.length > 0 ? totalConsultations[0].total : 0,
      atRiskStudents: atRiskStudents.length > 0 ? atRiskStudents[0].total : 0,
      avgCompletion: Math.min(avgCompletion, 100)
    });
    
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get SSP completion data for admin analytics
router.get('/analytics/ssp-completion', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { yearLevel, section, major } = req.query;
    
    // Build filter for students
    const studentFilter = { status: 'active' };
    if (yearLevel) studentFilter['classDetails.yearLevel'] = yearLevel;
    if (section) studentFilter['classDetails.section'] = section;
    if (major) studentFilter['classDetails.major'] = major;
    
    // Get session completion data grouped by session day (Q1, Q2, Q3, Q4)
    const completionData = await SessionHistory.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: '$studentInfo'
      },
      {
        $match: {
          'studentInfo.status': 'active',
          completed: true,
          ...(yearLevel && { 'studentInfo.classDetails.yearLevel': yearLevel }),
          ...(section && { 'studentInfo.classDetails.section': section }),
          ...(major && { 'studentInfo.classDetails.major': major })
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$sessionDay', 4] }, then: 'Q1' },
                { case: { $lte: ['$sessionDay', 8] }, then: 'Q2' },
                { case: { $lte: ['$sessionDay', 12] }, then: 'Q3' },
                { case: { $lte: ['$sessionDay', 16] }, then: 'Q4' }
              ],
              default: 'Q4'
            }
          },
          students: { $addToSet: '$student' }
        }
      },
      {
        $addFields: {
          count: { $size: '$students' }
        }
      },
      {
        $project: {
          period: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { period: 1 }
      }
    ]);
    
    // Ensure all quarters are represented
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const result = quarters.map(quarter => {
      const existing = completionData.find(item => item.period === quarter);
      return existing || { period: quarter, count: 0 };
    });
    
    res.json({
      completionRates: result
    });
    
  } catch (error) {
    console.error('Error fetching SSP completion data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system options for filters
router.get('/analytics/system-options', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const systemOptions = await SystemOption.findOne().lean();
    
    if (!systemOptions) {
      return res.json({
        yearLevels: ['2nd', '3rd', '4th'],
        sections: {
          '2nd': ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'],
          '3rd': ['South-1', 'South-2', 'South-3'],
          '4th': ['South-1', 'South-2']
        },
        majors: {
          '2nd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
          '3rd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
          '4th': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security']
        }
      });
    }
    
    res.json({
      yearLevels: systemOptions.class?.yearLevels || ['2nd', '3rd', '4th'],
      sections: systemOptions.class?.sections || {
        '2nd': ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'],
        '3rd': ['South-1', 'South-2', 'South-3'],
        '4th': ['South-1', 'South-2']
      },
      majors: systemOptions.class?.majors || {
        '2nd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
        '3rd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
        '4th': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security']
      }
    });
    
  } catch (error) {
    console.error('Error fetching system options:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 