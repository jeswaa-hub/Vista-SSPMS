const express = require('express');
const router = express.Router();
const SessionCompletion = require('../models/SessionCompletion');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const { authenticate, authorizeAdmin, authorizeAdviser } = require('../middleware/auth');
const mongoose = require('mongoose');
const SessionHistory = require('../models/SessionHistory');
const User = require('../models/User');
const AdvisoryClass = require('../models/AdvisoryClass');

// Initialize sessions for a student (creates all session records for a class)
router.post('/init/:studentId/:classId', authenticate, async (req, res) => {
  try {
    const { studentId, classId } = req.params;
    const { semester } = req.body; // Allow specifying which semester to initialize
    
    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Verify class exists and get subject info
    const classData = await Class.findById(classId).populate('sspSubject');
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (!classData.sspSubject) {
      return res.status(404).json({ message: 'Class has no SSP subject assigned' });
    }
    
    // Get full subject details with sessions
    const subject = await Subject.findById(classData.sspSubject._id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Determine which semester's sessions to initialize
    const targetSemester = semester || subject.semester || '1st Semester';
    if (!['1st Semester', '2nd Semester'].includes(targetSemester)) {
      return res.status(400).json({ message: 'Invalid semester specified. Must be "1st Semester" or "2nd Semester".' });
    }
    
    // Check if student already has sessions created for this semester
    const existingSessions = await SessionCompletion.countDocuments({
      student: studentId,
      class: classId,
      semester: targetSemester
    });
    
    if (existingSessions > 0) {
      return res.status(400).json({ 
        message: `Sessions for ${targetSemester} already initialized for this student in this class`,
        count: existingSessions
      });
    }
    
    // Select the appropriate sessions array based on the semester
    const sessionsArray = targetSemester === '2nd Semester' ? subject.secondSemesterSessions : subject.sessions;
    
    if (!sessionsArray || sessionsArray.length === 0) {
      return res.status(400).json({ 
        message: `No sessions found for ${targetSemester} in the subject`,
        semester: targetSemester
      });
    }
    
    // Create session completion records for each session in the subject
    const sessionRecords = sessionsArray.map(session => ({
      student: studentId,
      class: classId,
      subject: subject._id,
      session: session._id,
      sessionDay: session.day,
      sessionTitle: session.title,
      completed: false,
      semester: targetSemester // Store which semester this session belongs to
    }));
    
    if (sessionRecords.length === 0) {
      return res.status(400).json({ 
        message: `No valid sessions found for ${targetSemester}`,
        semester: targetSemester
      });
    }
    
    // Insert all session records
    await SessionCompletion.insertMany(sessionRecords);
    
    res.status(201).json({ 
      message: `Session records for ${targetSemester} initialized successfully`,
      semester: targetSemester,
      count: sessionRecords.length
    });
  } catch (error) {
    console.error('Session initialization error:', error);
    
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Some sessions already exist for this student' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all sessions for a student in a class
router.get('/student/:studentId/class/:classId', authenticate, async (req, res) => {
  try {
    const { studentId, classId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const includeBothSemesters = req.query.includeBothSemesters === 'true';
    
    console.log(`User ${userId} with role ${userRole} accessing sessions for student ${studentId} in class ${classId}`);
    
    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Different authorization rules based on user role
    if (userRole === 'student') {
      // Students can only access their own records
      const studentUser = await Student.findOne({ user: userId });
      if (!studentUser || studentUser._id.toString() !== studentId) {
        console.warn(`Student ${userId} attempted to access records for another student ${studentId}`);
        return res.status(403).json({ message: 'Access denied. You can only view your own sessions.' });
      }
    } else if (userRole === 'adviser') {
      // Advisers can only access students in their classes
      const hasAccess = await Class.findOne({ 
        _id: classId, 
        adviser: userId,
        status: 'active'
      });
      
      if (!hasAccess) {
        // Check if the user is designated as an admin-adviser (special case)
        const isAdminAdviser = await User.findOne({
          _id: userId,
          role: 'adviser',
          isAdminAdviser: true
        });
        
        if (!isAdminAdviser) {
          console.warn(`Adviser ${userId} attempted to access class ${classId} they are not assigned to`);
          return res.status(403).json({ message: 'Access denied. You are not assigned to this class.' });
        }
      }
    } else if (userRole !== 'admin') {
      // Any other role is denied access
      console.warn(`User ${userId} with role ${userRole} attempted to access student sessions`);
      return res.status(403).json({ message: 'Access denied. Insufficient privileges.' });
    }
    
    // Get all session completions for the student in the class
    const sessions = await SessionCompletion.find({
      student: studentId,
      class: classId
    }).sort({ sessionDay: 1 });
    
    // Get class data to determine current semester and access the semester-specific subjects
    const classData = await Class.findById(classId);
    
    // Get the correct SSP subject based on the nested semester structure
    let currentSemester = '1st Semester';
    let firstSemesterSubjectId = null;
    let secondSemesterSubjectId = null;
    
    if (classData) {
      // Check for firstSemester and secondSemester objects
      if (classData.firstSemester && classData.firstSemester.sspSubject) {
        firstSemesterSubjectId = classData.firstSemester.sspSubject;
      } else if (classData.sspSubject) {
        // Fallback to top-level sspSubject if firstSemester not available
        firstSemesterSubjectId = classData.sspSubject;
      }
      
      if (classData.secondSemester && classData.secondSemester.sspSubject) {
        secondSemesterSubjectId = classData.secondSemester.sspSubject;
      }
      
      console.log(`Class subject IDs: first=${firstSemesterSubjectId}, second=${secondSemesterSubjectId}`);
    }
    
    console.log(`Found ${sessions.length} total sessions for student ${studentId} in class ${classId}`);
    
    // If no sessions found, check if we need to initialize them
    if (sessions.length === 0 && userRole === 'student') {
      console.log(`No sessions found for student ${studentId}, attempting to initialize`);
      
      try {
        // Initialize sessions based on the semester-specific subjects
        if (firstSemesterSubjectId) {
          // Get first semester subject
          const subject = await Subject.findById(firstSemesterSubjectId);
          if (subject && subject.sessions && subject.sessions.length > 0) {
            await initializeSessionsForStudent(studentId, classId, subject, '1st Semester');
          }
        }
        
        // If both semesters are requested, also initialize second semester
        if (includeBothSemesters && secondSemesterSubjectId) {
          // Get second semester subject
          const subject = await Subject.findById(secondSemesterSubjectId);
          if (subject && subject.sessions && subject.sessions.length > 0) {
            await initializeSessionsForStudent(studentId, classId, subject, '2nd Semester');
          }
        }
        
        // Get the sessions again after initialization
        const initializedSessions = await SessionCompletion.find({
          student: studentId,
          class: classId
        }).sort({ sessionDay: 1 });
        
        return res.json(initializedSessions);
      } catch (initError) {
        console.error(`Error initializing sessions:`, initError);
        // Continue to return an empty array instead of failing
        return res.json([]);
      }
    }
    
    // Count sessions by semester for debugging
    const firstSemester = sessions.filter(s => s.semester === '1st Semester').length;
    const secondSemester = sessions.filter(s => s.semester === '2nd Semester').length;
    const completedFirstSemester = sessions.filter(s => s.semester === '1st Semester (Completed)').length;
    const noSemester = sessions.filter(s => !s.semester).length;
    
    console.log(`Sessions by semester: 1st=${firstSemester}, 2nd=${secondSemester}, 1st(Completed)=${completedFirstSemester}, No Semester=${noSemester}, Current Semester: ${currentSemester}`);
    
    // For any sessions with no semester field, set it to the current semester
    if (noSemester > 0) {
      console.log(`Updating ${noSemester} sessions with missing semester information`);
      await SessionCompletion.updateMany(
        { student: studentId, class: classId, semester: { $exists: false } },
        { $set: { semester: currentSemester } }
      );
    }
    
    res.json(sessions);
  } catch (error) {
    console.error('Get student sessions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to initialize sessions for a student
async function initializeSessionsForStudent(studentId, classId, subject, semester) {
  console.log(`Initializing ${semester} sessions for student ${studentId} using subject ${subject._id}`);
  
  // Select sessions based on semester
  const sessionsArray = subject.sessions || [];
  
  if (sessionsArray.length === 0) {
    console.log(`No sessions found for ${semester} in subject ${subject._id}`);
    return;
  }
  
  // First, check if sessions already exist for this semester
  const existingSessions = await SessionCompletion.find({
    student: studentId,
    class: classId,
    semester: semester
  });
  
  if (existingSessions.length > 0) {
    console.log(`${existingSessions.length} existing sessions found for ${semester}, skipping initialization`);
    return;
  }
  
  // Create session completion records
  for (const session of sessionsArray) {
    try {
      const newSession = new SessionCompletion({
        student: studentId,
        class: classId,
        subject: subject._id,
        session: session._id,
        sessionDay: session.day,
        sessionTitle: session.title,
        completed: false,
        semester: semester
      });
      
      await newSession.save();
      console.log(`Created ${semester} session for day ${session.day}`);
    } catch (error) {
      console.error(`Error creating session:`, error);
      // Continue with other sessions even if one fails
    }
  }
}

// Get all sessions for a class (for advisers)
router.get('/class/:classId', authenticate, async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`User ${userId} with role ${userRole} accessing sessions for class ${classId}`);
    
    // Check if user is admin or adviser
    if (userRole !== 'admin' && userRole !== 'adviser') {
      console.warn(`User ${userId} with role ${userRole} attempted to access class sessions`);
      return res.status(403).json({ message: 'Access denied. Admin or adviser role required.' });
    }
    
    // If user is an adviser, verify they are assigned to this class
    if (userRole === 'adviser') {
      const hasAccess = await Class.findOne({ 
        _id: classId, 
        adviser: userId,
        status: 'active'
      });
      
      if (!hasAccess) {
        // Check if the user is designated as an admin-adviser (special case)
        const isAdminAdviser = await User.findOne({
          _id: userId,
          role: 'adviser',
          isAdminAdviser: true
        });
        
        if (!isAdminAdviser) {
          console.warn(`Adviser ${userId} attempted to access class ${classId} they are not assigned to`);
          return res.status(403).json({ message: 'Access denied. You are not assigned to this class.' });
        }
      }
    }
    
    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Get all students in the class
    const studentIds = classData.students || [];
    console.log(`Class has ${studentIds.length} students`);
    
    // Get all session completions grouped by student
    const sessions = await SessionCompletion.find({
      class: classId
    }).populate('student', '_id');
    
    console.log(`Found ${sessions.length} session completions for class ${classId}`);
    
    // Group sessions by student
    const sessionsByStudent = {};
    sessions.forEach(session => {
      const studentId = session.student._id.toString();
      if (!sessionsByStudent[studentId]) {
        sessionsByStudent[studentId] = [];
      }
      sessionsByStudent[studentId].push(session);
    });
    
    console.log(`Grouped sessions for ${Object.keys(sessionsByStudent).length} students`);
    res.json(sessionsByStudent);
  } catch (error) {
    console.error('Get class sessions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get session completion matrix for a class
router.get('/matrix/:classId', authenticate, async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const includeBothSemesters = req.query.includeBothSemesters === 'true';
    
    console.log(`User ${userId} with role ${userRole} accessing session matrix for class ${classId}`);
    
    // Check if user is admin or adviser
    if (userRole !== 'admin' && userRole !== 'adviser') {
      console.warn(`User ${userId} with role ${userRole} attempted to access session matrix`);
      return res.status(403).json({ message: 'Access denied. Admin or adviser role required.' });
    }
    
    // If user is an adviser, verify they are assigned to this class
    if (userRole === 'adviser') {
      // First check the direct assignment in Class model
      const hasDirectAccess = await Class.findOne({ 
        _id: classId, 
        adviser: userId,
        status: 'active'
      });
      
      // If not directly assigned, check the AdvisoryClass model
      const hasAdvisoryAccess = await AdvisoryClass.findOne({
        adviser: userId,
        class: classId,
        status: 'active'
      });
      
      // Check if the user is designated as an admin-adviser (special case)
      const isAdminAdviser = await User.findOne({
        _id: userId,
        role: 'adviser',
        isAdminAdviser: true
      });
      
      // If none of these access paths are valid, deny access
      if (!hasDirectAccess && !hasAdvisoryAccess && !isAdminAdviser) {
        console.warn(`Adviser ${userId} attempted to access class ${classId} they are not assigned to`);
        return res.status(403).json({ message: 'Access denied. You are not assigned to this class.' });
      }
    }
    
    // Verify class exists and get subject
    const classData = await Class.findById(classId)
      .populate({
        path: 'students',
        populate: {
          path: 'user',
          select: 'firstName lastName idNumber'
        }
      });
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Get subjects from both semesters
    const firstSemesterSubjectId = classData.firstSemester?.sspSubject || classData.sspSubject;
    const secondSemesterSubjectId = classData.secondSemester?.sspSubject;
    
    if (!firstSemesterSubjectId && !secondSemesterSubjectId) {
      return res.status(404).json({ message: 'No SSP subjects found for this class' });
    }
    
    console.log(`Class subject IDs - First: ${firstSemesterSubjectId}, Second: ${secondSemesterSubjectId}`);
    
    // Get all sessions from both semesters' subjects
    let allSessions = [];
    
    // Get first semester subject sessions
    if (firstSemesterSubjectId) {
      try {
        const firstSemesterSubject = await Subject.findById(firstSemesterSubjectId);
        if (firstSemesterSubject && firstSemesterSubject.sessions && firstSemesterSubject.sessions.length > 0) {
          const firstSemSessions = firstSemesterSubject.sessions.map(session => ({
            ...session.toObject(),
            semester: '1st Semester'
          }));
          allSessions.push(...firstSemSessions);
          console.log(`Added ${firstSemSessions.length} sessions from first semester subject`);
        }
      } catch (error) {
        console.error('Error loading first semester subject:', error);
      }
    }
    
    // Get second semester subject sessions if requested or available
    if ((includeBothSemesters || req.query.include2ndSemester === 'true') && secondSemesterSubjectId) {
      try {
        const secondSemesterSubject = await Subject.findById(secondSemesterSubjectId);
        if (secondSemesterSubject && secondSemesterSubject.sessions && secondSemesterSubject.sessions.length > 0) {
          const secondSemSessions = secondSemesterSubject.sessions.map(session => ({
            ...session.toObject(),
            semester: '2nd Semester'
          }));
          allSessions.push(...secondSemSessions);
          console.log(`Added ${secondSemSessions.length} sessions from second semester subject`);
        }
      } catch (error) {
        console.error('Error loading second semester subject:', error);
      }
    }
    
    if (allSessions.length === 0) {
      return res.status(404).json({ message: 'No sessions found for the class subjects' });
    }
    
    // Get all session completions for the class
    const sessions = await SessionCompletion.find({ class: classId });
    console.log(`Found ${sessions.length} session completions for class ${classId}`);
    
    // Create a matrix of student session completions
    const students = classData.students || [];
    const matrix = {
      sessions: allSessions.map(session => ({
        _id: session._id,
        day: session.day,
        title: session.title,
        semester: session.semester
      })),
      students: students.map(student => {
        // Find all sessions for this student
        const studentSessions = sessions.filter(session => 
          session.student.toString() === student._id.toString()
        );
        
        // Create a map of session completions
        const sessionsMap = {};
        studentSessions.forEach(session => {
          // Check if the session has a valid session reference
          if (session.session) {
          sessionsMap[session.session.toString()] = {
            completed: session.completed,
            completionDate: session.completionDate,
            id: session._id,
              semester: session.semester || '1st Semester'
            };
          } else {
            // For legacy records without a session reference, use the sessionDay as a fallback key
            // Find the matching session from allSessions based on the day
            const matchingSession = allSessions.find(s => s.day === session.sessionDay);
            if (matchingSession) {
              sessionsMap[matchingSession._id.toString()] = {
                completed: session.completed,
                completionDate: session.completionDate,
                id: session._id,
                semester: session.semester || '1st Semester'
              };
            }
          }
        });
        
        return {
          id: student._id,
          name: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
          idNumber: student.user ? student.user.idNumber : 'Unknown',
          userId: student.user ? student.user._id : null,
          sessions: sessionsMap
        };
      })
    };
    
    console.log(`Returning matrix with ${matrix.students.length} students and ${matrix.sessions.length} sessions`);
    res.json(matrix);
  } catch (error) {
    console.error('Error getting session matrix:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update session completion status
router.put('/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { completed } = req.body;
    
    console.log(`Session update request for ${sessionId}: completed=${completed}, user=${req.user.id}`);
    
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed status must be a boolean' });
    }
    
    // Find and update the session
    const session = await SessionCompletion.findById(sessionId);
    
    if (!session) {
      console.error(`Session ${sessionId} not found`);
      return res.status(404).json({ message: 'Session not found' });
    }
    
    console.log(`Found session: Student=${session.student}, Class=${session.class}, Day=${session.sessionDay}, Title=${session.sessionTitle}`);
    
    // Set the completion status
    session.completed = completed;
    
    // If marked as completed, set completion date and marker
    if (completed) {
      session.completionDate = new Date();
      session.markedBy = req.user.id;
      console.log(`Session marked as completed by ${req.user.id} at ${session.completionDate}`);
    } else {
      session.completionDate = null;
      session.markedBy = null;
      console.log(`Session marked as incomplete by ${req.user.id}`);
    }
    
    session.updatedAt = new Date();
    await session.save();
    
    console.log(`Session ${sessionId} updated successfully`);
    
    res.json({ 
      message: `Session marked as ${completed ? 'completed' : 'incomplete'}`,
      session
    });
  } catch (error) {
    console.error('Update session completion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk update session completions
router.put('/bulk/:classId', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId } = req.params;
    const { updates } = req.body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Updates must be a non-empty array' });
    }
    
    // Verify the class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Process each update
    const results = await Promise.all(updates.map(async update => {
      try {
        const { sessionId, completed } = update;
        
        if (!sessionId || typeof completed !== 'boolean') {
          return { success: false, sessionId, error: 'Invalid update format' };
        }
        
        // Find and update the session
        const session = await SessionCompletion.findById(sessionId);
        
        if (!session) {
          return { success: false, sessionId, error: 'Session not found' };
        }
        
        // Skip if the session is not for the specified class
        if (session.class.toString() !== classId) {
          return { success: false, sessionId, error: 'Session does not belong to the specified class' };
        }
        
        session.completed = completed;
        
        // If marked as completed, set completion date and marker
        if (completed) {
          session.completionDate = new Date();
          session.markedBy = req.user.id;
        } else {
          session.completionDate = null;
          session.markedBy = null;
        }
        
        session.updatedAt = new Date();
        await session.save();
        
        return { success: true, sessionId, completed };
      } catch (error) {
        return { success: false, sessionId: update.sessionId, error: error.message };
      }
    }));
    
    res.json({
      message: 'Bulk update completed',
      results
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Validate and repair session data for a class
router.post('/validate/:classId', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Verify class exists and get subject
    const classData = await Class.findById(classId)
      .populate('sspSubject')
      .populate('students');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (!classData.sspSubject) {
      return res.status(404).json({ message: 'Class has no SSP subject assigned' });
    }
    
    // Get full subject details with sessions
    const subject = await Subject.findById(classData.sspSubject._id);
    if (!subject || !subject.sessions || subject.sessions.length === 0) {
      return res.status(404).json({ message: 'No sessions found for the class subject' });
    }
    
    // Get all students in the class
    const students = classData.students || [];
    if (students.length === 0) {
      return res.status(400).json({ message: 'No students found in the class' });
    }
    
    // For each student, ensure they have all session records
    const results = {
      totalStudents: students.length,
      processedStudents: 0,
      createdSessions: 0,
      errors: []
    };
    
    for (const student of students) {
      try {
        // Get existing sessions for this student
        const existingSessions = await SessionCompletion.find({
          student: student._id,
          class: classId
        });
        
        // Create a map of existing sessions by subject session ID
        const existingSessionMap = {};
        existingSessions.forEach(session => {
          existingSessionMap[session.session.toString()] = true;
        });
        
        // Identify missing sessions
        const missingSessions = subject.sessions.filter(session => 
          !existingSessionMap[session._id.toString()]
        );
        
        // Create missing session records
        if (missingSessions.length > 0) {
          const sessionRecords = missingSessions.map(session => ({
            student: student._id,
            class: classId,
            subject: subject._id,
            session: session._id,
            sessionDay: session.day,
            sessionTitle: session.title,
            completed: false
          }));
          
          await SessionCompletion.insertMany(sessionRecords);
          results.createdSessions += sessionRecords.length;
        }
        
        results.processedStudents++;
      } catch (error) {
        console.error(`Error processing student ${student._id}:`, error);
        results.errors.push({
          studentId: student._id,
          error: error.message
        });
      }
    }
    
    res.status(200).json({
      message: 'Session validation completed',
      results
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update session status
router.post('/update-status', authenticate, async (req, res) => {
  try {
    const { classId, studentId, sessionId, completed } = req.body;
    
    if (!classId || !studentId || !sessionId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    console.log(`Updating session status: class=${classId}, student=${studentId}, session=${sessionId}, completed=${completed}`);
    
    // First, check if the session completion record already exists
    let sessionCompletion = await SessionCompletion.findOne({
      student: studentId,
      session: sessionId,
      class: classId
    });
    
    if (!sessionCompletion) {
      console.log(`Session completion record not found, creating new one`);
      
      // Get the session details from the subject to get day and title
      const classData = await Class.findById(classId).populate('sspSubject');
      if (!classData || !classData.sspSubject) {
        return res.status(404).json({ message: 'Class or subject not found' });
      }
      
      const subject = await Subject.findById(classData.sspSubject._id);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      
      // Find the session in either first or second semester sessions
      let sessionInfo = subject.sessions.find(s => s._id.toString() === sessionId);
      let semester = '1st Semester';
      
      if (!sessionInfo && subject.secondSemesterSessions) {
        sessionInfo = subject.secondSemesterSessions.find(s => s._id.toString() === sessionId);
        semester = '2nd Semester';
      }
      
      if (!sessionInfo) {
        return res.status(404).json({ message: 'Session definition not found in subject' });
    }
    
      // Create a new session completion record
      sessionCompletion = new SessionCompletion({
        student: studentId,
        class: classId,
        subject: classData.sspSubject._id,
        session: sessionId,
        sessionDay: sessionInfo.day,
        sessionTitle: sessionInfo.title,
        completed: completed || false,
        completionDate: completed ? new Date() : null,
        markedBy: completed ? req.user.id : null,
        semester: semester
      });
      
      await sessionCompletion.save();
      console.log(`Created new session completion record with ID ${sessionCompletion._id}`);
    } else {
      // Update the existing record
    sessionCompletion.completed = completed;
    sessionCompletion.completionDate = completed ? new Date() : null;
      sessionCompletion.markedBy = completed ? req.user.id : null;
      sessionCompletion.updatedAt = new Date();
    
    await sessionCompletion.save();
      console.log(`Updated existing session completion record with ID ${sessionCompletion._id}`);
    }
    
    res.json({ 
      message: `Session marked as ${completed ? 'completed' : 'pending'}`,
      session: sessionCompletion
    });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// NEW ENDPOINT: Ensure all days exist for a class
router.post('/class/:classId/ensure-all-days', authenticate, async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Find the class
    const classItem = await Class.findById(classId).populate('sspSubject');
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Get all students in this class
    const students = await Student.find({
      class: classId,
      status: 'active'
    });
    
    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found in this class' });
    }
    
    console.log(`Ensuring all days exist for ${students.length} students in class ${classId}`);
    
    // Get all expected session days (0-17)
    const expectedDays = Array.from({ length: 18 }, (_, i) => i); // 0 to 17
    
    let sessionsCreated = 0;
    let studentsProcessed = 0;
    
    // Process each student
    for (const student of students) {
      // Get existing sessions for this student
      const existingSessions = await SessionCompletion.find({
        student: student._id,
        class: classId
      });
      
      // Get days that already have sessions
      const existingDays = existingSessions.map(session => session.day);
      
      // Find missing days
      const missingDays = expectedDays.filter(day => !existingDays.includes(day));
      
      if (missingDays.length > 0) {
        console.log(`Creating ${missingDays.length} missing day sessions for student ${student._id}`);
        
        // Create sessions for missing days
        for (const day of missingDays) {
          // Create session title based on day
          let title = `Day ${day}`;
          if (day === 0) {
            title = 'INTRODUCTION';
          } else if (day === 1) {
            title = 'ORIENTATION';
          }
          
          // Create new session
          const newSession = new SessionCompletion({
            student: student._id,
            class: classId,
            day: day,
            title: title,
            completed: false,
            sspSubject: classItem.sspSubject._id
          });
          
          await newSession.save();
          sessionsCreated++;
        }
      }
      
      studentsProcessed++;
    }
    
    return res.json({
      message: `Session days validated for all students`,
      details: {
        studentsProcessed,
        sessionsCreated
      }
    });
  } catch (error) {
    console.error('Error ensuring all days exist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// NEW ROUTE: Archive sessions for a class
router.post('/archive/:classId', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Verify class exists
    const classData = await Class.findById(classId)
      .populate('sspSubject');
      
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    
    if (!classData.sspSubject) {
      return res.status(400).json({ success: false, message: 'No SSP subject assigned to this class' });
    }
    
    // Check if the class is already in the second semester
    if (classData.sspSubject.semester === '2nd Semester') {
      return res.status(400).json({ success: false, message: 'Class is already in the second semester' });
    }
    
    // Check if 2nd semester sessions are available
    const subject = await Subject.findById(classData.sspSubject._id);
    if (!subject || !subject.secondSemesterSessions || subject.secondSemesterSessions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin has not yet added 2nd semester sessions for this subject' 
      });
    }
    
    // Get all session completions for the class
    const sessions = await SessionCompletion.find({ 
      class: classId 
    }).populate('student');
    
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'No sessions found for this class' });
    }
    
    // Group sessions by student
    const sessionsByStudent = {};
    sessions.forEach(session => {
      const studentId = session.student._id.toString();
      if (!sessionsByStudent[studentId]) {
        sessionsByStudent[studentId] = [];
      }
      sessionsByStudent[studentId].push(session);
    });
    
    // Check if any student has more than 2 missed sessions (assuming total of 18 sessions)
    const requiredCompletedSessions = 16; // Allow only 2 missed sessions
    const studentsWithTooManyMissedSessions = [];
    
    for (const [studentId, studentSessions] of Object.entries(sessionsByStudent)) {
      const completedCount = studentSessions.filter(s => s.completed).length;
      
      if (completedCount < requiredCompletedSessions) {
        const studentName = studentSessions[0].student.user?.firstName 
          ? `${studentSessions[0].student.user.firstName} ${studentSessions[0].student.user.lastName}`
          : `Student ID: ${studentId}`;
          
        studentsWithTooManyMissedSessions.push({
          id: studentId,
          name: studentName,
          completed: completedCount,
          totalSessions: studentSessions.length,
          missing: studentSessions.length - completedCount
        });
      }
    }
    
    if (studentsWithTooManyMissedSessions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete semester - some students have more than 2 missed sessions',
        students: studentsWithTooManyMissedSessions
      });
    }
    
    console.log(`Archiving ${sessions.length} sessions for class ${classId}`);
    
    // Create history entries with explicit try-catch for each session
    const history = [];
    
    for (const session of sessions) {
      try {
        console.log(`Creating history entry for session ${session._id}, student ${session.student._id}`);
        
        // Create a history entry for this session
        const historyEntry = new SessionHistory({
          class: session.class,
          student: session.student,
          subject: session.subject,
          session: session.session,
          sessionDay: session.sessionDay,
          sessionTitle: session.sessionTitle,
          completed: session.completed,
          completionDate: session.completionDate,
          updatedAt: session.updatedAt,
          markedBy: session.markedBy,
          semester: '1st Semester'
        });
        
        await historyEntry.save();
        history.push(historyEntry);
        console.log(`Successfully archived session ${session._id}`);
      } catch (error) {
        console.error(`Error archiving session ${session._id}:`, error);
        // Continue with other sessions even if one fails
      }
    }
    
    // Update the subject's semester to 2nd Semester
    try {
      console.log(`Updating subject ${classData.sspSubject._id} semester to 2nd Semester`);
      const subject = await Subject.findById(classData.sspSubject._id);
      if (subject) {
        subject.semester = '2nd Semester';
        await subject.save();
        console.log(`Updated subject ${subject._id} semester to 2nd Semester`);
      } else {
        console.error(`Subject ${classData.sspSubject._id} not found`);
      }
    } catch (error) {
      console.error(`Error updating subject semester:`, error);
      // Don't fail the entire operation if subject update fails
    }
    
    // Return success
    res.json({
      success: true,
      message: 'Sessions archived successfully and semester updated to 2nd Semester',
      archivedCount: history.length,
      newSemester: '2nd Semester'
    });
    
  } catch (error) {
    console.error('Error archiving sessions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error archiving sessions', 
      error: error.message 
    });
  }
});

// NEW ROUTE: Load sessions for a new semester
router.post('/load/:classId/:semester', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId, semester } = req.params;
    
    if (semester !== '1st Semester' && semester !== '2nd Semester') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid semester. Must be "1st Semester" or "2nd Semester"'
      });
    }
    
    // Verify class exists
    const classData = await Class.findById(classId)
      .populate('sspSubject')
      .populate('students');
      
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    
    if (!classData.sspSubject) {
      return res.status(400).json({ success: false, message: 'No SSP subject assigned to this class' });
    }
    
    // Get subject with sessions
    const subject = await Subject.findById(classData.sspSubject._id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    const students = classData.students || [];
    if (students.length === 0) {
      return res.status(400).json({ success: false, message: 'No students found in the class' });
    }
    
    console.log(`Creating ${semester} sessions for ${students.length} students in class ${classId}`);
    
    // Remove any existing session completions for this semester (to avoid duplicates)
    const deleteResult = await SessionCompletion.deleteMany({ 
      class: classId,
      semester: semester 
    });
    
    console.log(`Deleted ${deleteResult.deletedCount} existing sessions for semester ${semester}`);
    
    let createdSessions = 0;
    let failedOperations = 0;
    
    // Create session completions for each student
    for (const student of students) {
      try {
        // Get relevant session definitions
        let sessionDefs = [];
        
        if (semester === '2nd Semester') {
          // For 2nd semester, first try to use secondSemesterSessions if they exist
          if (subject.secondSemesterSessions && subject.secondSemesterSessions.length > 0) {
            sessionDefs = subject.secondSemesterSessions;
            console.log(`Using ${sessionDefs.length} second semester sessions from subject definition`);
          } else {
            // Fall back to using regular sessions but keep the same day numbering (0-17)
            sessionDefs = subject.sessions.map(session => ({
              ...session.toObject(),
              day: session.day, // Keep the same day numbering (0-17)
              title: session.title // Remove the "2nd Semester: " prefix
            }));
            console.log(`Using ${sessionDefs.length} 1st semester sessions for 2nd semester with same day numbering`);
          }
        } else {
          // For 1st semester, use the regular sessions
          sessionDefs = subject.sessions;
          console.log(`Using ${sessionDefs.length} first semester sessions`);
        }
        
        // If no session definitions exist for this semester, create defaults
        if (!sessionDefs || sessionDefs.length === 0) {
          console.log(`No session definitions found for ${semester}, creating defaults`);
          
          // Create default sessions for days in this semester
          for (let day = 0; day < 18; day++) {
            const sessionTitle = `${semester} Day ${day + 1}`;
            
            try {
              const session = new SessionCompletion({
                student: student._id,
                class: classId,
                subject: subject._id,
                sessionDay: day,
                sessionTitle: sessionTitle,
                completed: false,
                semester: semester
              });
              
              await session.save();
              createdSessions++;
            } catch (error) {
              console.error(`Failed to create session for day ${day}:`, error);
              failedOperations++;
            }
          }
        } else {
          console.log(`Using ${sessionDefs.length} existing session definitions`);
          
          // Create sessions based on the defined sessions
          for (const sessionDef of sessionDefs) {
            try {
              const session = new SessionCompletion({
                student: student._id,
                class: classId,
                subject: subject._id,
                session: sessionDef._id,
                sessionDay: sessionDef.day,
                sessionTitle: sessionDef.title || `${semester} Day ${sessionDef.day + 1}`,
                completed: false,
                semester: semester
              });
              
              await session.save();
              createdSessions++;
            } catch (error) {
              console.error(`Failed to create session for day ${sessionDef.day}:`, error);
              failedOperations++;
            }
          }
        }
      } catch (studentError) {
        console.error(`Error creating sessions for student ${student._id}:`, studentError);
        failedOperations++;
      }
    }
    
    // Final success response
    res.json({
      success: true,
      message: `${semester} sessions created successfully`,
      createdCount: createdSessions,
      studentsProcessed: students.length,
      failedOperations: failedOperations
    });
    
  } catch (error) {
    console.error(`Error loading ${req.params.semester} sessions:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error loading sessions', 
      error: error.message 
    });
  }
});

// NEW ROUTE: Get session history for a class
router.get('/history/:classId', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId } = req.params;
    const { schoolYear } = req.query; // Add school year filter
    
    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    
    console.log(`Fetching session history for class ${classId}${schoolYear ? ` with school year filter: ${schoolYear}` : ''}`);
    
    // Build query for session history
    const historyQuery = { class: classId };
    if (schoolYear) {
      historyQuery.schoolYear = schoolYear;
    }
    
    // Get all session history for the class, grouped by student
    const history = await SessionHistory.find(historyQuery)
      .populate('student')
      .populate('class')
      .populate('subject')
      .populate('markedBy', 'firstName lastName')
      .populate('archivedBy', 'firstName lastName')
      .sort({ schoolYear: -1, archivedAt: -1, sessionDay: 1 }); // Sort by school year desc, then archived date desc, then session day
    
    if (history.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No session history found', 
        data: [],
        schoolYears: [] // Include available school years
      });
    }
    
    console.log(`Found ${history.length} history records for class ${classId}`);
    
    // Get unique school years for this class
    const schoolYears = await SessionHistory.distinct('schoolYear', { class: classId });
    const sortedSchoolYears = schoolYears.sort((a, b) => {
      // Sort school years in descending order (newest first)
      const yearA = parseInt(a.split(/[-\s]/)[0]);
      const yearB = parseInt(b.split(/[-\s]/)[0]);
      return yearB - yearA;
    });
    
    // Group by student
    const groupedHistory = [];
    const studentMap = new Map();
    
    history.forEach(record => {
      if (!record.student) {
        console.warn(`Skipping history record ${record._id} - missing student reference`);
        return;
      }
      
      const studentId = record.student._id.toString();
      const recordSchoolYear = record.schoolYear || 'Unknown';
      
      // Create a unique key for student + school year combination
      const studentSchoolYearKey = `${studentId}_${recordSchoolYear}`;
      
      if (!studentMap.has(studentSchoolYearKey)) {
        // Create a new student entry with all available information
        const studentData = {
          id: studentId,
          name: record.studentName || (record.student.user ? 
            `${record.student.user.firstName} ${record.student.user.lastName}` : 
            record.student.firstName + ' ' + record.student.lastName),
          idNumber: record.studentIdNumber || record.student.idNumber || 'N/A',
          schoolYear: recordSchoolYear
        };
        
        studentMap.set(studentSchoolYearKey, {
          student: studentData,
          sessions: []
        });
        
        groupedHistory.push(studentMap.get(studentSchoolYearKey));
      }
      
      // Add session to the appropriate student + school year combination
      studentMap.get(studentSchoolYearKey).sessions.push({
        id: record._id,
        day: record.sessionDay,
        title: record.sessionTitle,
        completed: record.completed,
        completedAt: record.completionDate,
        semester: record.semester,
        schoolYear: record.schoolYear,
        archivedAt: record.archivedAt,
        archivedBy: record.archivedBy ? 
          `${record.archivedBy.firstName} ${record.archivedBy.lastName}` : 'System',
        archiveReason: record.archiveReason,
        
        // Include subject and class information if available
        subject: record.subject ? {
          id: record.subject._id,
          name: record.subject.name,
          sspCode: record.subject.sspCode
        } : record.subjectDetails,
        
        class: record.class ? {
          id: record.class._id,
          yearLevel: record.class.yearLevel,
          section: record.class.section
        } : record.classDetails
      });
    });
    
    res.json({ 
      success: true, 
      data: groupedHistory,
      totalRecords: history.length,
      schoolYears: sortedSchoolYears,
      currentFilter: {
        classId,
        schoolYear: schoolYear || null
      }
    });
    
  } catch (error) {
    console.error('Error fetching class session history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching session history', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// NEW ROUTE: Get session history for a student
router.get('/history/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId } = req.query;
    
    // Verify student exists
    const student = await Student.findById(studentId).populate('user');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Build query
    const query = { student: studentId };
    if (classId) {
      query.class = classId;
    }
    
    console.log(`Fetching session history for student ${studentId}`, query);
    
    // Get session history for the student
    const history = await SessionHistory.find(query)
      .populate('class')
      .populate('subject')
      .populate('markedBy', 'firstName lastName')
      .populate('archivedBy', 'firstName lastName')
      .sort({ archivedAt: -1 });
    
    if (!history || history.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No session history found',
        data: [] 
      });
    }
    
    console.log(`Found ${history.length} history records for student ${studentId}`);
    
    // Group by class and semester - enhanced to include yearLevel categorization
    const groupedHistory = [];
    const yearLevelMap = new Map();
    
    for (const record of history) {
      try {
        // Skip records with missing class data
        if (!record.class && !record.classDetails) {
          console.warn(`Skipping history record ${record._id} - missing class reference`);
          continue;
        }
        
        // Use either populated class data or stored class details
        const classId = record.class ? record.class._id.toString() : `unknown_${groupedHistory.length}`;
        const classSemester = record.semester || '1st Semester'; // Default to 1st semester if missing
        const classYearLevel = record.yearLevel || record.class?.yearLevel || record.classDetails?.yearLevel || 'Unknown';
        
        // Create a key based on year level and class ID
        const yearLevelKey = `${classYearLevel}`;
        
        // Check if we already have this year level in our map
        if (!yearLevelMap.has(yearLevelKey)) {
          yearLevelMap.set(yearLevelKey, {
            yearLevel: classYearLevel,
            semesters: []
          });
          
          groupedHistory.push(yearLevelMap.get(yearLevelKey));
        }
        
        // Get the year level group
        const yearLevelGroup = yearLevelMap.get(yearLevelKey);
        
        // Create a key for the semester within this year level
        const semesterKey = `${classId}_${classSemester}`;
        
        // Find if this semester already exists in the year level group
        let semesterGroup = yearLevelGroup.semesters.find(s => s.id === semesterKey);
        
        if (!semesterGroup) {
          // Create new semester group with safe access to properties
          const classSection = record.class?.section || record.classDetails?.section || 'Unknown';
          
          const subjectInfo = record.subject || record.subjectDetails || {};
          
          semesterGroup = {
            id: semesterKey,
            class: {
              id: classId,
              name: record.class?.name || `${classYearLevel} - ${classSection}`,
              yearLevel: classYearLevel,
              section: classSection,
              room: record.class?.room || record.classDetails?.room,
              daySchedule: record.class?.daySchedule || record.classDetails?.daySchedule,
              timeSchedule: record.class?.timeSchedule || record.classDetails?.timeSchedule
            },
            subject: {
              id: subjectInfo._id,
              name: subjectInfo.name || 'Student Success Program',
              sspCode: subjectInfo.sspCode || 'SSP'
            },
            semester: classSemester,
            sessions: []
          };
          
          yearLevelGroup.semesters.push(semesterGroup);
        }
        
        // Add session to the appropriate semester group
        semesterGroup.sessions.push({
          id: record._id,
          day: record.sessionDay || 0,
          title: record.sessionTitle || `Day ${record.sessionDay || 0}`,
          completed: !!record.completed,
          completedAt: record.completionDate || null,
          archivedAt: record.archivedAt,
          archivedBy: record.archivedBy ? 
            `${record.archivedBy.firstName} ${record.archivedBy.lastName}` : 'System',
          archiveReason: record.archiveReason
        });
      } catch (recordError) {
        console.error(`Error processing history record: ${recordError.message}`, record);
        // Continue processing other records even if one fails
      }
    }
    
    // Sort year levels in ascending order
    groupedHistory.sort((a, b) => {
      // Extract numeric part from year level strings like "1st Year", "2nd Year", etc.
      const getNumericYear = (yearStr) => {
        const match = /(\d+)/.exec(yearStr);
        return match ? parseInt(match[1], 10) : 0;
      };
      
      return getNumericYear(a.yearLevel) - getNumericYear(b.yearLevel);
    });
    
    // For each year level, sort semesters so 1st appears before 2nd
    for (const yearGroup of groupedHistory) {
      yearGroup.semesters.sort((a, b) => {
        if (a.semester.includes('1st') && b.semester.includes('2nd')) return -1;
        if (a.semester.includes('2nd') && b.semester.includes('1st')) return 1;
        return 0;
      });
      
      // Sort sessions by day within each semester
      for (const semester of yearGroup.semesters) {
        semester.sessions.sort((a, b) => (a.day || 0) - (b.day || 0));
      }
    }
    
    res.json({ 
      success: true, 
      data: groupedHistory,
      totalRecords: history.length
    });
    
  } catch (error) {
    console.error('Error fetching student session history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching student session history', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// NEW ROUTE: Archive sessions for a specific student
router.post('/archive-student', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId, studentId, promoteToNewYearLevel } = req.body;
    
    if (!classId || !studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class ID and Student ID are required' 
      });
    }
    
    // Verify class and student exist
    const classData = await Class.findById(classId)
      .populate('firstSemester.sspSubject')
      .populate('secondSemester.sspSubject')
      .populate('sspSubject');
      
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    
    const student = await Student.findById(studentId).populate('user');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Find all session completion records for this student in this class
    // When promoting to new year level, include ALL sessions (both 1st and 2nd semester)
    // When promoting from 1st to 2nd semester, only include 1st semester sessions
    const query = { 
      class: classId,
      student: studentId
    };
    
    // If NOT promoting to new year level, only archive 1st semester sessions
    // If promoting to new year level, archive ALL sessions
    if (!promoteToNewYearLevel) {
      // When promoting to 2nd semester, only archive 1st semester sessions
      query.semester = { $in: ['1st Semester', null] }; // Include sessions with no semester specified (legacy)
    }
    // When promoteToNewYearLevel is true, no additional filter is added, so ALL sessions are included
    
    const sessions = await SessionCompletion.find(query).populate('session');
    
    console.log(`Found ${sessions.length} sessions to archive for student ${studentId}${promoteToNewYearLevel ? ' (promoting to new year level - archiving ALL sessions)' : ' (promoting to 2nd semester - archiving 1st semester sessions only)'}`);
    
    // Debug: Log session semesters
    const sessionsBySemester = sessions.reduce((acc, session) => {
      const sem = session.semester || '1st Semester';
      acc[sem] = (acc[sem] || 0) + 1;
      return acc;
    }, {});
    console.log('Sessions by semester to archive:', sessionsBySemester);
    
    // Get first semester subject (default to main subject if not specified)
    const firstSemSubjectIdToUse = classData.firstSemester?.sspSubject?._id || 
                                 classData.firstSemester?.sspSubject || 
                                 classData.sspSubject?._id || 
                                 classData.sspSubject;
                                 
    // Get second semester subject (default to main subject if not specified)
    const secondSemSubjectIdToUse = classData.secondSemester?.sspSubject?._id || 
                                  classData.secondSemester?.sspSubject || 
                                  classData.sspSubject?._id || 
                                  classData.sspSubject;
                                  
    console.log(`First semester subject ID: ${firstSemSubjectIdToUse}`);
    console.log(`Second semester subject ID: ${secondSemSubjectIdToUse}`);
    
    // Get subject details for storing in history
    let firstSemesterSubjectDetails = null;
    let secondSemesterSubjectDetails = null;
    
    try {
      if (firstSemSubjectIdToUse) {
        const subject = await Subject.findById(firstSemSubjectIdToUse);
        if (subject) {
          firstSemesterSubjectDetails = {
            _id: subject._id,
            code: subject.code,
            sspCode: subject.sspCode,
            name: subject.name,
            description: subject.description,
            semester: subject.semester
          };
        }
      }
      
      if (secondSemSubjectIdToUse) {
        const subject = await Subject.findById(secondSemSubjectIdToUse);
        if (subject) {
          secondSemesterSubjectDetails = {
            _id: subject._id,
            code: subject.code,
            sspCode: subject.sspCode,
            name: subject.name,
            description: subject.description,
            semester: subject.semester
          };
        }
      }
    } catch (subjectError) {
      console.error('Error getting subject details:', subjectError);
      // Continue with archiving even if subject details can't be retrieved
    }
    
    // Extract class details for storing in history
    const classDetails = {
      _id: classData._id,
      yearLevel: classData.yearLevel,
      section: classData.section,
      room: classData.room,
      daySchedule: classData.daySchedule,
      timeSchedule: classData.timeSchedule,
      major: classData.major
    };
    
    // Track how many sessions are archived
    const history = [];
    
    // Track semester counts for reporting
    const firstSemesterSessions = [];
    const secondSemesterSessions = [];
    
    // Archive sessions to history
    for (const session of sessions) {
      try {
        // Skip sessions that are already archived (to prevent duplicates)
        if (session.archived) {
          console.log(`Skipping already archived session ${session._id}`);
          continue;
        }
        
        // Determine which semester this session belongs to
        const isFirstSemester = session.semester === '1st Semester' || !session.semester;
        const isSecondSemester = session.semester === '2nd Semester';
        
        if (isFirstSemester) {
          firstSemesterSessions.push(session);
        } else if (isSecondSemester) {
          secondSemesterSessions.push(session);
        }
        
        // Create a history entry for this session
        const historyEntry = new SessionHistory({
          // Basic session details
          class: session.class,
          student: session.student,
          subject: session.subject || (isFirstSemester ? firstSemSubjectIdToUse : secondSemSubjectIdToUse),
          session: session.session,
          sessionDay: session.sessionDay,
          sessionTitle: session.sessionTitle,
          completed: session.completed,
          completionDate: session.completionDate,
          updatedAt: session.updatedAt,
          markedBy: session.markedBy,
          semester: session.semester || '1st Semester',
          schoolYear: classData.schoolYear || '2025-2026', // Include school year from class
          
          // Add additional fields for display in history views
          classDetails,
          subjectDetails: isFirstSemester ? firstSemesterSubjectDetails : secondSemesterSubjectDetails,
          yearLevel: classData.yearLevel,
          
          // Store student details for easier querying
          studentName: student.user ? `${student.user.firstName} ${student.user.lastName}` : '',
          studentIdNumber: student.user ? student.user.idNumber : '',
          
          // Archive metadata
          archivedAt: new Date(),
          archivedBy: req.user.id,
          archiveReason: promoteToNewYearLevel ? 'Student promoted to next year level' : 'Student promoted to 2nd semester'
        });
        
        await historyEntry.save();
        history.push(historyEntry);
        console.log(`Successfully archived session ${session._id} (semester: ${session.semester || '1st Semester'})`);
      } catch (error) {
        console.error(`Error archiving session ${session._id}:`, error);
        // Continue with other sessions even if one fails
      }
    }
    
    // Delete sessions based on promotion type
    // If promoting to new year level, delete ALL sessions (both 1st and 2nd semester)
    // If promoting to 2nd semester, only delete 1st semester sessions (keep 2nd semester sessions)
    const deleteQuery = {
      class: classId,
      student: studentId
    };
    
    if (!promoteToNewYearLevel) {
      // When promoting to 2nd semester, only delete 1st semester sessions
      deleteQuery.semester = { $in: ['1st Semester', null] }; // Include sessions with no semester specified (legacy)
    }
    // When promoteToNewYearLevel is true, no additional filter is added, so ALL sessions are deleted
    
    try {
      const deleteResult = await SessionCompletion.deleteMany(deleteQuery);
      console.log(`Removed ${deleteResult.deletedCount} sessions after archiving for student ${studentId}${promoteToNewYearLevel ? ' (deleted ALL sessions for year promotion)' : ' (deleted 1st semester sessions only)'}`);
    } catch (error) {
      console.error(`Error removing sessions after archiving:`, error);
    }
    
    // Only create 2nd semester sessions if not promoting to new year level
    let secondSemesterSessionsCreated = 0;
    
    if (!promoteToNewYearLevel) {
      try {
        // Get second semester subject to fetch sessions
        const secondSemSubject = await Subject.findById(secondSemSubjectIdToUse);
        
    if (!secondSemSubject) {
          throw new Error('Second semester subject not found');
        }
        
        // First try to use subject's secondSemesterSessions if they exist
      let sessionDefs = [];
      
      if (secondSemSubject.secondSemesterSessions && secondSemSubject.secondSemesterSessions.length > 0) {
        sessionDefs = secondSemSubject.secondSemesterSessions;
          console.log(`Using ${sessionDefs.length} explicit second semester sessions from subject`);
      } else {
        // Fall back to using regular sessions but keep the same day numbering (0-17)
        sessionDefs = secondSemSubject.sessions.map(session => ({
          ...session.toObject(),
          day: session.day, // Keep the same day numbering (0-17)
          title: session.title // Remove the "2nd Semester: " prefix
        }));
          console.log(`Using ${sessionDefs.length} 1st semester sessions for 2nd semester with same day numbering`);
      }
      
        // Create session completion records for each 2nd semester session
      for (const sessionDef of sessionDefs) {
        try {
            const session = new SessionCompletion({
            student: studentId,
            class: classId,
              subject: secondSemSubjectIdToUse,
            session: sessionDef._id,
            sessionDay: sessionDef.day,
              sessionTitle: sessionDef.title || `Day ${sessionDef.day + 1}`,
            completed: false,
              completionDate: null,
            semester: '2nd Semester'
          });
          
            await session.save();
            secondSemesterSessionsCreated++;
          } catch (sessionError) {
            console.error(`Error creating 2nd semester session:`, sessionError);
            // Continue with other sessions
          }
        }
        
        console.log(`Created ${secondSemesterSessionsCreated} 2nd semester sessions for student ${studentId}`);
      } catch (secondSemError) {
        console.error(`Error creating 2nd semester sessions:`, secondSemError);
        // Continue with the operation even if 2nd semester session creation fails
      }
    }
    
    // Create a notification for the student about promotion
    try {
      if (student.user) {
        const Notification = require('../models/Notification');
        
        const notification = new Notification({
          recipient: student.user._id,
          sender: req.user.id,
          title: promoteToNewYearLevel ? 'Year Level Promotion' : 'Semester Promotion',
          message: promoteToNewYearLevel ? 
            `Congratulations! You have been promoted to the next year level. Your previous year's sessions have been archived.` :
            `Congratulations! You have been promoted to 2nd semester. Your 1st semester sessions have been archived.`,
          type: 'success',
          link: '/student/ssp',
          read: false,
          createdAt: new Date()
        });
        
        await notification.save();
        console.log(`Created promotion notification for student ${studentId}`);
      }
    } catch (notificationError) {
      console.error('Error creating notification for promotion:', notificationError);
      // Don't fail the entire operation if notification creation fails
    }
    
    // Return success with detailed information
    res.json({
      success: true,
      message: promoteToNewYearLevel ? 
        'Student successfully promoted to next year level' : 
        'Student successfully promoted to 2nd semester',
      studentId: studentId,
      studentName: student.user ? `${student.user.firstName} ${student.user.lastName}` : '',
      archivedCount: history.length,
      newSessionsCreated: secondSemesterSessionsCreated,
      firstSemesterSessionsArchived: firstSemesterSessions.length,
      secondSemesterSessionsArchived: secondSemesterSessions.length
    });
    
  } catch (error) {
    console.error('Error archiving student sessions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error archiving student sessions', 
      error: error.message 
    });
  }
});

// NEW ROUTE: Load 2nd semester sessions for a specific student
router.post('/load-student', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId, studentId, semester } = req.body;
    
    if (!classId || !studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class ID and Student ID are required' 
      });
    }
    
    if (semester !== '1st Semester' && semester !== '2nd Semester') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid semester. Must be "1st Semester" or "2nd Semester"'
      });
    }
    
    // Verify class and student exist
    const classData = await Class.findById(classId).populate('sspSubject');
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    if (!classData.sspSubject) {
      return res.status(400).json({ success: false, message: 'No SSP subject assigned to this class' });
    }
    
    // Get subject with sessions
    const subject = await Subject.findById(classData.sspSubject._id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    
    console.log(`Creating ${semester} sessions for student ${studentId} in class ${classId}`);
    
    // Remove any existing session completions for this semester (to avoid duplicates)
    const deleteResult = await SessionCompletion.deleteMany({ 
      class: classId,
      student: studentId,
      semester: semester 
    });
    
    console.log(`Deleted ${deleteResult.deletedCount} existing sessions for semester ${semester}`);
    
    let createdSessions = 0;
    
    // Get relevant session definitions
    let sessionDefs = [];
    
    if (semester === '2nd Semester') {
      // For 2nd semester, first try to use secondSemesterSessions if they exist
      if (subject.secondSemesterSessions && subject.secondSemesterSessions.length > 0) {
        sessionDefs = subject.secondSemesterSessions;
        console.log(`Using ${sessionDefs.length} second semester sessions from subject definition`);
      } else {
        // Fall back to using regular sessions but keep the same day numbering (0-17)
        sessionDefs = subject.sessions.map(session => ({
          ...session.toObject(),
          day: session.day, // Keep the same day numbering (0-17)
          title: session.title // Remove the "2nd Semester: " prefix
        }));
        console.log(`Using ${sessionDefs.length} 1st semester sessions for 2nd semester with same day numbering`);
      }
    } else {
      // For 1st semester, use the regular sessions
      sessionDefs = subject.sessions;
      console.log(`Using ${sessionDefs.length} first semester sessions`);
    }
    
    // If no session definitions exist for this semester, create defaults
    if (!sessionDefs || sessionDefs.length === 0) {
      console.log(`No session definitions found for ${semester}, creating defaults`);
      
      // Create default sessions for days in this semester
      for (let day = 0; day < 18; day++) {
        const sessionTitle = `${semester} Day ${day + 1}`;
        
        try {
          const session = new SessionCompletion({
            student: studentId,
            class: classId,
            subject: subject._id,
            sessionDay: day,
            sessionTitle: sessionTitle,
            completed: false,
            semester: semester
          });
          
          await session.save();
          createdSessions++;
        } catch (error) {
          console.error(`Failed to create session for day ${day}:`, error);
        }
      }
    } else {
      console.log(`Using ${sessionDefs.length} existing session definitions`);
      
      // Create sessions based on the defined sessions
      for (const sessionDef of sessionDefs) {
        try {
          const session = new SessionCompletion({
            student: studentId,
            class: classId,
            subject: subject._id,
            session: sessionDef._id,
            sessionDay: sessionDef.day,
            sessionTitle: sessionDef.title || `${semester} Day ${sessionDef.day + 1}`,
            completed: false,
            semester: semester
          });
          
          await session.save();
          createdSessions++;
        } catch (error) {
          console.error(`Failed to create session:`, error);
        }
      }
    }
    
    // Create a notification for the student when 2nd semester sessions are created
    if (semester === '2nd Semester') {
      try {
        // First, find the student user
        const studentDoc = await Student.findById(studentId).populate('user');
        if (studentDoc && studentDoc.user) {
          const Notification = require('../models/Notification');
          
          const notification = new Notification({
            recipient: studentDoc.user._id,
            sender: req.user.id,
            title: '2nd Semester Sessions Available',
            message: 'Your 2nd semester SSP sessions are now available. Please check your SSP page to view and complete them.',
            type: 'success',
            link: '/student/ssp',
            read: false,
            createdAt: new Date()
          });
          
          await notification.save();
          console.log(`Created 2nd semester notification for student ${studentId}`);
        }
      } catch (notificationError) {
        console.error('Error creating notification for 2nd semester:', notificationError);
        // Don't fail the entire operation if notification creation fails
      }
    }
    
    // Final success response
    res.json({
      success: true,
      message: `${semester} sessions created successfully for student`,
      createdCount: createdSessions,
      studentId: studentId
    });
    
  } catch (error) {
    console.error(`Error loading ${req.body.semester} sessions for student:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error loading student sessions', 
      error: error.message 
    });
  }
});

// NEW ROUTE: Send reminder notification to a student about missed sessions
router.post('/notify-student', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { studentId, classId, message } = req.body;
    
    if (!studentId || !classId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Class ID are required'
      });
    }
    
    // Verify student exists
    const student = await Student.findById(studentId).populate('user');
    if (!student || !student.user) {
      return res.status(404).json({
        success: false,
        message: 'Student or student user account not found'
      });
    }
    
    // Get student's sessions to count missing ones
    const sessions = await SessionCompletion.find({
      student: studentId,
      class: classId
    });
    
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(session => session.completed).length;
    const missingSessions = totalSessions - completedSessions;
    
    // Create notification for the student using the new Notification model
    try {
      // Import the Notification model
      const Notification = require('../models/Notification');
      
      const notification = new Notification({
        recipient: student.user._id,
        title: 'Session Completion Reminder',
        message: message || `You have ${missingSessions} incomplete sessions. Please complete them as soon as possible to meet the requirements for advancing to the next semester.`,
        type: 'warning',
        link: '/student/ssp',
        sender: req.user.id,
        createdAt: new Date()
      });
      
      // Save the notification
      await notification.save();
      
      console.log(`Successfully created notification for student ${studentId}`);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request if notification can't be created
      // Just log it and continue
    }
    
    // Also send an email notification if the student has an email (optional)
    if (student.user.email) {
      try {
        // This is a placeholder for email sending functionality
        console.log(`Email would be sent to ${student.user.email} about missing sessions`);
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the entire operation if email fails
      }
    }
    
    res.json({
      success: true,
      message: 'Notification sent successfully',
      notification: {
        studentId,
        missingSessions,
        totalSessions,
        completedSessions
      }
    });
    
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending notification',
      error: error.message
    });
  }
});

// NEW ROUTE: Bulk archive sessions for multiple students (for year promotion)
router.post('/bulk-archive-year', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId, studentIds, schoolYear } = req.body;
    
    // Validate required fields
    if (!classId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: classId and studentIds are required' 
      });
    }
    
    console.log(`Bulk archiving sessions for ${studentIds.length} students from class ${classId} with school year ${schoolYear || 'default'}`);
    
    // Get class data with populated subjects
    const classData = await Class.findById(classId)
      .populate('sspSubject')
      .populate('firstSemester.sspSubject')
      .populate('secondSemester.sspSubject');
    
    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    
    const currentSchoolYear = schoolYear || classData.schoolYear || '2025-2026';
    console.log(`Using school year: ${currentSchoolYear}`);
    
    // Extract class details for storing in history
    const classDetails = {
      _id: classData._id,
      yearLevel: classData.yearLevel,
      section: classData.section,
      room: classData.room,
      daySchedule: classData.daySchedule,
      timeSchedule: classData.timeSchedule,
      major: classData.major
    };
    
    const archivedSummary = {
      totalStudents: studentIds.length,
      totalSessionsArchived: 0,
      successfulStudents: [],
      failedStudents: [],
      schoolYear: currentSchoolYear
    };
    
    // Process each student
    for (const studentId of studentIds) {
      try {
        console.log(`Processing student ${studentId} for bulk archiving...`);
        
        // Get student data
        const student = await Student.findById(studentId).populate('user');
        if (!student) {
          console.error(`Student ${studentId} not found`);
          archivedSummary.failedStudents.push({
            studentId,
            error: 'Student not found'
          });
          continue;
        }
        
        // Get all sessions for this student in this class (both semesters for year promotion)
        const sessions = await SessionCompletion.find({
          class: classId,
          student: studentId
        });
        
        console.log(`Found ${sessions.length} sessions to archive for student ${studentId}`);
        
        if (sessions.length === 0) {
          console.log(`No sessions found for student ${studentId}, skipping...`);
          archivedSummary.successfulStudents.push({
            studentId,
            studentName: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
            sessionsArchived: 0
          });
          continue;
        }
        
        // Get subject details for storing in history
        let firstSemesterSubjectDetails = null;
        let secondSemesterSubjectDetails = null;
        
        const firstSemSubjectIdToUse = classData.firstSemester?.sspSubject?._id || 
                                     classData.firstSemester?.sspSubject || 
                                     classData.sspSubject?._id || 
                                     classData.sspSubject;
                                     
        const secondSemSubjectIdToUse = classData.secondSemester?.sspSubject?._id || 
                                      classData.secondSemester?.sspSubject || 
                                      classData.sspSubject?._id || 
                                      classData.sspSubject;
        
        try {
          if (firstSemSubjectIdToUse) {
            const subject = await Subject.findById(firstSemSubjectIdToUse);
            if (subject) {
              firstSemesterSubjectDetails = {
                _id: subject._id,
                code: subject.code,
                sspCode: subject.sspCode,
                name: subject.name,
                description: subject.description,
                semester: subject.semester
              };
            }
          }
          
          if (secondSemSubjectIdToUse) {
            const subject = await Subject.findById(secondSemSubjectIdToUse);
            if (subject) {
              secondSemesterSubjectDetails = {
                _id: subject._id,
                code: subject.code,
                sspCode: subject.sspCode,
                name: subject.name,
                description: subject.description,
                semester: subject.semester
              };
            }
          }
        } catch (subjectError) {
          console.error('Error getting subject details:', subjectError);
        }
        
        // Archive each session
        const studentHistory = [];
        for (const session of sessions) {
          try {
            const isFirstSemester = session.semester === '1st Semester' || !session.semester;
            
            const historyEntry = new SessionHistory({
              // Basic session details
              class: session.class,
              student: session.student,
              subject: session.subject || (isFirstSemester ? firstSemSubjectIdToUse : secondSemSubjectIdToUse),
              session: session.session,
              sessionDay: session.sessionDay,
              sessionTitle: session.sessionTitle,
              completed: session.completed,
              completionDate: session.completionDate,
              updatedAt: session.updatedAt,
              markedBy: session.markedBy,
              semester: session.semester || '1st Semester',
              schoolYear: currentSchoolYear, // Use the provided school year
              
              // Add additional fields for display in history views
              classDetails,
              subjectDetails: isFirstSemester ? firstSemesterSubjectDetails : secondSemesterSubjectDetails,
              yearLevel: classData.yearLevel,
              
              // Store student details for easier querying
              studentName: student.user ? `${student.user.firstName} ${student.user.lastName}` : '',
              studentIdNumber: student.user ? student.user.idNumber : '',
              
              // Archive metadata
              archivedAt: new Date(),
              archivedBy: req.user.id,
              archiveReason: 'Bulk promotion to next year level'
            });
            
            await historyEntry.save();
            studentHistory.push(historyEntry);
            archivedSummary.totalSessionsArchived++;
            
          } catch (sessionError) {
            console.error(`Error archiving session ${session._id}:`, sessionError);
          }
        }
        
        // Delete all sessions for this student after archiving
        try {
          const deleteResult = await SessionCompletion.deleteMany({
            class: classId,
            student: studentId
          });
          console.log(`Deleted ${deleteResult.deletedCount} sessions for student ${studentId} after archiving`);
        } catch (deleteError) {
          console.error(`Error deleting sessions for student ${studentId}:`, deleteError);
        }
        
        archivedSummary.successfulStudents.push({
          studentId,
          studentName: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
          sessionsArchived: studentHistory.length
        });
        
        console.log(`Successfully archived ${studentHistory.length} sessions for student ${studentId}`);
        
      } catch (studentError) {
        console.error(`Error processing student ${studentId}:`, studentError);
        archivedSummary.failedStudents.push({
          studentId,
          error: studentError.message
        });
      }
    }
    
    console.log(`Bulk archiving completed: ${archivedSummary.successfulStudents.length} students processed, ${archivedSummary.totalSessionsArchived} sessions archived`);
    
    // Return success response
    res.json({
      success: true,
      message: `Bulk archiving completed for ${archivedSummary.successfulStudents.length} students`,
      summary: archivedSummary
    });
    
  } catch (error) {
    console.error('Error bulk archiving sessions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error bulk archiving sessions', 
      error: error.message 
    });
  }
});

// NEW ROUTE: Clear current sessions for graduated students
router.post('/clear-current', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId, studentIds } = req.body;
    
    // Validate required fields
    if (!classId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: classId and studentIds are required' 
      });
    }
    
    console.log(`Clearing current sessions for ${studentIds.length} graduated students in class ${classId}`);
    
    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    
    const clearedSummary = {
      totalStudents: studentIds.length,
      successfulStudents: [],
      failedStudents: [],
      totalSessionsCleared: 0
    };
    
    // Process each student
    for (const studentId of studentIds) {
      try {
        // Verify student exists
        const student = await Student.findById(studentId).populate('user');
        if (!student) {
          clearedSummary.failedStudents.push({
            studentId,
            error: 'Student not found'
          });
          continue;
        }
        
        // Find all current sessions for this student in this class
        const currentSessions = await SessionCompletion.find({
          class: classId,
          student: studentId
        });
        
        console.log(`Found ${currentSessions.length} current sessions to clear for student ${studentId}`);
        
        if (currentSessions.length === 0) {
          clearedSummary.successfulStudents.push({
            studentId,
            studentName: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
            sessionsCleared: 0
          });
          continue;
        }
        
        // Delete all current sessions for this student
        const deleteResult = await SessionCompletion.deleteMany({
          class: classId,
          student: studentId
        });
        
        console.log(`Cleared ${deleteResult.deletedCount} current sessions for graduated student ${studentId}`);
        
        clearedSummary.successfulStudents.push({
          studentId,
          studentName: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
          sessionsCleared: deleteResult.deletedCount
        });
        
        clearedSummary.totalSessionsCleared += deleteResult.deletedCount;
        
      } catch (studentError) {
        console.error(`Error clearing sessions for student ${studentId}:`, studentError);
        clearedSummary.failedStudents.push({
          studentId,
          error: studentError.message
        });
      }
    }
    
    console.log(`Session clearing completed: ${clearedSummary.successfulStudents.length} students processed, ${clearedSummary.totalSessionsCleared} sessions cleared`);
    
    // Return success response
    res.json({
      success: true,
      message: `Current sessions cleared for ${clearedSummary.successfulStudents.length} graduated students`,
      summary: clearedSummary
    });
    
  } catch (error) {
    console.error('Error clearing current sessions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error clearing current sessions', 
      error: error.message 
    });
  }
});

// NEW ROUTE: Get SSP dashboard data for student - progress, next session, recent completed
router.get('/dashboard/:studentId/:classId', authenticate, async (req, res) => {
  try {
    const { studentId, classId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`Fetching SSP dashboard data for student ${studentId} in class ${classId}`);
    
    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Authorization check - students can only access their own data
    if (userRole === 'student') {
      const studentUser = await Student.findOne({ user: userId });
      if (!studentUser || studentUser._id.toString() !== studentId) {
        return res.status(403).json({ message: 'Access denied. You can only view your own sessions.' });
      }
    }
    
    // Get all session completions for the student in the class
    const allSessions = await SessionCompletion.find({
      student: studentId,
      class: classId
    }).sort({ sessionDay: 1 });
    
    console.log(`Got ${allSessions.length} total sessions for dashboard`);
    
    // Categorize sessions by semester (same logic as SSP.vue)
    const firstSemSessions = allSessions.filter(s => 
      !s.semester || s.semester === '1st Semester');
    
    const secondSemSessions = allSessions.filter(s => 
      s.semester === '2nd Semester');
    
    const completedFirstSemSessions = allSessions.filter(s => 
      s.semester === '1st Semester (Completed)');
    
    console.log(`Sessions by semester: 1st=${firstSemSessions.length}, 2nd=${secondSemSessions.length}, 1st(Completed)=${completedFirstSemSessions.length}`);
    
    // Determine which semester's sessions to use for dashboard (same logic as SSP.vue)
    let currentSessions = [];
    let currentSemesterName = '1st Semester';
    
    if (secondSemSessions.length > 0) {
      // If there are 2nd semester sessions, prioritize showing those
      console.log("Using 2nd semester sessions for dashboard");
      currentSessions = secondSemSessions;
      currentSemesterName = '2nd Semester';
    } else if (completedFirstSemSessions.length > 0) {
      // If first semester is completed, show those
      console.log("Using completed 1st semester sessions for dashboard");
      currentSessions = completedFirstSemSessions;
      currentSemesterName = '1st Semester (Completed)';
    } else {
      // Otherwise show 1st semester sessions
      console.log("Using 1st semester sessions for dashboard");
      currentSessions = firstSemSessions;
      currentSemesterName = '1st Semester';
    }
    
    // Sort sessions by day number
    currentSessions.sort((a, b) => a.sessionDay - b.sessionDay);
    
    // Calculate progress
    const completedCount = currentSessions.filter(s => s.completed).length;
    const totalCount = currentSessions.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Find next session to complete
    const nextSession = currentSessions.find(s => !s.completed);
    
    // Get recent completed sessions (last 3, sorted by completion date)
    const recentCompleted = currentSessions
      .filter(s => s.completed && (s.completionDate || s.updatedAt))
      .sort((a, b) => {
        const dateA = new Date(a.completionDate || a.updatedAt);
        const dateB = new Date(b.completionDate || b.updatedAt);
        return dateB - dateA; // Most recent first
      })
      .slice(0, 3)
      .map(s => ({
        day: s.sessionDay,
        title: s.sessionTitle,
        completedAt: s.completionDate || s.updatedAt
      }));
    
    console.log(`Dashboard data calculated: ${progressPercentage}% progress, next session: ${nextSession ? `Day ${nextSession.sessionDay}` : 'None'}, recent completed: ${recentCompleted.length}`);
    
    const dashboardData = {
      success: true,
      currentSemester: currentSemesterName,
      totalSessions: totalCount,
      completedSessions: completedCount,
      progressPercentage: progressPercentage,
      nextSession: nextSession ? {
        day: nextSession.sessionDay,
        title: nextSession.sessionTitle,
        id: nextSession._id
      } : null,
      recentCompleted: recentCompleted,
      allSessions: currentSessions // Include all for debugging if needed
    };
    
    res.json(dashboardData);
    
  } catch (error) {
    console.error(`Error fetching SSP dashboard data for student ${req.params.studentId}:`, error);
    
    // Return error response
    res.status(500).json({
      success: false,
      message: 'Error fetching SSP dashboard data',
      error: error.message,
      currentSemester: '1st Semester',
      totalSessions: 0,
      completedSessions: 0,
      progressPercentage: 0,
      nextSession: null,
      recentCompleted: [],
      allSessions: []
    });
  }
});

module.exports = router; 