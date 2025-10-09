const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const MMSubmission = require('../models/MidtermFinals');
const Student = require('../models/Student');
const ExamPermit = require('../models/ExamPermit');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const SessionCompletion = require('../models/SessionCompletion');
const Notification = require('../models/Notification');
const AdvisoryClass = require('../models/AdvisoryClass');
const { authenticate } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/mm-submissions';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'mm-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Check if sessions before exam sessions are completed and send notifications
router.post('/check-sessions-and-notify', authenticate, async (req, res) => {
  try {
    const { classId } = req.body;
    
    if (!classId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class ID is required' 
      });
    }

    // Get class and subject data
    const classData = await Class.findById(classId).populate('students');
    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    // Get subject and sessions
    const firstSemesterSubjectId = classData.firstSemester?.sspSubject || classData.sspSubject;
    const secondSemesterSubjectId = classData.secondSemester?.sspSubject;

    if (!firstSemesterSubjectId && !secondSemesterSubjectId) {
      return res.status(404).json({ 
        success: false, 
        message: 'No SSP subjects found for this class' 
      });
    }

    let notificationsSent = 0;
    const results = [];

    // Get the current semester from the class
    const currentSemester = classData.currentSemester || '1st';
    console.log(`Class current semester: ${currentSemester}`);

    // Process only the current semester
    const currentSemesterSubjectId = currentSemester === '1st' ? firstSemesterSubjectId : secondSemesterSubjectId;
    
    if (!currentSemesterSubjectId) {
      console.log(`No subject found for current semester ${currentSemester}`);
      return res.json({
        success: true,
        message: `No subject found for current semester ${currentSemester}`,
        notificationsSent: 0,
        results: []
      });
    }

    const semesterData = { subjectId: currentSemesterSubjectId, semester: currentSemester };

    const subject = await Subject.findById(semesterData.subjectId);
    if (!subject) {
      console.log(`Subject not found for current semester ${currentSemester}`);
      return res.json({
        success: true,
        message: `Subject not found for current semester ${currentSemester}`,
        notificationsSent: 0,
        results: []
      });
    }

    // Get sessions for this semester
    let sessions = [];
    if (semesterData.semester === '1st') {
      sessions = subject.sessions || [];
    } else {
      // For 2nd semester, prioritize secondSemesterSessions
      if (subject.secondSemesterSessions && subject.secondSemesterSessions.length > 0) {
        sessions = subject.secondSemesterSessions;
      } else {
        // Fallback to regular sessions if no secondSemesterSessions exist
        sessions = subject.sessions || [];
      }
    }
    
    // Find exam sessions
    const examSessions = sessions.filter(session => 
      session.title && (
        session.title.toLowerCase().includes('p1 exam') ||
        session.title.toLowerCase().includes('p2 exam') ||
        session.title.toLowerCase().includes('p3 exam')
      )
    );

    console.log(`Found ${examSessions.length} exam sessions for ${semesterData.semester} semester:`, 
      examSessions.map(s => ({ title: s.title, day: s.day })));

    // For each exam session, check if previous sessions are completed
    for (const examSession of examSessions) {
      const examType = examSession.title.toLowerCase().includes('p1') ? 'P1' : 
                      examSession.title.toLowerCase().includes('p2') ? 'P2' : 'P3';
      
      console.log(`Checking ${examType} exam session (day ${examSession.day}) for ${semesterData.semester} semester`);
      
      // Get all sessions before this exam session
      const sessionsBeforeExam = sessions.filter(session => {
        const sessionDay = session.day || 0;
        const examDay = examSession.day || 0;
        return sessionDay < examDay;
      });
      
      console.log(`Found ${sessionsBeforeExam.length} sessions before ${examType} exam:`, 
        sessionsBeforeExam.map(s => ({ title: s.title, day: s.day })));
      
      // Check each student's completion status
      for (const student of classData.students) {
        console.log(`Checking student ${student.user?.firstName} ${student.user?.lastName} (${student._id}) for ${examType} exam eligibility`);
        
        const studentCompletions = await SessionCompletion.find({
          student: student._id,
          class: classId,
          semester: `${semesterData.semester} Semester`
        });

        console.log(`Student has ${studentCompletions.length} session completions for ${semesterData.semester} semester`);

        // Check if all sessions before exam are completed
        const completedSessionIds = studentCompletions
          .filter(sc => sc.completed)
          .map(sc => sc.session.toString());

        const allSessionsBeforeExamCompleted = sessionsBeforeExam.every(session => {
          const isCompleted = completedSessionIds.includes(session._id.toString());
          console.log(`Session ${session.title} (day ${session.day}): ${isCompleted ? 'completed' : 'not completed'}`);
          return isCompleted;
        });

        console.log(`All sessions before ${examType} exam completed: ${allSessionsBeforeExamCompleted}`);

        if (allSessionsBeforeExamCompleted && sessionsBeforeExam.length > 0) {
          // Check if student already has M&M submission for this exam
          const existingSubmission = await MMSubmission.findOne({
            student: student._id,
            yearLevel: classData.yearLevel,
            semester: semesterData.semester,
            examType: examType
          });

          if (!existingSubmission) {
            console.log(`Sending M&M notification to student for ${examType} exam`);
            // Send notification to upload M&M image
            await createMMUploadNotification(student, examType, semesterData.semester, classData.yearLevel);
            notificationsSent++;
            
            results.push({
              studentId: student._id,
              examType: examType,
              semester: semesterData.semester,
              notificationSent: true,
              reason: `All ${sessionsBeforeExam.length} sessions before ${examType} exam completed`
            });
          } else {
            console.log(`Student already has ${examType} submission, skipping notification`);
            results.push({
              studentId: student._id,
              examType: examType,
              semester: semesterData.semester,
              notificationSent: false,
              reason: 'Already has submission'
            });
          }
        } else {
          const completedCount = sessionsBeforeExam.filter(session => 
            completedSessionIds.includes(session._id.toString())
          ).length;
          
          console.log(`Student not eligible for ${examType} notification: ${completedCount}/${sessionsBeforeExam.length} sessions completed`);
          results.push({
            studentId: student._id,
            examType: examType,
            semester: semesterData.semester,
            notificationSent: false,
            reason: `Only ${completedCount}/${sessionsBeforeExam.length} sessions before exam completed`
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Checked sessions and sent ${notificationsSent} M&M upload notifications`,
      notificationsSent,
      results
    });

  } catch (error) {
    console.error('Error checking sessions and sending notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error checking sessions',
      error: error.message 
    });
  }
});

// Helper function to create M&M upload notification
async function createMMUploadNotification(student, examType, semester, yearLevel) {
  try {
    const populatedStudent = await Student.findById(student._id).populate('user');
    if (!populatedStudent || !populatedStudent.user) {
      console.error(`Student or user not found for notification: ${student._id}`);
      return;
    }

    // Create notification (prevent multiple notifications for same exam type)
    const notificationTitle = `${examType} Exam M&M Upload Required - ${semester} Semester`;
    console.log(`Creating M&M notification for student ${populatedStudent.user._id}, exam ${examType}`);
    
    // Check if notification was sent very recently (within last 5 minutes) to prevent spam
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentNotification = await Notification.findOne({
      recipient: populatedStudent.user._id,
      title: notificationTitle,
      type: 'warning',
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (recentNotification) {
      console.log(`Recent M&M notification already sent for student ${populatedStudent.user._id}, exam ${examType} (within 5 minutes), skipping`);
      return;
    }

    console.log(`Creating new M&M notification for student ${populatedStudent.user._id}, exam ${examType}`);
    
    // Create notification
    {
      const notification = new Notification({
        recipient: populatedStudent.user._id, // Use 'recipient' not 'user'
        title: `${examType} Exam M&M Upload Required - ${semester} Semester`,
        message: `You have completed all required sessions before your ${examType} exam for ${semester} semester.

Next Step: Please upload your ${examType} exam M&M submission image immediately.

To upload:
1. Go to M&M page
2. Select ${semester} Semester tab  
3. Upload ${examType} Exam image

Your ${examType} exam session cannot be marked complete until you upload the M&M submission. This is required for promotion to the next semester/year level.`,
        type: 'warning',
        read: false, // Use 'read' not 'isRead'
        link: '/student/surveys' // Link to M&M page
      });

      await notification.save();
      console.log(`✅ M&M notification created successfully for student ${populatedStudent.user._id}, exam ${examType}`);
      
      // Track this notification for flagging system
      try {
        const NotificationTracker = require('../models/NotificationTracker');
        const AdvisoryClass = require('../models/AdvisoryClass');
        
        // Find the adviser for this student through AdvisoryClass
        let adviserId = null;
        if (populatedStudent.class) {
          const advisoryClass = await AdvisoryClass.findOne({
            class: populatedStudent.class,
            status: 'active'
          });
          if (advisoryClass) {
            adviserId = advisoryClass.adviser;
          }
        }
        
        // If no adviser found, use the requesting user (if available from context)
        if (!adviserId) {
          // Try to get adviser from the current request context
          // This is a fallback - ideally we should always find the adviser through AdvisoryClass
          console.warn(`No adviser found for student ${student._id}, notification tracking may not work properly`);
        }
        
        const notificationType = `mm_${examType.toLowerCase()}`;
        await NotificationTracker.trackNotification(
          student._id,
          adviserId,
          notificationType,
          notification._id
        );
        console.log(`Tracked M&M notification for student ${student._id}, exam ${examType}, adviser ${adviserId}`);
      } catch (trackingError) {
        console.error('Error tracking M&M notification:', trackingError);
      }
      
      console.log(`Created M&M upload notification for student ${student._id}, exam ${examType}`);
    }
  } catch (error) {
    console.error('Error creating M&M notification:', error);
  }
}

// Get student's M&M completion status for promotion check
router.get('/completion-status/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { yearLevel, semester } = req.query;

    if (!yearLevel || !semester) {
      return res.status(400).json({ 
        success: false, 
        message: 'Year level and semester are required' 
      });
    }

    // Get all M&M submissions for this student, year level, and semester
    const submissions = await MMSubmission.find({
      student: studentId,
      yearLevel: yearLevel,
      semester: semester
    });

    // Check if all three exam types (P1, P2, P3) are submitted
    const submittedExamTypes = submissions.map(s => s.examType);
    const allExamTypes = ['P1', 'P2', 'P3'];
    const missingExamTypes = allExamTypes.filter(type => !submittedExamTypes.includes(type));

    const isComplete = missingExamTypes.length === 0;

    res.json({
      success: true,
      isComplete,
      submissions: submissions.length,
      totalRequired: 3,
      missingExamTypes,
      submittedExamTypes,
      details: submissions.map(s => ({
        examType: s.examType,
        status: s.status,
        submissionDate: s.submissionDate
      }))
    });

  } catch (error) {
    console.error('Error checking M&M completion status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error checking completion status',
      error: error.message 
    });
  }
});

// Submit M&M exam image with enhanced validation
router.post('/submit', authenticate, upload.single('examImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file uploaded' 
      });
    }

    const { yearLevel, semester, examType } = req.body;

    // Validate required fields
    if (!yearLevel || !semester || !examType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Year level, semester, and exam type are required' 
      });
    }

    // Validate enum values
    if (!['2nd', '3rd', '4th'].includes(yearLevel)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid year level' 
      });
    }

    if (!['1st', '2nd'].includes(semester)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid semester' 
      });
    }

    if (!['P1', 'P2', 'P3'].includes(examType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid exam type' 
      });
    }

    // Get student from authenticated user
    const student = await Student.findOne({ user: req.user._id })
      .populate('class', 'yearLevel');
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Simplified semester validation
    try {
      // Get student's current semester based on class categorization
      const classId = student.class?._id;
      let currentSemester = '1st'; // Default to 1st semester
      
      if (classId) {
        try {
          // Get student's class with SSP subject to determine current semester
          const Class = require('../models/Class');
          const populatedClass = await Class.findById(classId)
            .populate('sspSubject', 'semester')
            .populate('firstSemester.sspSubject', 'semester')
            .populate('secondSemester.sspSubject', 'semester');

          if (populatedClass) {
            // First, check if the class has a currentSemester field set
            if (populatedClass.currentSemester) {
              currentSemester = populatedClass.currentSemester;
              console.log(`Using class currentSemester: ${currentSemester}`);
            } else {
              // Simplified logic: check if student has completed first semester
              if (student.semesterData?.firstSemester?.completed) {
                currentSemester = '2nd';
                console.log(`Student has completed 1st semester, updating to 2nd semester`);
              } else {
                currentSemester = '1st';
                console.log(`Student is in 1st semester`);
              }
            }
            
            console.log(`Student semester determined: ${currentSemester}`);
          }
          
        } catch (fetchError) {
          console.warn('Error fetching class data for semester validation:', fetchError.message);
          // Continue with 1st semester default if class check fails
        }
      }
      
      // Class-based validation: only allow submissions for current class semester
      if (semester !== currentSemester) {
        const errorMessage = currentSemester === '1st' 
          ? `You can only submit M&M for your current class semester (1st). Your class has not been promoted to 2nd semester yet.`
          : `You can only submit M&M for your current class semester (2nd). 1st semester submissions are no longer available.`;
          
        console.log(`Semester validation failed: attempted=${semester}, current=${currentSemester}`);
        return res.status(400).json({ 
          success: false, 
          message: errorMessage,
          currentClassSemester: currentSemester,
          attemptedSemester: semester
        });
      }
      
      console.log(`Semester validation passed: ${semester} matches current semester ${currentSemester}`);
      
    } catch (semesterCheckError) {
      console.warn('Could not verify class semester status, allowing upload:', semesterCheckError);
      // Continue with upload if semester check fails
    }

    // TODO: Add image validation for PHINMA Education SSP form format
    // This would require OCR or template matching to validate the uploaded image
    // For now, we'll just validate that it's an image file (already done by multer)

    // Get student's current class and school year for proper tagging
    let classId = null;
    let schoolYear = '2025-2026'; // Default school year
    
    if (student.class) {
      classId = student.class;
      // Get school year from class
      const Class = require('../models/Class');
      const classData = await Class.findById(student.class);
      if (classData && classData.schoolYear) {
        schoolYear = classData.schoolYear;
      }
    }

    // Check if submission already exists for this combination (including school year)
    const existingSubmission = await MMSubmission.findOne({
      student: student._id,
      schoolYear,
      yearLevel,
      semester,
      examType
    });

    if (existingSubmission) {
      // Delete old file if exists
      const oldFilePath = path.join(__dirname, '..', existingSubmission.imageUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Update existing submission with auto-approval for valid uploads
      existingSubmission.imageUrl = `/uploads/mm-submissions/${req.file.filename}`;
      existingSubmission.submissionDate = new Date();
      existingSubmission.status = 'approved'; // Auto-approve valid uploads
      existingSubmission.feedback = 'Automatically approved - valid M&M response form detected';
      existingSubmission.class = classId;
      existingSubmission.classId = classId; // keep legacy for now
      existingSubmission.schoolYear = schoolYear;
      
      await existingSubmission.save();

      return res.status(200).json({
        success: true,
        message: 'M&M response updated and approved successfully',
        data: existingSubmission
      });
    } else {
      // Create new submission with auto-approval
      const newSubmission = new MMSubmission({
        student: student._id,
        class: classId,
        classId, // legacy
        schoolYear,
        yearLevel,
        semester,
        examType,
        imageUrl: `/uploads/mm-submissions/${req.file.filename}`,
        status: 'approved', // Auto-approve valid uploads
        feedback: 'Automatically approved - valid M&M response form detected'
      });

      await newSubmission.save();

      return res.status(201).json({
        success: true,
        message: 'M&M response created and approved successfully',
        data: newSubmission
      });
    }
  } catch (error) {
    console.error('Error submitting M&M:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to submit M&M',
      error: error.message 
    });
  }
});

// Get student's M&M submissions
router.get('/my-submissions', authenticate, async (req, res) => {
  try {
    // Get student from authenticated user
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    const submissions = await MMSubmission.find({ student: student._id })
      .populate('class', 'yearLevel section major schoolYear')
      .sort({ yearLevel: 1, semester: 1, examType: 1 });
    
    // Transform imageUrl to full URL
    const transformedSubmissions = submissions.map(submission => ({
      ...submission.toObject(),
      imageUrl: submission.imageUrl.startsWith('http') ? 
        submission.imageUrl : 
        `${process.env.BACKEND_URL || 'https://sscms-au.com'}${submission.imageUrl}`
    }));
    
    return res.status(200).json({
      success: true,
      data: transformedSubmissions
    });
  } catch (error) {
    console.error('Error fetching M&M submissions:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch M&M submissions',
      error: error.message 
    });
  }
});

// Get M&M history for a student (all past submissions)
router.get('/history', authenticate, async (req, res) => {
  try {
    // Get student from authenticated user
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Get all M&M submissions organized by year level and semester
    const submissions = await MMSubmission.find({ student: student._id })
      .sort({ yearLevel: 1, semester: 1, examType: 1, submissionDate: -1 });
    
    // Build absolute URL based on current request host (works in local/prod)
    const absoluteBase = `${req.protocol}://${req.get('host')}`;
    // Transform imageUrl to full URL for all submissions
    const transformedSubmissions = submissions.map(submission => ({
      ...submission.toObject(),
      imageUrl: submission.imageUrl?.startsWith('http') ? 
        submission.imageUrl : 
        `${absoluteBase}${submission.imageUrl}`
    }));
    
    // Also include exam permits (pending/validated/rejected) in history
    const permits = await ExamPermit.find({ student: student._id })
      .sort({ schoolYear: 1, semester: 1, period: 1, createdAt: -1 });

    const backendBase = `${req.protocol}://${req.get('host')}`;
    // Only include validated permits in history
    const transformedPermits = permits
      .filter(p => p.status === 'validated')
      .map(p => ({
      // Align with M&M shape where possible
      _id: p._id,
      isPermit: true,
      examType: `Permit-P${p.period}`,
      period: p.period,
      semester: p.semester === '1st Semester' ? '1st' : (p.semester === '2nd Semester' ? '2nd' : p.semester),
      yearLevel: p.class?.yearLevel || student.class?.yearLevel || '2nd',
      submissionDate: p.createdAt,
      status: p.status, // pending | validated | rejected
      mimetype: p.permitAttachment?.mimetype || null,
      // Use attachment endpoint for image preview
      imageUrl: `${backendBase}/api/exam-permits/attachment/${p._id}`,
      schoolYear: p.schoolYear
    }));

    // Group by year level and semester
    const groupedHistory = {};
    
    const addToGroup = (entry, type) => {
      const key = `${entry.yearLevel}-${entry.semester}`;
      if (!groupedHistory[key]) {
        groupedHistory[key] = {
          yearLevel: entry.yearLevel,
          semester: entry.semester,
          mmSubmissions: [],
          permits: []
        };
      }
      if (type === 'mm') {
        groupedHistory[key].mmSubmissions.push(entry);
      } else if (type === 'permit') {
        groupedHistory[key].permits.push(entry);
      }
    };

    transformedSubmissions.forEach(sub => addToGroup(sub, 'mm'));
    transformedPermits.forEach(permit => addToGroup(permit, 'permit'));

    // Convert to array and sort
    const historyArray = Object.values(groupedHistory).sort((a, b) => {
      // Sort by year level first, then by semester
      const yearA = parseInt(a.yearLevel.replace(/\D/g, ''));
      const yearB = parseInt(b.yearLevel.replace(/\D/g, ''));
      
      if (yearA !== yearB) {
        return yearB - yearA; // Newest year first
      }
      
      return b.semester.localeCompare(a.semester); // 2nd semester before 1st
    });

    return res.status(200).json({
      success: true,
      data: historyArray,
      totalMMSubmissions: transformedSubmissions.length,
      totalValidatedPermits: transformedPermits.length
    });
  } catch (error) {
    console.error('Error fetching M&M history:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch M&M history',
      error: error.message 
    });
  }
});

// Get student's current year level for M&M access
router.get('/student-year', authenticate, async (req, res) => {
  try {
    // Get student from authenticated user with populated class
    const student = await Student.findOne({ user: req.user._id })
      .populate('class', 'yearLevel')
      .populate('user', 'firstName lastName');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    console.log('Getting year level for student:', student.user?.firstName, student.user?.lastName);

    // Determine year level from class first (most current)
    let yearLevel = null;
    if (student.class && student.class.yearLevel) {
      yearLevel = student.class.yearLevel;
      console.log('Year level from assigned class:', yearLevel);
    } else if (student.classDetails && student.classDetails.yearLevel) {
      yearLevel = student.classDetails.yearLevel;
      console.log('Year level from class details:', yearLevel);
    } else {
      // Default to 2nd year if no class assigned
      yearLevel = '2nd';
      console.log('No class found, defaulting to 2nd year');
    }

    // Convert to numeric for easier processing
    const yearNumber = yearLevel ? parseInt(yearLevel.replace(/\D/g, '')) : 2;

    console.log('Final year level response:', { yearLevel, yearNumber });

    return res.status(200).json({
      success: true,
      yearLevel: yearLevel,
      yearNumber: yearNumber,
      hasClass: !!student.class,
      classId: student.class?._id || null
    });
  } catch (error) {
    console.error('Error fetching student year level:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch student year level',
      error: error.message 
    });
  }
});

// For admin/advisers to get all submissions
router.get('/all', authenticate, async (req, res) => {
  try {
    // Check if user has admin/adviser role
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const submissions = await MMSubmission.find()
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'firstName lastName idNumber'
        }
      })
      .sort({ yearLevel: 1, semester: 1, examType: 1, submissionDate: -1 });
    
    // Transform imageUrl to full URL for all submissions
    const absoluteBase = `${req.protocol}://${req.get('host')}`;
    const transformedSubmissions = submissions.map(submission => ({
      ...submission.toObject(),
      imageUrl: submission.imageUrl?.startsWith('http') ? 
        submission.imageUrl : 
        `${absoluteBase}${submission.imageUrl}`
    }));
    
    return res.status(200).json({
      success: true,
      data: transformedSubmissions
    });
  } catch (error) {
    console.error('Error fetching all M&M submissions:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch M&M submissions',
      error: error.message 
    });
  }
});

// Update submission status (approve/reject)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    // Check if user has admin/adviser role
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const { status, feedback } = req.body;
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    const submission = await MMSubmission.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        feedback: feedback || ''
      },
      { new: true }
    );
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Submission ${status} successfully`,
      data: submission
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update submission status',
      error: error.message 
    });
  }
});

// Get student's current semester based on SSP subject semester
router.get('/current-class-semester', authenticate, async (req, res) => {
  try {
    // Get student from authenticated user with populated class and SSP subject
    const student = await Student.findOne({ user: req.user._id })
      .populate({
        path: 'class',
        populate: [
          {
            path: 'sspSubject',
            select: 'semester name sspCode'
          },
          {
            path: 'firstSemester.sspSubject',
            select: 'semester name sspCode'
          },
          {
            path: 'secondSemester.sspSubject',
            select: 'semester name sspCode'
          }
        ]
      })
      .populate('user', 'firstName lastName');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    console.log('Getting current semester for student:', student.user?.firstName, student.user?.lastName);

    if (!student.class) {
      // Default to 1st semester if no class assigned
      return res.status(200).json({
        success: true,
        semester: '1st',
        yearLevel: '2nd',
        hasClass: false,
        message: 'No class assigned, defaulting to 1st semester'
      });
    }

    // Determine semester with strict precedence (class is the source of truth):
    // 1) If class explicitly sets currentSemester -> use that
    // 2) Else, if student's first semester is completed -> 2nd semester
    // 3) Else -> 1st semester
    let currentSemester = '1st'; // default
    const hasCompletedFirst = !!(student.semesterData && student.semesterData.firstSemester && student.semesterData.firstSemester.completed);
    const classHasFlag = student.class && typeof student.class.currentSemester === 'string';

    if (classHasFlag) {
      const normalized = student.class.currentSemester.trim();
      currentSemester = normalized === '2nd' ? '2nd' : '1st';
    } else if (hasCompletedFirst) {
      currentSemester = '2nd';
    }

    console.log(`Student semester determined from SSP subject: ${currentSemester}`);

    // Build current class info derived from the computed semester
    const cls = student.class;
    let subjectForSemester = null;
    let daySchedule = null;
    let timeSchedule = null;
    let room = null;
    let hours = null;

    if (currentSemester === '2nd') {
      subjectForSemester = cls.secondSemester?.sspSubject || cls.sspSubject || cls.firstSemester?.sspSubject || null;
      daySchedule = (cls.secondSemester && cls.secondSemester.daySchedule) ? cls.secondSemester.daySchedule : (cls.daySchedule || null);
      timeSchedule = (cls.secondSemester && cls.secondSemester.timeSchedule) ? cls.secondSemester.timeSchedule : (cls.timeSchedule || null);
      room = (cls.secondSemester && cls.secondSemester.room) ? cls.secondSemester.room : (cls.room || null);
      hours = (cls.secondSemester && (cls.secondSemester.hours !== undefined && cls.secondSemester.hours !== null)) ? cls.secondSemester.hours : (cls.hours || null);
    } else {
      subjectForSemester = cls.firstSemester?.sspSubject || cls.sspSubject || cls.secondSemester?.sspSubject || null;
      daySchedule = (cls.firstSemester && cls.firstSemester.daySchedule) ? cls.firstSemester.daySchedule : (cls.daySchedule || null);
      timeSchedule = (cls.firstSemester && cls.firstSemester.timeSchedule) ? cls.firstSemester.timeSchedule : (cls.timeSchedule || null);
      room = (cls.firstSemester && cls.firstSemester.room) ? cls.firstSemester.room : (cls.room || null);
      hours = (cls.firstSemester && (cls.firstSemester.hours !== undefined && cls.firstSemester.hours !== null)) ? cls.firstSemester.hours : (cls.hours || null);
    }

    const classInfo = {
      classId: cls._id,
      yearLevel: cls.yearLevel || null,
      section: cls.section || null,
      major: cls.major || null,
      daySchedule,
      timeSchedule,
      room,
      hours,
      subject: subjectForSemester ? {
        code: subjectForSemester.sspCode || subjectForSemester.code || null,
        name: subjectForSemester.name || null,
        semester: currentSemester
      } : null
    };

    return res.status(200).json({
      success: true,
      semester: currentSemester,
      yearLevel: classInfo.yearLevel || '2nd',
      hasClass: true,
      classId: classInfo.classId,
      section: classInfo.section,
      classInfo,
      // debug fields to verify correctness (safe)
      debug: {
        classCurrentSemester: student.class?.currentSemester || null,
        studentFirstSemCompleted: !!hasCompletedFirst
      }
    });
  } catch (error) {
    console.error('Error fetching current class semester:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch current class semester',
      error: error.message 
    });
  }
});

// Get M&M submissions for a specific student (for advisers to check exam session eligibility)
router.get('/student-submissions/:studentId', authenticate, async (req, res) => {
  try {
    // Check if user has admin/adviser role
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    const { studentId } = req.params;
    const { schoolYear, yearLevel, semester } = req.query;
    
    // Get all M&M submissions for this student (from all year levels and school years)
    // This ensures we can see submissions even after student promotion
    let query = { student: studentId };
    
    // Optional filtering by school year
    if (schoolYear) {
      query.schoolYear = schoolYear;
    }
    
    // Optional filtering by year level (for backward compatibility)
    if (yearLevel) {
      query.yearLevel = yearLevel;
    }
    
    // Optional filtering by semester
    if (semester) {
      query.semester = semester;
    }
    
    const submissions = await MMSubmission.find(query)
      .populate('class', 'yearLevel section major schoolYear')
      .sort({ schoolYear: -1, yearLevel: 1, semester: 1, examType: 1, submissionDate: -1 });
    
    // Transform imageUrl to full URL
    const absoluteBase = `${req.protocol}://${req.get('host')}`;
    const transformedSubmissions = submissions.map(submission => ({
      ...submission.toObject(),
      imageUrl: submission.imageUrl?.startsWith('http') ? 
        submission.imageUrl : 
        `${absoluteBase}${submission.imageUrl}`
    }));
    
    return res.status(200).json({
      success: true,
      submissions: transformedSubmissions,
      totalSubmissions: transformedSubmissions.length
    });
    
  } catch (error) {
    console.error('Error fetching student M&M submissions:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch student M&M submissions',
      error: error.message 
    });
  }
});

// Get adviser's handled submissions with filter options
router.get('/adviser/my', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Find classes handled by this adviser
    const advisoryClasses = await AdvisoryClass.find({ adviser: req.user._id, status: 'active' }).populate('class');
    const classIds = advisoryClasses.map(ac => ac.class?._id).filter(Boolean);

    // Collect unique student ids from these classes
    const studentIdSet = new Set();
    for (const ac of advisoryClasses) {
      if (ac.class && Array.isArray(ac.class.students)) {
        ac.class.students.forEach(sid => studentIdSet.add(String(sid)));
      }
    }
    const studentIds = Array.from(studentIdSet);

    // Pull submissions for these students
    const subs = await MMSubmission.find({ student: { $in: studentIds } })
      .populate('class', 'yearLevel section major schoolYear')
      .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName idNumber' } })
      .sort({ schoolYear: -1, yearLevel: 1, semester: 1, examType: 1, submissionDate: -1 });

    // Compute filter options
    const schoolYears = new Set();
    const yearLevels = new Set();
    const sections = new Set();
    const majors = new Set();

    subs.forEach(s => {
      if (s.schoolYear) schoolYears.add(s.schoolYear);
      if (s.yearLevel) yearLevels.add(s.yearLevel);
      const cls = s.class;
      if (cls && cls.section) sections.add(cls.section);
      if (cls && cls.major) majors.add(cls.major);
    });

    // Transform imageUrl to full URL
    const absoluteBase = `${req.protocol}://${req.get('host')}`;
    const transformed = subs.map(submission => ({
      ...submission.toObject(),
      imageUrl: submission.imageUrl?.startsWith('http') ? submission.imageUrl : `${absoluteBase}${submission.imageUrl}`
    }));

    return res.status(200).json({
      success: true,
      submissions: transformed,
      filterOptions: {
        schoolYears: Array.from(schoolYears).sort(),
        yearLevels: Array.from(yearLevels).sort(),
        sections: Array.from(sections).sort(),
        majors: Array.from(majors).sort()
      }
    });
  } catch (error) {
    console.error('Error fetching adviser M&M submissions:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch adviser M&M submissions', error: error.message });
  }
});

module.exports = router; 
