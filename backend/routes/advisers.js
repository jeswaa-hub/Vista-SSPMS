const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AdvisoryClass = require('../models/AdvisoryClass');
const Class = require('../models/Class');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { authenticate, authorizeAdmin, authorizeAdviser } = require('../middleware/auth');
const Student = require('../models/Student');

// Get all advisers
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const advisers = await User.find({ role: 'adviser', status: 'active' }).select('-password');
    res.json(advisers);
  } catch (error) {
    console.error('Get advisers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get adviser by ID
router.get('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const adviser = await User.findOne({ _id: req.params.id, role: 'adviser' }).select('-password');
    
    if (!adviser) {
      return res.status(404).json({ message: 'Adviser not found' });
    }
    
    res.json(adviser);
  } catch (error) {
    console.error('Get adviser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new adviser
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { firstName, middleName, lastName, nameExtension, idNumber, salutation, email, password, sendWelcomeEmail, sspAdvisoryClassId, contactNumber } = req.body;
    
    // Validate email domain
    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Email must be from gmail.com domain' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Check if sspAdvisoryClassId is provided and valid
    if (sspAdvisoryClassId) {
      // Check if class exists
      const classExists = await Class.findById(sspAdvisoryClassId);
      if (!classExists) {
        return res.status(400).json({ message: 'Selected class does not exist' });
      }
      
      // Check if class is already assigned to another adviser
      const alreadyAssigned = await AdvisoryClass.findOne({ 
        class: sspAdvisoryClassId,
        status: 'active'
      });
      
      if (alreadyAssigned) {
        return res.status(400).json({ message: 'This class is already assigned to an adviser' });
      }
    }
    
    // Use provided password or default (firstName + idNumber)
    const defaultPassword = firstName + idNumber;
    
    // Create adviser user
    const adviser = new User({
      firstName,
      middleName,
      lastName,
      nameExtension: nameExtension || 'N/A',
      idNumber,
      salutation,
      contactNumber,
      email,
      password: password || defaultPassword,
      role: 'adviser',
      status: 'active',
      passwordChangeRequired: true // Set flag to require password change on first login
    });
    
    await adviser.save();
    
    // If sspAdvisoryClassId is provided, create advisory class relationship
    if (sspAdvisoryClassId) {
      const advisoryClass = new AdvisoryClass({
        class: sspAdvisoryClassId,
        adviser: adviser._id
      });
      
      await advisoryClass.save();
    }
    
    // If sendWelcomeEmail flag is true, send a welcome email with login instructions
    if (sendWelcomeEmail) {
      try {
        console.log('Creating email transporter with:', {
          service: process.env.EMAIL_SERVICE,
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD ? '[MASKED]' : 'undefined'
        });
        
        // Create transporter
        const transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        
        // Login URL
        const loginUrl = `http://localhost:5173/login`;
        
        // Email options
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: adviser.email,
          subject: 'SSP Management System - Account Created',
          text: `Your account for the SSP Management System has been created. 
          
          Your default password is: ${defaultPassword}
          
          Please log in at: ${loginUrl}
          
          You will be required to change your password on your first login for security reasons.`
        };
        
        console.log('Sending email to:', adviser.email);
        
        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue with account creation even if email fails
      }
    }
    
    res.status(201).json(adviser);
  } catch (error) {
    console.error('Create adviser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update adviser
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { firstName, middleName, lastName, nameExtension, idNumber, salutation, email, status, contactNumber } = req.body;
    
    const adviser = await User.findById(req.params.id);
    
    if (!adviser || adviser.role !== 'adviser') {
      return res.status(404).json({ message: 'Adviser not found' });
    }
    
    // Update fields
    if (firstName) adviser.firstName = firstName;
    if (middleName) adviser.middleName = middleName;
    if (lastName) adviser.lastName = lastName;
    if (nameExtension) adviser.nameExtension = nameExtension;
    if (idNumber) adviser.idNumber = idNumber;
    if (salutation) adviser.salutation = salutation;
    if (contactNumber) adviser.contactNumber = contactNumber;
    if (email) {
      // Validate email domain
      if (!email.endsWith('@phinmaed.com')) {
        return res.status(400).json({ message: 'Email must be from phinmaed.com domain' });
      }
      adviser.email = email;
    }
    
    // Handle status change
    if (status) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Use active or inactive' });
      }
      
      const oldStatus = adviser.status;
      adviser.status = status;
      
      // If status is changed to inactive from active, delete advisory classes
      if (status === 'inactive' && oldStatus === 'active') {
        // Delete all associated advisory classes
        await AdvisoryClass.deleteMany({ adviser: adviser._id });
      }
    }
    
    await adviser.save();
    
    res.json({ message: 'Adviser updated successfully' });
  } catch (error) {
    console.error('Update adviser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete adviser
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const adviser = await User.findById(req.params.id);
    
    if (!adviser || adviser.role !== 'adviser') {
      return res.status(404).json({ message: 'Adviser not found' });
    }
    
    // Delete all associated advisory classes
    await AdvisoryClass.deleteMany({ adviser: adviser._id });
    
    // Actually delete adviser from database
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Adviser deleted successfully' });
  } catch (error) {
    console.error('Delete adviser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all advisory classes
router.get('/advisory/classes', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const advisoryClasses = await AdvisoryClass.find()
      .populate({
        path: 'class',
        select: 'yearLevel section major status',
        populate: { path: 'sspSubject', select: 'sspCode name' }
      })
      .populate('adviser', 'firstName lastName salutation email status');
    
    // Filter to include:
    // 1. Classes with active advisers and active class status
    // 2. Classes without advisers but with active class status
    const filteredClasses = advisoryClasses.filter(ac => {
      // If no adviser, just check if class is active
      if (!ac.adviser) {
        return ac.class?.status === 'active';
      }
      
      // If has adviser, check both adviser and class are active
      return ac.adviser?.status === 'active' && ac.class?.status === 'active';
    });
    
    res.json(filteredClasses);
  } catch (error) {
    console.error('Get advisory classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my advisory classes (for adviser use)
router.get('/my/classes', authenticate, async (req, res) => {
  try {
    console.log(`Adviser ${req.user._id} requesting their own classes`);
    
    // Ensure the user is an adviser
    if (req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Only advisers can access this endpoint' });
    }
    
    // Find all advisory classes for this adviser
    const advisoryClasses = await AdvisoryClass.find({ 
      adviser: req.user._id,
      status: 'active'
    })
    .populate({
      path: 'class',
      select: 'yearLevel section major room daySchedule timeSchedule status students firstSemester secondSemester sspSubject',
      populate: [
        { path: 'sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' },
        { path: 'firstSemester.sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' },
        { path: 'secondSemester.sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' },
        { path: 'students', 
          select: 'odysseyPlanCompleted srmSurveyCompleted consultations semesterData',
          populate: { path: 'user', select: 'firstName lastName idNumber email' }
        }
      ]
    })
    .populate('adviser', 'firstName lastName salutation email status');
    
    console.log(`Found ${advisoryClasses.length} advisory classes for adviser ${req.user._id}`);
    
    // Filter out classes where the class is inactive
    const activeAdvisoryClasses = advisoryClasses.filter(ac => ac.class?.status === 'active');
    
    // Process each class to ensure semester information is easily accessible
    const processedClasses = activeAdvisoryClasses.map(ac => {
      // Create a copy to avoid mutating the original
      const processedClass = JSON.parse(JSON.stringify(ac));
      
      // Debug log for troubleshooting
      console.log(`Processing class ${processedClass.class?._id}: ${processedClass.class?.yearLevel} - ${processedClass.class?.section}`);
      console.log(`Class has firstSemester: ${!!processedClass.class?.firstSemester}, secondSemester: ${!!processedClass.class?.secondSemester}`);
      
      // Check if the class has the new semester structure
      if (processedClass.class && (processedClass.class.firstSemester || processedClass.class.secondSemester)) {
        // Add flags to indicate which semesters are available
        processedClass.hasFirstSemester = !!processedClass.class.firstSemester?.sspSubject;
        processedClass.hasSecondSemester = !!processedClass.class.secondSemester?.sspSubject;
        
        // Add first semester subject info at the top level for backwards compatibility
        if (processedClass.hasFirstSemester) {
          processedClass.class.firstSemesterSubject = processedClass.class.firstSemester.sspSubject;
        }
        
        // Add second semester subject info at the top level
        if (processedClass.hasSecondSemester) {
          processedClass.class.secondSemesterSubject = processedClass.class.secondSemester.sspSubject;
        }
      } else {
        // For legacy classes, determine semester from sspSubject
        const semester = processedClass.class?.sspSubject?.semester || '';
        processedClass.hasFirstSemester = semester.includes('1st') || !semester.includes('2nd');
        processedClass.hasSecondSemester = semester.includes('2nd');
        
        // Add convenience flags
        if (processedClass.hasFirstSemester) {
          processedClass.class.firstSemesterSubject = processedClass.class.sspSubject;
        }
        
        if (processedClass.hasSecondSemester) {
          processedClass.class.secondSemesterSubject = processedClass.class.sspSubject;
        }
      }
      
      return processedClass;
    });
    
    res.json(processedClasses);
  } catch (error) {
    console.error('Get my advisory classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available classes for advisory (classes not already assigned to an adviser)
router.get('/advisory/available-classes', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Get all classes
    const allClasses = await Class.find({ status: 'active' })
      .populate('sspSubject', 'sspCode name hours semester schoolYear')
      .populate('firstSemester.sspSubject', 'sspCode name hours semester schoolYear')
      .populate('secondSemester.sspSubject', 'sspCode name hours semester schoolYear');
    
    // Get all advisory classes that have an adviser assigned
    const advisoryClasses = await AdvisoryClass.find({ 
      adviser: { $ne: null } 
    });
    
    // Extract class IDs that already have an adviser
    const classIdsWithAdvisers = advisoryClasses.map(ac => ac.class.toString());
    
    // Filter classes that don't have an adviser assigned
    const availableClasses = allClasses.filter(cls => 
      !classIdsWithAdvisers.includes(cls._id.toString())
    );
    
    // Process classes to add semester information
    const processedClasses = availableClasses.map(cls => {
      // Create a copy to avoid mutating the original
      const processedClass = cls.toObject();
      
      // Check if the class has the new semester structure
      if (processedClass.firstSemester || processedClass.secondSemester) {
        // Add flags to indicate which semesters are available
        processedClass.hasFirstSemester = !!processedClass.firstSemester?.sspSubject;
        processedClass.hasSecondSemester = !!processedClass.secondSemester?.sspSubject;
        
        // For display purposes, create a semester label
        let semesterLabel = '';
        if (processedClass.hasFirstSemester && processedClass.hasSecondSemester) {
          semesterLabel = 'Both Semesters';
        } else if (processedClass.hasFirstSemester) {
          semesterLabel = '1st Semester';
        } else if (processedClass.hasSecondSemester) {
          semesterLabel = '2nd Semester';
        }
        processedClass.semesterLabel = semesterLabel;
      } else {
        // For legacy classes, determine semester from sspSubject
        const semester = processedClass.sspSubject?.semester || '';
        processedClass.hasFirstSemester = semester.includes('1st') || !semester.includes('2nd');
        processedClass.hasSecondSemester = semester.includes('2nd');
        
        // For display purposes, create a semester label
        processedClass.semesterLabel = semester || 'Unknown Semester';
      }
      
      return processedClass;
    });
    
    console.log(`Found ${processedClasses.length} classes available for assignment out of ${allClasses.length} total classes`);
    
    res.json(processedClasses);
  } catch (error) {
    console.error('Get available classes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new advisory class assignment
router.post('/advisory/classes', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { adviser, class: classId } = req.body;

    // Validate inputs
    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: 'Class not found' });
    }

    // Check if this class is already assigned in an advisory class
    const existingAssignment = await AdvisoryClass.findOne({ 
      class: classId
    });
    
    if (existingAssignment) {
      return res.status(400).json({ 
        message: 'This class is already assigned to an advisory class',
        existingAssignment
      });
    }

    // Check adviser if provided
    if (adviser) {
      const adviserExists = await User.findOne({ _id: adviser, role: 'adviser' });
      if (!adviserExists) {
        return res.status(400).json({ message: 'Adviser not found' });
      }
    }

    // Create new advisory class assignment
    const newAssignment = new AdvisoryClass({
      adviser: adviser || null,
      class: classId,
      status: 'active'
    });

    const savedAssignment = await newAssignment.save();
    console.log('Created new advisory class assignment:', savedAssignment);

    // Return the new assignment with populated fields
    const populatedAssignment = await AdvisoryClass.findById(newAssignment._id)
      .populate('class', 'yearLevel section major')
      .populate('adviser', 'firstName lastName salutation email');

    res.status(201).json(populatedAssignment);
  } catch (error) {
    console.error('Create advisory class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update advisory class
router.put('/advisory/classes/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { adviser, class: classId, status } = req.body;
    
    // Validate inputs
    if (!adviser || !classId) {
      return res.status(400).json({ message: 'Adviser ID and Class ID are required' });
    }
    
    // Find the advisory class
    const advisoryClass = await AdvisoryClass.findById(req.params.id);
    if (!advisoryClass) {
      return res.status(404).json({ message: 'Advisory class not found' });
    }
    
    // Check if adviser exists
    const adviserExists = await User.findOne({ _id: adviser, role: 'adviser' });
    if (!adviserExists) {
      return res.status(400).json({ message: 'Adviser not found' });
    }
    
    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: 'Class not found' });
    }
    
    // Check status of adviser and class
    if (adviserExists.status !== 'active') {
      return res.status(400).json({ message: 'Cannot assign inactive adviser to advisory class' });
    }
    
    if (classExists.status !== 'active') {
      return res.status(400).json({ message: 'Cannot assign inactive class to advisory class' });
    }
    
    // If status is being set to inactive, delete the record
    if (status && status === 'inactive') {
      await AdvisoryClass.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Advisory class deleted successfully' });
    } else {
      // Update fields
      advisoryClass.adviser = adviser;
      advisoryClass.class = classId;
      advisoryClass.updatedAt = Date.now();
      await advisoryClass.save();
      
      // Return updated advisory class with populated fields
      const updatedAdvisoryClass = await AdvisoryClass.findById(advisoryClass._id)
        .populate('class', 'yearLevel section major')
        .populate('adviser', 'firstName lastName salutation email');
      
      res.json(updatedAdvisoryClass);
    }
  } catch (error) {
    console.error('Update advisory class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete advisory class
router.delete('/advisory/classes/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const advisoryClass = await AdvisoryClass.findById(req.params.id);
    
    if (!advisoryClass) {
      return res.status(404).json({ message: 'Advisory class not found' });
    }
    
    // Delete the record
    await AdvisoryClass.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Advisory class deleted successfully' });
  } catch (error) {
    console.error('Delete advisory class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inactive advisers (for archive)
router.get('/archived/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const inactiveAdvisers = await User.find({
      role: 'adviser',
      status: 'inactive'
    }).select('-password');
    
    res.json(inactiveAdvisers);
  } catch (error) {
    console.error('Get inactive advisers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students for a specific class (for adviser use)
router.get('/class/:id/students', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Adviser ${req.user._id} requesting students for class ${id}`);
    
    // Ensure the user is an adviser
    if (req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Only advisers can access this endpoint' });
    }
    
    // Find if this adviser is assigned to this class
    const advisoryClass = await AdvisoryClass.findOne({
      adviser: req.user._id,
      class: id,
      status: 'active'
    });
    
    if (!advisoryClass) {
      return res.status(403).json({ message: 'You are not authorized to view this class' });
    }
    
    // Get class details with students
    const classDetails = await Class.findById(id)
      .populate({
        path: 'students',
        select: 'odysseyPlanCompleted srmSurveyCompleted consultations status semesterData',
        populate: {
          path: 'user',
          select: 'firstName lastName nameExtension idNumber email'
        }
      })
      .populate('sspSubject', 'sspCode name sessions semester schoolYear hours secondSemesterSessions')
      .populate('firstSemester.sspSubject', 'sspCode name sessions semester schoolYear hours secondSemesterSessions')
      .populate('secondSemester.sspSubject', 'sspCode name sessions semester schoolYear hours secondSemesterSessions');
    
    if (!classDetails) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Process class to add semester information
    const processedClass = classDetails.toObject();
    
    // Check if the class has the new semester structure
    if (processedClass.firstSemester || processedClass.secondSemester) {
      // Add flags to indicate which semesters are available
      processedClass.hasFirstSemester = !!processedClass.firstSemester?.sspSubject;
      processedClass.hasSecondSemester = !!processedClass.secondSemester?.sspSubject;
      
      // Add first semester subject info at the top level for backwards compatibility
      if (processedClass.hasFirstSemester) {
        processedClass.firstSemesterSubject = processedClass.firstSemester.sspSubject;
      }
      
      // Add second semester subject info at the top level
      if (processedClass.hasSecondSemester) {
        processedClass.secondSemesterSubject = processedClass.secondSemester.sspSubject;
      }
    } else {
      // For legacy classes, determine semester from sspSubject
      const semester = processedClass.sspSubject?.semester || '';
      processedClass.hasFirstSemester = semester.includes('1st') || !semester.includes('2nd');
      processedClass.hasSecondSemester = semester.includes('2nd');
      
      // For backwards compatibility, add references to semester subjects
      if (processedClass.hasFirstSemester) {
        processedClass.firstSemesterSubject = processedClass.sspSubject;
      }
      
      if (processedClass.hasSecondSemester) {
        processedClass.secondSemesterSubject = processedClass.sspSubject;
      }
    }
    
    // Filter to active students only
    if (processedClass.students) {
      processedClass.students = processedClass.students.filter(student => 
        student.status === 'active'
      );
    }
    
    res.json(processedClass);
  } catch (error) {
    console.error('Get students for class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all classes advised by the current user with student counts and SSP subjects
router.get('/classes', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`Getting classes advised by user ${userId} with role ${userRole}`);
    
    // Check if user is admin or adviser
    if (userRole !== 'admin' && userRole !== 'adviser') {
      console.warn(`User ${userId} with role ${userRole} attempted to access adviser classes`);
      return res.status(403).json({ message: 'Access denied. Admin or adviser role required.' });
    }
    
    // Build query based on role
    const query = { status: 'active' };
    if (userRole === 'adviser') {
      // Only show classes assigned to this adviser
      query.adviser = userId;
    }
    
    // Log the query we're using
    console.log('Using query:', JSON.stringify(query));
    
    // Get all classes advised by the user with populated subject data
    const classes = await Class.find(query)
      .populate({
        path: 'sspSubject',
        select: 'sspCode yearLevel hours schoolYear semester'
      })
      .lean();
    
    if (!classes || classes.length === 0) {
      console.log(`No classes found for query`);
      return res.json([]);
    }
    
    console.log(`Found ${classes.length} classes for query`);
    
    // For each class, count the students and check if subject is properly assigned
    const enhancedClasses = await Promise.all(classes.map(async (classItem) => {
      // Count students in this class
      const studentCount = await Student.countDocuments({
        class: classItem._id,
        status: 'active'
      });
      
      const result = {
        ...classItem,
        studentCount
      };
      
      // Check if there's an SSP subject assigned
      if (!classItem.sspSubject) {
        console.warn(`Class ${classItem._id} has no SSP subject assigned`);
      }
      
      return result;
    }));
    
    return res.json(enhancedClasses);
  } catch (error) {
    console.error('Error getting advised classes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get consultation requests for adviser's students
router.get('/consultations', authenticate, async (req, res) => {
  try {
    // Ensure the user is an adviser
    if (req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Only advisers can access this endpoint' });
    }

    // Get all advisory classes for this adviser
    const advisoryClasses = await AdvisoryClass.find({
      adviser: req.user._id,
      status: 'active'
    }).populate({
      path: 'class',
      select: 'students'
    });

    // Get all student IDs from the adviser's classes
    const studentIds = advisoryClasses.reduce((ids, ac) => {
      if (ac.class && ac.class.students) {
        return [...ids, ...ac.class.students];
      }
      return ids;
    }, []);

    // Get all consultations for these students
    const students = await Student.find({
      _id: { $in: studentIds },
      status: 'active'
    }).populate('user', 'firstName lastName idNumber email')
      .populate('consultations.adviser', 'firstName lastName salutation email');

    // Extract and format consultations
    const consultations = students.reduce((acc, student) => {
      const studentConsultations = student.consultations.map(consultation => ({
        id: consultation._id,
        studentId: student._id,
        studentName: `${student.user.firstName} ${student.user.lastName}`,
        studentIdNumber: student.user.idNumber,
        title: consultation.title,
        date: consultation.date,
        startTime: consultation.startTime,
        endTime: consultation.endTime,
        location: consultation.location,
        status: consultation.status,
        notes: consultation.notes,
        feedback: consultation.feedback,
        rejectionReason: consultation.rejectionReason
      }));
      return [...acc, ...studentConsultations];
    }, []);

    res.json(consultations);
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a consultation request
router.put('/consultations/:id/approve', authenticate, async (req, res) => {
  try {
    // Ensure the user is an adviser
    if (req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Only advisers can approve consultations' });
    }

    const { id } = req.params;
    const { location } = req.body;

    // Find the student with this consultation
    const student = await Student.findOne({
      'consultations._id': id
    });

    if (!student) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Find the consultation
    const consultation = student.consultations.id(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify this adviser is assigned to the student's class
    const advisoryClass = await AdvisoryClass.findOne({
      adviser: req.user._id,
      class: student.class,
      status: 'active'
    });

    if (!advisoryClass) {
      return res.status(403).json({ message: 'You are not authorized to approve this consultation' });
    }

    // Update the consultation
    consultation.status = 'approved';
    if (location) {
      consultation.location = location;
    }

    await student.save();
    res.json({ message: 'Consultation approved successfully' });
  } catch (error) {
    console.error('Approve consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a consultation request
router.put('/consultations/:id/reject', authenticate, async (req, res) => {
  try {
    // Ensure the user is an adviser
    if (req.user.role !== 'adviser') {
      return res.status(403).json({ message: 'Only advisers can reject consultations' });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    // Find the student with this consultation
    const student = await Student.findOne({
      'consultations._id': id
    });

    if (!student) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Find the consultation
    const consultation = student.consultations.id(id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    // Verify this adviser is assigned to the student's class
    const advisoryClass = await AdvisoryClass.findOne({
      adviser: req.user._id,
      class: student.class,
      status: 'active'
    });

    if (!advisoryClass) {
      return res.status(403).json({ message: 'You are not authorized to reject this consultation' });
    }

    // Update the consultation
    consultation.status = 'rejected';
    consultation.rejectionReason = rejectionReason;

    await student.save();
    res.json({ message: 'Consultation rejected successfully' });
  } catch (error) {
    console.error('Reject consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 