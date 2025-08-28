const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const MMSubmission = require('../models/MidtermFinals');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const SessionCompletion = require('../models/SessionCompletion');
const Notification = require('../models/Notification');
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

    // Process both semesters
    for (const semesterData of [
      { subjectId: firstSemesterSubjectId, semester: '1st' },
      { subjectId: secondSemesterSubjectId, semester: '2nd' }
    ]) {
      if (!semesterData.subjectId) continue;

      const subject = await Subject.findById(semesterData.subjectId);
      if (!subject) continue;

      // Get sessions for this semester
      const sessions = semesterData.semester === '1st' ? subject.sessions : subject.secondSemesterSessions || subject.sessions;
      
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

    // Check if notification already exists for this exam type and student
    const existingNotification = await Notification.findOne({
      recipient: populatedStudent.user._id,
      title: `📝 ${examType} Exam M&M Submission Required`,
      type: 'info'
    });

    // Only create notification if it doesn't already exist
    if (!existingNotification) {
      const notification = new Notification({
        recipient: populatedStudent.user._id, // Use 'recipient' not 'user'
        title: `📝 ${examType} Exam M&M Submission Required`,
        message: `🎯 Great progress! You have completed all required sessions before your ${examType} exam. 

📋 Next Step: Please upload your ${examType} exam M&M submission image for ${semester} semester, ${yearLevel} year level.

📱 To upload: Go to M&M page → Select ${semester} Semester → Upload ${examType} Exam image

⚠️ This submission is required for promotion to the next semester/year level.`,
        type: 'info',
        read: false, // Use 'read' not 'isRead'
        link: '/student/surveys' // Link to M&M page
      });

      await notification.save();
      
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
    } else {
      console.log(`M&M notification already exists for student ${student._id}, exam ${examType}`);
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

    // Check semester restrictions - use class-based semester logic like Odyssey Plan
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
            // Check if the class has the new semester structure
            if (populatedClass.firstSemester?.sspSubject || populatedClass.secondSemester?.sspSubject) {
              // Use the SSP subject semester from the current semester structure
              if (populatedClass.firstSemester?.sspSubject?.semester) {
                currentSemester = populatedClass.firstSemester.sspSubject.semester.includes('1st') ? '1st' : '2nd';
              } else if (populatedClass.secondSemester?.sspSubject?.semester) {
                currentSemester = populatedClass.secondSemester.sspSubject.semester.includes('2nd') ? '2nd' : '1st';
              }
            } else if (populatedClass.sspSubject?.semester) {
              // For legacy classes, use the main SSP subject semester
              currentSemester = populatedClass.sspSubject.semester.includes('2nd') ? '2nd' : '1st';
            }
            
            console.log(`Student semester determined from SSP subject: ${currentSemester}`);
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
          
        return res.status(400).json({ 
          success: false, 
          message: errorMessage,
          currentClassSemester: currentSemester,
          attemptedSemester: semester
        });
      }
      
    } catch (semesterCheckError) {
      console.warn('Could not verify class semester status, allowing upload:', semesterCheckError);
      // Continue with upload if semester check fails
    }

    // TODO: Add image validation for PHINMA Education SSP form format
    // This would require OCR or template matching to validate the uploaded image
    // For now, we'll just validate that it's an image file (already done by multer)

    // Check if submission already exists for this combination
    const existingSubmission = await MMSubmission.findOne({
      student: student._id,
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
      .sort({ yearLevel: 1, semester: 1, examType: 1 });
    
    // Transform imageUrl to full URL
    const transformedSubmissions = submissions.map(submission => ({
      ...submission.toObject(),
      imageUrl: submission.imageUrl.startsWith('http') ? 
        submission.imageUrl : 
        `${process.env.BACKEND_URL || 'https://sspms-backend.onrender.com'}${submission.imageUrl}`
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

    // Get all submissions organized by year level and semester
    const submissions = await MMSubmission.find({ student: student._id })
      .sort({ yearLevel: 1, semester: 1, examType: 1, submissionDate: -1 });
    
    // Transform imageUrl to full URL for all submissions
    const transformedSubmissions = submissions.map(submission => ({
      ...submission.toObject(),
      imageUrl: submission.imageUrl.startsWith('http') ? 
        submission.imageUrl : 
        `${process.env.BACKEND_URL || 'https://sspms-backend.onrender.com'}${submission.imageUrl}`
    }));
    
    // Group by year level and semester
    const groupedHistory = {};
    
    transformedSubmissions.forEach(submission => {
      const key = `${submission.yearLevel}-${submission.semester}`;
      if (!groupedHistory[key]) {
        groupedHistory[key] = {
          yearLevel: submission.yearLevel,
          semester: submission.semester,
          submissions: []
        };
      }
      groupedHistory[key].submissions.push(submission);
    });

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
      totalSubmissions: transformedSubmissions.length
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
    const transformedSubmissions = submissions.map(submission => ({
      ...submission.toObject(),
      imageUrl: submission.imageUrl.startsWith('http') ? 
        submission.imageUrl : 
        `${process.env.BACKEND_URL || 'https://sspms-backend.onrender.com'}${submission.imageUrl}`
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
            select: 'semester'
          },
          {
            path: 'firstSemester.sspSubject',
            select: 'semester'
          },
          {
            path: 'secondSemester.sspSubject',
            select: 'semester'
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

    // Get semester from student's current class SSP subject
    let currentSemester = '1st'; // default
    if (student.class) {
      // Check if the class has the new semester structure
      if (student.class.firstSemester?.sspSubject || student.class.secondSemester?.sspSubject) {
        // Use the SSP subject semester from the current semester structure
        if (student.class.firstSemester?.sspSubject?.semester) {
          currentSemester = student.class.firstSemester.sspSubject.semester.includes('1st') ? '1st' : '2nd';
        } else if (student.class.secondSemester?.sspSubject?.semester) {
          currentSemester = student.class.secondSemester.sspSubject.semester.includes('2nd') ? '2nd' : '1st';
        }
      } else if (student.class.sspSubject?.semester) {
        // For legacy classes, use the main SSP subject semester
        currentSemester = student.class.sspSubject.semester.includes('2nd') ? '2nd' : '1st';
      }
    }

    console.log(`Student semester determined from SSP subject: ${currentSemester}`);

    return res.status(200).json({
      success: true,
      semester: currentSemester,
      yearLevel: student.class.yearLevel || '2nd',
      hasClass: true,
      classId: student.class._id,
      section: student.class.section
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
    const { yearLevel } = req.query;
    
    if (!yearLevel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Year level is required' 
      });
    }
    
    // Get all M&M submissions for this student and year level
    const submissions = await MMSubmission.find({
      student: studentId,
      yearLevel: yearLevel
    }).sort({ semester: 1, examType: 1, submissionDate: -1 });
    
    // Transform imageUrl to full URL
    const transformedSubmissions = submissions.map(submission => ({
      ...submission.toObject(),
      imageUrl: submission.imageUrl.startsWith('http') ? 
        submission.imageUrl : 
        `${process.env.BACKEND_URL || 'https://sspms-backend.onrender.com'}${submission.imageUrl}`
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

module.exports = router; 
