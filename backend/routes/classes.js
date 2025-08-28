const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const AdvisoryClass = require('../models/AdvisoryClass');
const Subject = require('../models/Subject');
const { authenticate, authorizeAdmin, authorizeAdviser } = require('../middleware/auth');
const Student = require('../models/Student');
const mongoose = require('mongoose');
const User = require('../models/User');

// Get all classes
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Get status from query parameters, default to 'active'
    const status = req.query.status || 'active';
    
    // Check if status is valid
    if (!['active', 'inactive', 'all'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status parameter' });
    }
    
    let query = {};
    
    // Apply status filter if not requesting all classes
    if (status !== 'all') {
      query.status = status;
    }
    
    // Populate the subject with more fields including semester
    const classes = await Class.find(query)
      .populate('sspSubject', 'sspCode name semester schoolYear hours sessions secondSemesterSessions')
      .populate('firstSemester.sspSubject', 'sspCode name semester schoolYear hours sessions secondSemesterSessions')
      .populate('secondSemester.sspSubject', 'sspCode name semester schoolYear hours sessions secondSemesterSessions');
    
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get class by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching class with ID: ${id}`);
    
    // Check if class exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid class ID format' });
    }
    
    // First get the class with populated students and subject
    const classItem = await Class.findById(id)
      .populate('sspSubject', 'sspCode name sessions semester schoolYear hours secondSemesterSessions')
      .populate('firstSemester.sspSubject', 'sspCode name sessions semester schoolYear hours secondSemesterSessions')
      .populate('secondSemester.sspSubject', 'sspCode name sessions semester schoolYear hours secondSemesterSessions')
      .populate({
        path: 'students',
        populate: {
          path: 'user',
          select: 'firstName middleName lastName nameExtension idNumber email'
        }
      });
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    console.log(`Found class: ${classItem.yearLevel} Year - ${classItem.section} (${classItem.major})`);
    console.log(`Class has ${classItem.students?.length || 0} students in students array`);
    console.log(`Class subject data:`, classItem.sspSubject);
    
    // Get semester of this class
    const classSemester = classItem.sspSubject?.semester || '';
    console.log(`Class semester: ${classSemester}`);
    
    // Look for any additional students that should be in this class but aren't in the students array
    // This helps cover cases where the student.class reference exists but the class.students array wasn't updated
    const additionalStudents = await Student.find({
      class: id,
      _id: { $nin: classItem.students || [] },
      status: 'active'
    }).populate('user', 'firstName middleName lastName nameExtension idNumber email');
    
    console.log(`Found ${additionalStudents.length} additional students with class reference`);
    
    // If we found additional students, add them to the class.students array
    if (additionalStudents.length > 0) {
      if (!classItem.students) classItem.students = [];
      
      for (const student of additionalStudents) {
        classItem.students.push(student);
      }
      
      // Save the class to update the students array
      const updatedClassItem = await Class.findByIdAndUpdate(
        id, 
        { $addToSet: { students: { $each: additionalStudents.map(s => s._id) } } },
        { new: true }
      );
      
      console.log(`Updated class ${id} with ${additionalStudents.length} new students`);
    }
    
    // Also look for students with matching classDetails but no class reference
    // Normalize section format for comparison
    const normalizedClassSection = classItem.section.replace(/\s*-\s*/g, '-');
    
    const matchingStudents = await Student.find({
      'classDetails.yearLevel': classItem.yearLevel,
      $or: [
        { 'classDetails.section': classItem.section },
        { 'classDetails.section': normalizedClassSection }
      ],
      'classDetails.major': classItem.major,
      status: 'active',
      $or: [
        { class: { $exists: false } },
        { class: null }
      ]
    }).populate('user', 'firstName middleName lastName nameExtension idNumber email');
    
    console.log(`Found ${matchingStudents.length} students with matching classDetails but no class reference`);
    
    // If we found matching students, add the class reference to each student and add them to class.students
    if (matchingStudents.length > 0) {
      const studentIds = matchingStudents.map(s => s._id);
      
      // For 1st semester class, assign all matching students
      // For 2nd semester class, only assign students who have completed 1st semester requirements
      let studentsToAssign = [];
      
      if (classSemester.includes('1st')) {
        // For 1st semester, assign all matching students
        studentsToAssign = studentIds;
        console.log(`Assigning all ${studentIds.length} matching students to 1st semester class`);
      } else if (classSemester.includes('2nd')) {
        // For 2nd semester, we need to check if they've completed 1st semester
        // This is a placeholder - you should implement your own logic for determining
        // if students are eligible for 2nd semester based on your requirements
        
        // For now, we'll assign all matching students to 2nd semester as well
        // In a real implementation, you might check session progress in 1st semester
        studentsToAssign = studentIds;
        console.log(`Assigning all ${studentIds.length} matching students to 2nd semester class`);
      } else {
        // If no semester info, assign all matching students
        studentsToAssign = studentIds;
        console.log(`Assigning all ${studentIds.length} matching students to class with no semester info`);
      }
      
      if (studentsToAssign.length > 0) {
        // Update all matching students to set their class reference
        await Student.updateMany(
          { _id: { $in: studentsToAssign } },
          { $set: { class: id } }
        );
        
        // Update the class to add these students
        await Class.findByIdAndUpdate(
          id, 
          { $addToSet: { students: { $each: studentsToAssign } } }
        );
        
        console.log(`Updated ${studentsToAssign.length} students with class reference and added to class ${id}`);
        
        // Add these students to our result
        if (!classItem.students) classItem.students = [];
        
        for (const student of matchingStudents) {
          if (studentsToAssign.includes(student._id.toString()) && 
              !classItem.students.some(s => s._id.toString() === student._id.toString())) {
            classItem.students.push(student);
          }
        }
      }
    }
    
    // Return the class with all students
    console.log(`Returning class with ${classItem.students?.length || 0} total students`);
    res.json(classItem);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new class
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { 
      yearLevel, 
      section, 
      major, 
      daySchedule, 
      timeSchedule, 
      room, 
      sspSubjectId, 
      hours,
      // Add fields for second semester
      secondSemDaySchedule,
      secondSemTimeSchedule,
      secondSemRoom,
      secondSemSubjectId,
      secondSemHours
    } = req.body;
    
    // Check if yearLevel is provided
    if (!yearLevel) {
      return res.status(400).json({ message: 'Year level is required' });
    }
    
    // Check if section is provided
    if (!section) {
      return res.status(400).json({ message: 'Section is required' });
    }
    
    // Check if major is provided
    if (!major) {
      return res.status(400).json({ message: 'Major is required' });
    }
    
    // Check if SSP subject ID is provided for at least the first semester
    if (!sspSubjectId) {
      return res.status(400).json({ message: 'SSP Subject for first semester is required' });
    }
    
    // Check if first semester subject exists
    const firstSemSubject = await Subject.findById(sspSubjectId);
    if (!firstSemSubject) {
      return res.status(404).json({ message: 'First semester SSP Subject not found' });
    }
    
    // Check if second semester subject exists if provided
    let secondSemSubject = null;
    if (secondSemSubjectId) {
      secondSemSubject = await Subject.findById(secondSemSubjectId);
      if (!secondSemSubject) {
        return res.status(404).json({ message: 'Second semester SSP Subject not found' });
      }
    }
    
    // Check if class with same year, section, major already exists
    const existingClass = await Class.findOne({
      yearLevel,
      section,
      major,
      status: 'active'
    });
    
    if (existingClass) {
      return res.status(400).json({ 
        message: `A class with this year level, section, and major already exists` 
      });
    }
    
    // If hours not provided, get from subject
    const classHours = hours || firstSemSubject.hours || 1;
    
    // Create new class with data from both semesters
    const classData = {
      yearLevel,
      section,
      major,
      // Set first semester data as the main class fields for backward compatibility
      daySchedule,
      timeSchedule,
      room,
      hours: classHours,
      sspSubject: sspSubjectId,
      // Set first semester details
      firstSemester: {
        daySchedule,
        timeSchedule,
        room,
        sspSubject: sspSubjectId,
        hours: classHours
      }
    };
    
    // Add second semester details if provided
    if (secondSemSubjectId && secondSemDaySchedule && secondSemTimeSchedule && secondSemRoom) {
      classData.secondSemester = {
        daySchedule: secondSemDaySchedule,
        timeSchedule: secondSemTimeSchedule,
        room: secondSemRoom,
        sspSubject: secondSemSubjectId,
        hours: secondSemHours || secondSemSubject.hours || 1
      };
    }
    
    // Create the class
    const newClass = new Class(classData);
    await newClass.save();
    
    // Populate the subjects for the response
    const populatedClass = await Class.findById(newClass._id)
      .populate('sspSubject')
      .populate('firstSemester.sspSubject')
      .populate('secondSemester.sspSubject');
    
    res.status(201).json({ 
      message: 'Class created successfully', 
      class: populatedClass,
      _id: newClass._id
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update class
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { 
      yearLevel, 
      section, 
      major, 
      daySchedule, 
      timeSchedule, 
      room, 
      sspSubjectId, 
      status, 
      hours,
      // Add fields for second semester
      secondSemDaySchedule,
      secondSemTimeSchedule,
      secondSemRoom,
      secondSemSubjectId,
      secondSemHours
    } = req.body;
    
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Only update basic class info (yearLevel, section, major) - these are shared
    if (yearLevel) classItem.yearLevel = yearLevel;
    if (section) classItem.section = section;
    if (major) classItem.major = major;
    
    // Initialize semester objects if they don't exist
    if (!classItem.firstSemester) {
      classItem.firstSemester = {};
    }
    if (!classItem.secondSemester) {
      classItem.secondSemester = {};
    }
    
    // Update first semester specific fields only if first semester data is provided
    if (daySchedule !== undefined || timeSchedule !== undefined || room !== undefined || hours !== undefined || sspSubjectId !== undefined) {
      // Update main fields for backward compatibility (these represent first semester)
      if (daySchedule) classItem.daySchedule = daySchedule;
      if (timeSchedule) classItem.timeSchedule = timeSchedule;
      if (room) classItem.room = room;
      if (hours) classItem.hours = hours;
      
      // Update first semester specific fields
      if (daySchedule) classItem.firstSemester.daySchedule = daySchedule;
      if (timeSchedule) classItem.firstSemester.timeSchedule = timeSchedule;
      if (room) classItem.firstSemester.room = room;
      if (hours) classItem.firstSemester.hours = hours;
      
      if (sspSubjectId) {
        // Check if SSP subject exists
        const subject = await Subject.findById(sspSubjectId);
        if (!subject) {
          return res.status(404).json({ message: 'First semester SSP Subject not found' });
        }
        
        // Update main subject reference (for backward compatibility)
        classItem.sspSubject = sspSubjectId;
        // Update first semester subject reference
        classItem.firstSemester.sspSubject = sspSubjectId;
        
        // If hours not provided but subject changed, update hours from subject
        if (!hours && subject.hours) {
          classItem.hours = subject.hours;
          classItem.firstSemester.hours = subject.hours;
        }
      }
    }
    
    // Update second semester specific fields only if second semester data is provided
    if (secondSemDaySchedule !== undefined || secondSemTimeSchedule !== undefined || secondSemRoom !== undefined || secondSemHours !== undefined || secondSemSubjectId !== undefined) {
      if (secondSemDaySchedule) classItem.secondSemester.daySchedule = secondSemDaySchedule;
      if (secondSemTimeSchedule) classItem.secondSemester.timeSchedule = secondSemTimeSchedule;
      if (secondSemRoom) classItem.secondSemester.room = secondSemRoom;
      if (secondSemHours) classItem.secondSemester.hours = secondSemHours;
      
      if (secondSemSubjectId) {
        // Check if second semester subject exists
        const secondSemSubject = await Subject.findById(secondSemSubjectId);
        if (!secondSemSubject) {
          return res.status(404).json({ message: 'Second semester SSP Subject not found' });
        }
        
        // Update second semester subject reference
        classItem.secondSemester.sspSubject = secondSemSubjectId;
        
        // If hours not provided but subject changed, update hours from subject
        if (!secondSemHours && secondSemSubject.hours) {
          classItem.secondSemester.hours = secondSemSubject.hours;
        }
      }
    }
    
    if (status) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Use active or inactive' });
      }
      
      const oldStatus = classItem.status;
      classItem.status = status;
      
      // If class is set to inactive, delete related advisory classes
      if (status === 'inactive' && oldStatus === 'active') {
        console.log(`Moving class ${classItem._id} to inactive/archive status`);
        await AdvisoryClass.deleteMany({ class: classItem._id });
      }
      
      // If class is being reactivated, update lastActive date
      if (status === 'active' && oldStatus === 'inactive') {
        console.log(`Reactivating class ${classItem._id} from archived status`);
        classItem.lastActive = Date.now();
      }
    }
    
    classItem.updatedAt = Date.now();
    await classItem.save();
    
    // Populate the subjects for the response
    const populatedClass = await Class.findById(classItem._id)
      .populate('sspSubject')
      .populate('firstSemester.sspSubject')
      .populate('secondSemester.sspSubject');
    
    res.json(populatedClass);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete class
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Delete related advisory classes
    await AdvisoryClass.deleteMany({ class: classItem._id });
    
    // Actually delete class from database
    await Class.findByIdAndDelete(req.params.id);
    
    // Return success message
    res.json({
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inactive classes (for archive)
router.get('/archived/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const inactiveClasses = await Class.find({
      status: 'inactive'
    }).populate('sspSubject', 'sspCode name');
    
    res.json(inactiveClasses);
  } catch (error) {
    console.error('Get inactive classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Find class by year level, section, and major
router.post('/by-class-details', authenticate, async (req, res) => {
  try {
    const { yearLevel, section, major } = req.body;
    
    if (!yearLevel || !section || !major) {
      return res.status(400).json({ 
        message: 'Year level, section, and major are required',
        provided: { yearLevel, section, major } 
      });
    }
    
    console.log(`Finding class with yearLevel=${yearLevel}, section=${section}, major=${major}`);
    
    // Normalize yearLevel to handle both "2" and "2nd" formats
    const normalizedYearLevel = yearLevel.toString().replace(/[^0-9]/g, '');
    console.log(`Normalized year level: ${normalizedYearLevel}`);
    
    // Normalize section format to handle different formats (e.g., "South-2" vs "South - 2")
    const normalizedSection = section.replace(/\s*-\s*/g, '-');
    console.log(`Normalized section: ${normalizedSection}`);
    
    // Find classes with matching criteria
    const classes = await Class.find({
      status: 'active'
    }).populate('sspSubject').populate({
      path: 'students',
      populate: {
        path: 'user',
        select: 'firstName middleName lastName nameExtension idNumber email'
      }
    });
    
    console.log(`Found ${classes.length} active classes total`);
    
    // Find matching class by comparing normalized values
    const matchingClass = classes.find(c => {
      const classYearLevel = c.yearLevel.toString().replace(/[^0-9]/g, '');
      const classSection = c.section.replace(/\s*-\s*/g, '-');
      return classYearLevel === normalizedYearLevel && 
             classSection === normalizedSection && 
             c.major === major;
    });
    
    if (!matchingClass) {
      console.log(`No exact match found for yearLevel=${yearLevel}, section=${section}, major=${major}`);
      return res.status(404).json({ message: 'No matching active class found' });
    }
    
    console.log(`Found matching class: ${matchingClass._id}`);
    res.json(matchingClass);
  } catch (error) {
    console.error('Find class by details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reactivate an archived class
router.put('/reactivate/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const classId = req.params.id;
    console.log(`Attempting to reactivate class ${classId}`);
    
    // Find the class and validate it exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Validate the class is currently inactive
    if (classItem.status === 'active') {
      return res.status(400).json({ message: 'Class is already active' });
    }
    
    // Update the class status
    classItem.status = 'active';
    classItem.lastActive = Date.now();
    classItem.updatedAt = Date.now();
    await classItem.save();
    
    console.log(`Successfully reactivated class ${classId}`);
    
    // Return the reactivated class
    res.json({
      message: 'Class reactivated successfully',
      class: await Class.findById(classId).populate('sspSubject', 'sspCode')
    });
  } catch (error) {
    console.error('Reactivate class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all classes - with adviser-friendly authentication
router.get('/all-for-adviser', authenticate, async (req, res) => {
  try {
    console.log('Getting all active classes for adviser view');
    
    // Check if user is admin or adviser
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Access denied. Admin or adviser role required.' });
    }
    
    const userId = req.user.id;
    console.log(`Request from user ${userId} with role ${req.user.role}`);
    
    let query = { status: 'active' };
    
    // If user is an adviser, only return their classes
    if (req.user.role === 'adviser') {
      query.adviser = userId;
    }
    
    // Get classes with populated SSP subject
    const classes = await Class.find(query)
      .populate({
        path: 'sspSubject',
        select: 'sspCode yearLevel hours schoolYear semester'
      })
      .lean();
    
    console.log(`Found ${classes.length} classes matching query`);
    
    // For each class, count the students
    const enhancedClasses = await Promise.all(classes.map(async (classItem) => {
      // Count students in this class
      const studentCount = await Student.countDocuments({
        class: classItem._id,
        status: 'active'
      });
      
      return {
        ...classItem,
        studentCount
      };
    }));
    
    return res.json(enhancedClasses);
  } catch (error) {
    console.error('Error getting classes for adviser view:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a class by ID with adviser-friendly authentication
router.get('/by-id/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`User ${userId} with role ${userRole} accessing class ${id}`);
    
    // Verify user has permission (admin or assigned adviser)
    if (userRole !== 'admin' && userRole !== 'adviser') {
      console.warn(`User ${userId} with role ${userRole} attempted to access class ${id}`);
      return res.status(403).json({ message: 'Access denied. Admin or adviser role required.' });
    }
    
    // Find the class with populated subject and first/second semester data
    const classItem = await Class.findById(id)
      .populate({
        path: 'sspSubject',
        select: 'sspCode yearLevel hours schoolYear semester'
      })
      .populate({
        path: 'firstSemester.sspSubject',
        select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions'
      })
      .populate({
        path: 'secondSemester.sspSubject',
        select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions'
      })
      .populate('adviser');
    
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // If user is an adviser, check if they are assigned to this class
    if (userRole === 'adviser') {
      // Check if this adviser is assigned to this class via AdvisoryClass
      const advisoryClass = await AdvisoryClass.findOne({
        adviser: userId,
        class: id,
        status: 'active'
      });
      
      if (!advisoryClass) {
        // Check if the user is designated as an admin-adviser (special case)
        const isAdminAdviser = await User.findOne({
          _id: userId,
          role: 'adviser',
          isAdminAdviser: true
        });
        
        if (!isAdminAdviser) {
          console.warn(`Adviser ${userId} attempted to access class ${id} which they are not assigned to`);
          return res.status(403).json({ message: 'Access denied. You are not assigned to this class.' });
        }
      }
    }
    
    // Get students for this class with proper user population
    const studentsWithUsers = await Student.find({
      class: id,
      status: 'active'
    })
    .populate('user', 'firstName lastName idNumber email')
    .select('odysseyPlanCompleted srmSurveyCompleted consultations semesterData user')
    .lean();
    
    // Create the result object with populated students
    const result = {
      ...classItem.toObject(),
      students: studentsWithUsers,
      studentCount: studentsWithUsers.length
    };
    
    console.log(`Returning class ${id} with ${studentsWithUsers.length} students`);
    return res.json(result);
  } catch (error) {
    console.error('Error getting class by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// New route: Get classes for promotion (accessible by advisers)
router.get('/for-promotion/:yearLevel', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { yearLevel } = req.params;
    
    if (!yearLevel) {
      return res.status(400).json({ message: 'Year level is required' });
    }
    
    console.log(`Finding classes for promotion to year level: ${yearLevel}`);
    
    // Normalize the year level by extracting the numeric part
    const numericMatch = yearLevel.match(/(\d+)/);
    if (!numericMatch) {
      return res.status(400).json({ message: 'Invalid year level format' });
    }
    
    const numericYearLevel = numericMatch[1];
    console.log(`Normalized numeric year level: ${numericYearLevel}`);
    
    // Find all active classes to allow for flexible matching
    const allActiveClasses = await Class.find({ 
      status: 'active' 
    })
    .select('_id yearLevel section major room daySchedule timeSchedule')
    .lean();
    
    if (!allActiveClasses || allActiveClasses.length === 0) {
      console.log(`No active classes found at all`);
      return res.json([]);
    }
    
    // Helper function to extract numeric part from a year level string
    const getNumericYearLevel = (yearLevelStr) => {
      const match = yearLevelStr.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };
    
    // Filter classes that match the target year level using multiple strategies
    const matchingClasses = allActiveClasses.filter(classItem => {
      // Try exact match first
      if (classItem.yearLevel === yearLevel) {
        return true;
      }
      
      // Compare numeric parts (most reliable)
      const classNumeric = getNumericYearLevel(classItem.yearLevel);
      const targetNumeric = parseInt(numericYearLevel, 10);
      
      return classNumeric === targetNumeric;
    });
    
    console.log(`Found ${matchingClasses.length} matching classes using flexible matching`);
    
    // If we found matches, return them
    if (matchingClasses.length > 0) {
      return res.json(matchingClasses);
    }
    
    // If no matches found with flexible matching, try regex as a fallback
    // Create regex patterns to match different year level formats
    // This will match: "3", "3rd", "3rd Year", etc.
    const yearLevelRegex = new RegExp(`^${numericYearLevel}(st|nd|rd|th)?\\s*(Year)?$`, 'i');
    
    // Find active classes with the specified year level using regex
    const regexClasses = await Class.find({ 
      yearLevel: yearLevelRegex, 
      status: 'active' 
    })
    .select('_id yearLevel section major room daySchedule timeSchedule')
    .lean();
    
    if (regexClasses && regexClasses.length > 0) {
      console.log(`Found ${regexClasses.length} classes with regex match`);
      return res.json(regexClasses);
    }
    
    // Last resort: try direct numeric match
    const directClasses = await Class.find({ 
      yearLevel: numericYearLevel, 
      status: 'active' 
    })
    .select('_id yearLevel section major room daySchedule timeSchedule')
    .lean();
    
    if (directClasses && directClasses.length > 0) {
      console.log(`Found ${directClasses.length} classes with direct numeric match ${numericYearLevel}`);
      return res.json(directClasses);
    }
    
    console.log(`No classes found for year level: ${yearLevel} (numeric: ${numericYearLevel})`);
    return res.json([]);
  } catch (error) {
    console.error('Get classes for promotion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update class current semester
router.put('/:id/current-semester', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentSemester } = req.body;
    
    if (!currentSemester || !['1st', '2nd'].includes(currentSemester)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current semester must be either "1st" or "2nd"' 
      });
    }
    
    // Check if class exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid class ID format' 
      });
    }
    
    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    
    // Update the current semester
    classItem.currentSemester = currentSemester;
    await classItem.save();
    
    console.log(`Updated class ${classItem.yearLevel} Year - ${classItem.section} current semester to: ${currentSemester}`);
    
    res.json({
      success: true,
      message: `Class current semester updated to ${currentSemester}`,
      class: {
        id: classItem._id,
        yearLevel: classItem.yearLevel,
        section: classItem.section,
        currentSemester: classItem.currentSemester
      }
    });
    
  } catch (error) {
    console.error('Error updating class current semester:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update class current semester', 
      error: error.message 
    });
  }
});

module.exports = router; 