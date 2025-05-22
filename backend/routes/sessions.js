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
    
    console.log(`Found ${sessions.length} sessions for student ${studentId} in class ${classId}`);
    res.json(sessions);
  } catch (error) {
    console.error('Get student sessions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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
      .populate('sspSubject')
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
    
    if (!classData.sspSubject) {
      return res.status(404).json({ message: 'Class has no SSP subject assigned' });
    }
    
    // Get full subject details with sessions
    const subject = await Subject.findById(classData.sspSubject._id);
    if (!subject || !subject.sessions || subject.sessions.length === 0) {
      return res.status(404).json({ message: 'No sessions found for the class subject' });
    }
    
    // Get all session completions for the class
    const sessions = await SessionCompletion.find({ class: classId });
    console.log(`Found ${sessions.length} session completions for class ${classId}`);
    
    // Add second semester sessions to the sessions array if available
    const allSessions = [...subject.sessions];
    
    if (subject.secondSemesterSessions && subject.secondSemesterSessions.length > 0) {
      allSessions.push(...subject.secondSemesterSessions);
      console.log(`Added ${subject.secondSemesterSessions.length} second semester sessions`);
    }
    
    // Create a matrix of student session completions
    const students = classData.students || [];
    const matrix = {
      sessions: allSessions.map(session => ({
        _id: session._id,
        day: session.day,
        title: session.title,
        semester: session.day < 18 ? '1st Semester' : '2nd Semester' // Determine semester based on day
      })),
      students: students.map(student => {
        // Find all sessions for this student
        const studentSessions = sessions.filter(session => 
          session.student.toString() === student._id.toString()
        );
        
        // Create a map of session completions
        const sessionsMap = {};
        studentSessions.forEach(session => {
          sessionsMap[session.session.toString()] = {
            completed: session.completed,
            completionDate: session.completionDate,
            id: session._id,
            semester: session.semester || (session.sessionDay < 18 ? '1st Semester' : '2nd Semester')
          };
        });
        
        return {
          id: student._id,
          name: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
          idNumber: student.user ? student.user.idNumber : 'Unknown',
          sessions: sessionsMap
        };
      })
    };
    
    console.log(`Returning matrix with ${matrix.students.length} students and ${matrix.sessions.length} sessions`);
    res.json(matrix);
  } catch (error) {
    console.error('Get session matrix error:', error);
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
router.post('/update-status', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId, studentId, sessionId, completed } = req.body;
    
    if (!classId || !studentId || !sessionId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Find the session completion record
    const sessionCompletion = await SessionCompletion.findOne({
      student: studentId,
      session: sessionId,
      class: classId
    });
    
    if (!sessionCompletion) {
      return res.status(404).json({ message: 'Session completion record not found' });
    }
    
    // Update the completion status
    sessionCompletion.completed = completed;
    sessionCompletion.completionDate = completed ? new Date() : null;
    
    await sessionCompletion.save();
    
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
            // Fall back to simulating 2nd semester sessions by shifting days
            sessionDefs = subject.sessions.map(session => ({
              ...session.toObject(),
              day: session.day + 18,
              title: `2nd Semester: ${session.title}`
            }));
            console.log(`Simulating 2nd semester by shifting ${sessionDefs.length} 1st semester sessions`);
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
    
    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    
    // Get all session history for the class, grouped by student
    const history = await SessionHistory.find({ class: classId })
      .populate('student')
      .sort({ sessionDay: 1 });
    
    if (history.length === 0) {
      return res.json({ success: true, message: 'No session history found', data: [] });
    }
    
    // Group by student
    const groupedHistory = [];
    const studentMap = new Map();
    
    history.forEach(record => {
      const studentId = record.student._id.toString();
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          student: {
            id: studentId,
            name: record.student.firstName + ' ' + record.student.lastName,
            idNumber: record.student.idNumber || 'N/A'
          },
          sessions: []
        });
        
        groupedHistory.push(studentMap.get(studentId));
      }
      
      studentMap.get(studentId).sessions.push({
        id: record._id,
        day: record.sessionDay,
        title: record.sessionTitle,
        completed: record.completed,
        completedAt: record.completionDate,
        semester: record.semester
      });
    });
    
    res.json({ success: true, data: groupedHistory });
    
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching session history', 
      error: error.message 
    });
  }
});

// NEW ROUTE: Get session history for a student
router.get('/history/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId } = req.query;
    
    // Verify student exists
    const student = await Student.findById(studentId);
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
      .sort({ semester: 1, sessionDay: 1 });
    
    if (!history || history.length === 0) {
      return res.json({ success: true, message: 'No session history found', data: [] });
    }
    
    console.log(`Found ${history.length} history records for student ${studentId}`);
    
    // Group by class and semester
    const groupedHistory = [];
    const classMap = new Map();
    
    for (const record of history) {
      try {
        // Skip records with missing class data
        if (!record.class) {
          console.warn(`Skipping history record ${record._id} - missing class reference`);
          continue;
        }
        
        const classId = record.class._id.toString();
        const classSemester = record.semester || '1st Semester'; // Default to 1st semester if missing
        const key = `${classId}_${classSemester}`;
        
        if (!classMap.has(key)) {
          // Create new class group with safe access to properties
          const classYearLevel = record.class.yearLevel || 'Unknown';
          const classSection = record.class.section || 'Unknown';
          
          classMap.set(key, {
            class: {
              id: classId,
              name: record.class.name || `${classYearLevel} - ${classSection}`,
              yearLevel: classYearLevel,
              section: classSection
            },
            semester: classSemester,
            sessions: []
          });
          
          groupedHistory.push(classMap.get(key));
        }
        
        // Add session to the appropriate group
        classMap.get(key).sessions.push({
          id: record._id,
          day: record.sessionDay || 0,
          title: record.sessionTitle || `Day ${record.sessionDay || 0}`,
          completed: !!record.completed,
          completedAt: record.completionDate || null
        });
      } catch (recordError) {
        console.error(`Error processing history record: ${recordError.message}`, record);
        // Continue processing other records even if one fails
      }
    }
    
    res.json({ success: true, data: groupedHistory });
    
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
    const { classId, studentId } = req.body;
    
    if (!classId || !studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class ID and Student ID are required' 
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
    
    // Check if the class is already in the second semester
    if (classData.sspSubject.semester === '2nd Semester') {
      return res.status(400).json({ success: false, message: 'Class is already in the second semester' });
    }
    
    // Check if 2nd semester sessions are available
    const subject = await Subject.findById(classData.sspSubject._id);
    if (!subject || !subject.secondSemesterSessions || subject.secondSemesterSessions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin has not yet added 2nd semester sessions for this subject',
        type: 'no_second_semester'
      });
    }
    
    // Get all session completions for the student in this class
    const sessions = await SessionCompletion.find({ 
      class: classId,
      student: studentId
    });
    
    if (sessions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No sessions found for this student in this class' 
      });
    }
    
    // Check if student has more than 2 missed sessions (assuming total of 18 sessions)
    const requiredCompletedSessions = 16; // Allow only 2 missed sessions
    const completedCount = sessions.filter(s => s.completed).length;
    
    if (completedCount < requiredCompletedSessions) {
      const studentName = student.name || `Student ID: ${studentId}`;
      
      return res.status(400).json({
        success: false,
        message: `Cannot complete semester - ${studentName} has more than 2 missed sessions`,
        type: 'too_many_missed_sessions',
        student: {
          id: studentId,
          name: studentName,
          completed: completedCount,
          totalSessions: sessions.length,
          missing: sessions.length - completedCount
        }
      });
    }
    
    console.log(`Archiving ${sessions.length} sessions for student ${studentId} in class ${classId}`);
    
    // Create history entries for each session
    const history = [];
    
    for (const session of sessions) {
      try {
        console.log(`Creating history entry for session ${session._id}`);
        
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
    
    // Mark student as completed for 1st semester but don't delete the sessions
    // This allows us to keep a record of the completion while preparing for 2nd semester
    for (const session of sessions) {
      try {
        session.semester = '1st Semester (Completed)';
        await session.save();
      } catch (error) {
        console.error(`Error updating session ${session._id}:`, error);
      }
    }
    
    // Create a notification for the student about 2nd semester sessions
    try {
      // First, find the student user
      const studentDoc = await Student.findById(studentId).populate('user');
      if (studentDoc && studentDoc.user) {
        const Notification = require('../models/Notification');
        
        const notification = new Notification({
          recipient: studentDoc.user._id,
          sender: req.user.id,
          title: '2nd Semester Sessions Available',
          message: 'You have completed your 1st semester sessions. 2nd semester sessions are now available. Please check your SSP page to view and complete your new sessions.',
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
    
    // Now automatically create 2nd semester sessions for this student
    try {
      console.log(`Automatically creating 2nd semester sessions for student ${studentId}`);
      
      // Get relevant session definitions for 2nd semester
      let sessionDefs = [];
      
      // For 2nd semester, first try to use secondSemesterSessions if they exist
      if (subject.secondSemesterSessions && subject.secondSemesterSessions.length > 0) {
        sessionDefs = subject.secondSemesterSessions;
        console.log(`Using ${sessionDefs.length} second semester sessions from subject definition`);
      } else {
        // Fall back to simulating 2nd semester sessions by shifting days
        sessionDefs = subject.sessions.map(session => ({
          ...session.toObject(),
          day: session.day + 18,
          title: `2nd Semester: ${session.title}`
        }));
        console.log(`Simulating 2nd semester by shifting ${sessionDefs.length} 1st semester sessions`);
      }
      
      // Create the 2nd semester sessions
      let createdSessions = 0;
      
      for (const sessionDef of sessionDefs) {
        try {
          const session = new SessionCompletion({
            student: studentId,
            class: classId,
            subject: subject._id,
            session: sessionDef._id,
            sessionDay: sessionDef.day,
            sessionTitle: sessionDef.title,
            completed: false,
            semester: '2nd Semester'
          });
          
          await session.save();
          createdSessions++;
        } catch (error) {
          console.error(`Failed to create 2nd semester session:`, error);
        }
      }
      
      console.log(`Created ${createdSessions} second semester sessions for student ${studentId}`);
    } catch (loadError) {
      console.error('Error creating 2nd semester sessions:', loadError);
      // Don't fail the entire operation if creating 2nd semester sessions fails
    }
    
    // Return success
    res.json({
      success: true,
      message: 'Sessions archived successfully for student',
      studentId: studentId,
      archivedCount: history.length
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
        // Fall back to simulating 2nd semester sessions by shifting days
        sessionDefs = subject.sessions.map(session => ({
          ...session.toObject(),
          day: session.day + 18,
          title: `2nd Semester: ${session.title}`
        }));
        console.log(`Simulating 2nd semester by shifting ${sessionDefs.length} 1st semester sessions`);
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

module.exports = router; 