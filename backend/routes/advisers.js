const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AdvisoryClass = require('../models/AdvisoryClass');
const Class = require('../models/Class');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { authenticate, authorizeAdmin, authorizeAdviser } = require('../middleware/auth');
const Student = require('../models/Student');
const OdysseyPlan = require('../models/OdysseyPlan');
const Notification = require('../models/Notification');
const SessionCompletion = require('../models/SessionCompletion');
const Consultation = require('../models/Consultation');

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
        const loginUrl = process.env.FRONTEND_URL || 'https://sspms-frontend.onrender.com';
        
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
        select: 'yearLevel section major status room daySchedule timeSchedule students firstSemester secondSemester sspSubject',
        populate: [
          { path: 'sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' },
          { path: 'firstSemester.sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' },
          { path: 'secondSemester.sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' }
        ]
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
    
    // Process each class to ensure semester information is easily accessible
    const processedClasses = filteredClasses.map(ac => {
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
        { path: 'secondSemester.sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' }
      ]
    })
    .populate('adviser', 'firstName lastName salutation email status');
    
    console.log(`Found ${advisoryClasses.length} advisory classes for adviser ${req.user._id}`);
    
    // Filter out classes where the class is inactive
    const activeAdvisoryClasses = advisoryClasses.filter(ac => ac.class?.status === 'active');
    
    // Now populate students for each class separately to ensure proper population
    for (let i = 0; i < activeAdvisoryClasses.length; i++) {
      const ac = activeAdvisoryClasses[i];
      if (ac.class && ac.class._id) {
        // Get students for this class with proper user population
        const studentsWithUsers = await Student.find({
          class: ac.class._id,
          status: 'active'
        })
        .populate('user', 'firstName lastName idNumber email')
        .select('odysseyPlanCompleted srmSurveyCompleted consultations semesterData user')
        .lean();
        
        // Replace the students array with properly populated data
        ac.class.students = studentsWithUsers;
        console.log(`Populated ${studentsWithUsers.length} students for class ${ac.class._id}`);
      }
    }
    
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
      .populate({
        path: 'class',
        select: 'yearLevel section major status room daySchedule timeSchedule students firstSemester secondSemester sspSubject',
        populate: [
          { path: 'sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' },
          { path: 'firstSemester.sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' },
          { path: 'secondSemester.sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' }
        ]
      })
      .populate('adviser', 'firstName lastName salutation email status');

    // Process the class to add semester information flags
    const processedClass = JSON.parse(JSON.stringify(populatedAssignment));
    
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

    res.status(201).json(processedClass);
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
        .populate({
          path: 'class',
          select: 'yearLevel section major status room daySchedule timeSchedule students firstSemester secondSemester sspSubject',
          populate: [
            { path: 'sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' },
            { path: 'firstSemester.sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' },
            { path: 'secondSemester.sspSubject', select: 'sspCode name sessions semester schoolYear hours secondSemesterSessions' }
          ]
        })
        .populate('adviser', 'firstName lastName salutation email status');
      
      // Process the class to add semester information flags
      const processedClass = JSON.parse(JSON.stringify(updatedAdvisoryClass));
      
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
      
      res.json(processedClass);
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

// Check if a student has completed their Odyssey Plan for a specific semester
router.get('/student/:studentId/odyssey-plan', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;
    
    console.log(`Checking Odyssey Plan for student ${studentId}, semester: "${semester}"`);
    
    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID is required' 
      });
    }
    
    // Convert semester from text to number (if needed)
    let semesterNum = 1;
    if (semester === '2nd Semester' || semester === '2') {
      semesterNum = 2;
    }
    
    console.log(`Converted semester "${semester}" to semesterNum: ${semesterNum}`);
    
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      console.log(`Student with ID ${studentId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get the student's year level (extract numeric part)
    let yearLevel = 1;
    if (student.yearLevel) {
      const match = student.yearLevel.match(/\d+/);
      if (match) {
        yearLevel = parseInt(match[0], 10);
      }
    } else if (student.class) {
      // Try to get year level from class
      const classObj = await Class.findById(student.class);
      if (classObj && classObj.yearLevel) {
        const match = classObj.yearLevel.match(/\d+/);
        if (match) {
          yearLevel = parseInt(match[0], 10);
        }
      }
    }
    
    console.log(`Student ${student._id} (${student.firstName} ${student.lastName}) is in year level ${yearLevel}`);
    
    // Find all Odyssey Plans for this student
    const plans = await OdysseyPlan.find({ student: studentId });
    console.log(`Found ${plans.length} Odyssey Plans for student ${studentId}`);
    
    // Log each plan for debugging
    plans.forEach((plan, index) => {
      console.log(`Plan ${index + 1}: Year ${plan.year}, Semester ${plan.semester}, Created: ${plan.createdAt}`);
    });
    
    // Check if student has completed Odyssey Plan for this semester and current year
    const hasCompletedPlan = plans.some(plan => 
      plan.year === yearLevel && plan.semester === semesterNum
    );
    
    console.log(`Student ${studentId} has ${hasCompletedPlan ? 'completed' : 'not completed'} Odyssey Plan for year ${yearLevel}, semester ${semesterNum}`);
    
    return res.json({
      success: true,
      completed: hasCompletedPlan,
      yearLevel: yearLevel,
      currentSemester: semesterNum
    });
  } catch (error) {
    console.error('Error checking Odyssey Plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error checking Odyssey Plan'
    });
  }
});

// Send Odyssey Plan reminder notification to student
router.post('/student/notify-odyssey-plan', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { studentId, message } = req.body;
    
    if (!studentId || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID and message are required' 
      });
    }
    
    // Find the student
    const student = await Student.findById(studentId).populate('user');
    if (!student || !student.user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student or user not found' 
      });
    }
    
    // Create notification for the student
    const notification = new Notification({
      user: student.user._id,
      title: 'Odyssey Plan Reminder',
      message: message,
      type: 'warning',
      isRead: false
    });
    
    await notification.save();
    
    res.json({
      success: true,
      message: 'Odyssey Plan reminder sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending Odyssey Plan reminder:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get adviser's classes with student counts
router.get('/classes', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const adviserId = req.user._id;
    
    // Find all advisory class assignments for this adviser
    const advisoryClasses = await AdvisoryClass.find({ adviser: adviserId })
      .populate({
        path: 'class',
        populate: {
          path: 'sspSubject',
          select: 'name sspCode semester'
        }
      });
    
    // Add student counts to each class
    const classesWithCounts = await Promise.all(
      advisoryClasses.map(async (advisoryClass) => {
        const studentCount = await Student.countDocuments({ 
          class: advisoryClass.class._id 
        });
        
        return {
          ...advisoryClass.toObject(),
          studentCount
        };
      })
    );
    
    res.json(classesWithCounts);
  } catch (error) {
    console.error('Error fetching adviser classes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching classes' 
    });
  }
});

// Get class analytics for dashboard
router.get('/classes/:classId/analytics', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId } = req.params;
    const adviserId = req.user._id;
    
    // Verify adviser has access to this class
    const advisoryClass = await AdvisoryClass.findOne({
      adviser: adviserId,
      class: classId
    });
    
    if (!advisoryClass) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this class'
      });
    }
    
    // Get students in this class
    const students = await Student.find({ class: classId });
    const totalStudents = students.length;
    
    if (totalStudents === 0) {
      return res.json({
        avgSSPCompletion: 0,
        requirementsCompletion: 0,
        mmSubmissionRate: 0,
        studentsNeedingAttention: 0,
        sspProgress: { behind: 0, onTrack: 0, ahead: 0 }
      });
    }
    
    let totalSSPCompletion = 0;
    let totalRequirementsCompletion = 0;
    let totalMMSubmissions = 0;
    let studentsNeedingAttention = 0;
    let sspProgress = { below50: 0, between50_70: 0, between70_85: 0, above85: 0 };
    
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
        
        // Categorize SSP progress by completion percentage
        if (studentSSPCompletion < 50) {
          sspProgress.below50++;
        } else if (studentSSPCompletion < 70) {
          sspProgress.between50_70++;
        } else if (studentSSPCompletion < 85) {
          sspProgress.between70_85++;
        } else {
          sspProgress.above85++;
        }
        
        // Check if student needs attention (low completion rates)
        if (studentSSPCompletion < 50) {
          studentsNeedingAttention++;
        }
        
        // Get M&M submissions (simplified)
        const mmSubmissions = await require('../models/MidtermFinals').find({
          student: student._id
        });
        totalMMSubmissions += mmSubmissions.length;
        
        // Calculate requirements completion (simplified)
        // This would include Odyssey Plan, M&M, etc.
        let requirementsCount = 0;
        let completedRequirements = 0;
        
        // Check Odyssey Plan
        const odysseyPlans = await require('../models/OdysseyPlan').find({
          student: student._id
        });
        requirementsCount += 2; // Assume 2 semesters
        completedRequirements += odysseyPlans.length;
        
        // Check M&M (3 per semester, assuming 2 semesters)
        requirementsCount += 6;
        completedRequirements += Math.min(mmSubmissions.length, 6);
        
        const studentReqCompletion = requirementsCount > 0 ? (completedRequirements / requirementsCount) * 100 : 0;
        totalRequirementsCompletion += studentReqCompletion;
        
      } catch (studentError) {
        console.warn(`Error analyzing student ${student._id}:`, studentError);
      }
    }
    
    res.json({
      avgSSPCompletion: Math.round(totalSSPCompletion / totalStudents),
      requirementsCompletion: Math.round(totalRequirementsCompletion / totalStudents),
      mmSubmissionRate: Math.round((totalMMSubmissions / (totalStudents * 6)) * 100), // Assuming 6 M&M submissions per student
      studentsNeedingAttention,
      sspProgress
    });
    
  } catch (error) {
    console.error('Error fetching class analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics'
    });
  }
});

// Get student progress summary
router.get('/student-progress-summary', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const adviserId = req.user._id;
    
    // Get all adviser's classes
    const advisoryClasses = await AdvisoryClass.find({ adviser: adviserId });
    const classIds = advisoryClasses.map(ac => ac.class);
    
    // Get all students in adviser's classes
    const students = await Student.find({ class: { $in: classIds } });
    
    let pendingRequirements = 0;
    
    // Count pending requirements across all students
    for (const student of students) {
      try {
        // Check missing Odyssey Plans
        const odysseyPlans = await require('../models/OdysseyPlan').find({
          student: student._id
        });
        
        // Assuming 2 semesters worth of requirements
        const expectedOdysseyPlans = 2;
        if (odysseyPlans.length < expectedOdysseyPlans) {
          pendingRequirements += (expectedOdysseyPlans - odysseyPlans.length);
        }
        
        // Check missing M&M submissions
        const mmSubmissions = await require('../models/MidtermFinals').find({
          student: student._id
        });
        
        const expectedMMSubmissions = 6; // 3 per semester, 2 semesters
        if (mmSubmissions.length < expectedMMSubmissions) {
          pendingRequirements += (expectedMMSubmissions - mmSubmissions.length);
        }
        
      } catch (studentError) {
        console.warn(`Error checking requirements for student ${student._id}:`, studentError);
      }
    }
    
    res.json({
      pendingRequirements
    });
    
  } catch (error) {
    console.error('Error fetching student progress summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching progress summary'
    });
  }
});

// Get recent activities for adviser dashboard
router.get('/recent-activities', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const adviserId = req.user._id;
    
    // Get adviser's classes
    const advisoryClasses = await AdvisoryClass.find({ adviser: adviserId });
    const classIds = advisoryClasses.map(ac => ac.class);
    
    // Get students in adviser's classes
    const students = await Student.find({ class: { $in: classIds } })
      .populate('user', 'firstName lastName');
    const studentIds = students.map(s => s._id);
    
    const activities = [];
    
    // Get recent consultation bookings
    try {
      const recentConsultations = await Consultation.find({ 
        adviser: adviserId 
      })
      .populate({
        path: 'bookings',
        match: { 
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        },
        populate: {
          path: 'student',
          populate: {
            path: 'user',
            select: 'firstName lastName'
          }
        }
      })
      .sort({ createdAt: -1 })
      .limit(10);
      
      recentConsultations.forEach(consultation => {
        consultation.bookings.forEach(booking => {
          if (booking.student && booking.student.user) {
            activities.push({
              type: 'consultation',
              title: 'New Consultation Booking',
              description: `${booking.student.user.firstName} ${booking.student.user.lastName} booked a consultation`,
              createdAt: booking.createdAt
            });
          }
        });
      });
    } catch (consultationError) {
      console.warn('Error fetching consultation activities:', consultationError);
    }
    
    // Get recent Odyssey Plan submissions
    try {
      const recentOdysseyPlans = await require('../models/OdysseyPlan').find({
        student: { $in: studentIds },
        submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort({ submittedAt: -1 })
      .limit(10);
      
      recentOdysseyPlans.forEach(plan => {
        if (plan.student && plan.student.user) {
          activities.push({
            type: 'odyssey',
            title: 'Odyssey Plan Submitted',
            description: `${plan.student.user.firstName} ${plan.student.user.lastName} submitted Odyssey Plan`,
            createdAt: plan.submittedAt
          });
        }
      });
    } catch (odysseyError) {
      console.warn('Error fetching Odyssey Plan activities:', odysseyError);
    }
    
    // Get recent M&M submissions
    try {
      const recentMMSubmissions = await require('../models/MidtermFinals').find({
        student: { $in: studentIds },
        submissionDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort({ submissionDate: -1 })
      .limit(10);
      
      recentMMSubmissions.forEach(submission => {
        if (submission.student && submission.student.user) {
          activities.push({
            type: 'mm',
            title: 'M&M Submission',
            description: `${submission.student.user.firstName} ${submission.student.user.lastName} submitted ${submission.examType} M&M`,
            createdAt: submission.submissionDate
          });
        }
      });
    } catch (mmError) {
      console.warn('Error fetching M&M activities:', mmError);
    }
    
    // Sort all activities by date and return top 20
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(activities.slice(0, 20));
    
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching activities'
    });
  }
});

// Get priority alerts for adviser dashboard
router.get('/priority-alerts', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const adviserId = req.user._id;
    
    // Get adviser's classes
    const advisoryClasses = await AdvisoryClass.find({ adviser: adviserId });
    const classIds = advisoryClasses.map(ac => ac.class);
    
    // Get students in adviser's classes
    const students = await Student.find({ class: { $in: classIds } })
      .populate('user', 'firstName lastName');
    
    const alerts = [];
    
    for (const student of students) {
      try {
        const studentName = `${student.user?.firstName || ''} ${student.user?.lastName || ''}`.trim();
        
        // Check SSP completion rate
        const sessionCompletions = await SessionCompletion.find({
          student: student._id,
          class: student.class
        });
        
        const totalSessions = sessionCompletions.length;
        const completedSessions = sessionCompletions.filter(sc => sc.completed).length;
        const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
        
        if (completionRate < 40 && totalSessions > 5) {
          alerts.push({
            student: studentName,
            message: `SSP completion rate is only ${Math.round(completionRate)}%`,
            category: 'SSP Progress',
            priority: 'high'
          });
        } else if (completionRate < 60 && totalSessions > 10) {
          alerts.push({
            student: studentName,
            message: `SSP completion rate is ${Math.round(completionRate)}% - needs attention`,
            category: 'SSP Progress',
            priority: 'medium'
          });
        }
        
        // Check missing Odyssey Plans
        const odysseyPlans = await require('../models/OdysseyPlan').find({
          student: student._id
        });
        
        if (odysseyPlans.length === 0) {
          alerts.push({
            student: studentName,
            message: 'No Odyssey Plan submitted yet',
            category: 'Academic Requirements',
            priority: 'medium'
          });
        }
        
        // Check missing M&M submissions
        const mmSubmissions = await require('../models/MidtermFinals').find({
          student: student._id
        });
        
        if (mmSubmissions.length < 3 && totalSessions > 10) {
          alerts.push({
            student: studentName,
            message: `Only ${mmSubmissions.length} M&M submissions completed`,
            category: 'M&M Requirements',
            priority: 'medium'
          });
        }
        
      } catch (studentError) {
        console.warn(`Error checking alerts for student ${student._id}:`, studentError);
      }
    }
    
    // Sort by priority (high first, then medium, then low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    res.json(alerts.slice(0, 15)); // Return top 15 alerts
    
  } catch (error) {
    console.error('Error fetching priority alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching alerts'
    });
  }
});

// Get chart data for all adviser classes (overview)
router.get('/chart-data', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const adviserId = req.user._id;
    
    // Get adviser's classes
    const advisoryClasses = await AdvisoryClass.find({ adviser: adviserId });
    const classIds = advisoryClasses.map(ac => ac.class);
    
    // Get all students in adviser's classes
    const students = await Student.find({ class: { $in: classIds } })
      .populate('user', 'firstName lastName');
    
    const chartData = {
      sspProgress: await generateSSPProgressData(students, classIds),
      performance: await generatePerformanceData(students, classIds),
      mmTimeline: await generateMMTimelineData(students, classIds),
      consultations: await generateConsultationData(adviserId)
    };
    
    res.json(chartData);
    
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching chart data'
    });
  }
});

// Get chart data for specific class
router.get('/classes/:classId/chart-data', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId } = req.params;
    const adviserId = req.user._id;
    
    // Verify adviser has access to this class
    const advisoryClass = await AdvisoryClass.findOne({
      adviser: adviserId,
      class: classId
    });
    
    if (!advisoryClass) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this class'
      });
    }
    
    // Get students in this specific class
    const students = await Student.find({ class: classId })
      .populate('user', 'firstName lastName');
    
    const chartData = {
      sspProgress: await generateSSPProgressData(students, [classId]),
      performance: await generatePerformanceData(students, [classId]),
      mmTimeline: await generateMMTimelineData(students, [classId]),
      consultations: await generateConsultationDataForClass(adviserId, classId)
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
    // Get session completions for the last 8 weeks
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
      
      // Target rate increases progressively (predictive element)
      const targetRate = Math.min(85, 40 + (i * 6)); // Start at 40%, increase by 6% weekly, cap at 85%
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
      // Calculate overall completion rate for student
      const sessionCompletions = await SessionCompletion.find({
        student: student._id,
        class: { $in: classIds }
      });
      
      const totalSessions = sessionCompletions.length;
      const completedSessions = sessionCompletions.filter(sc => sc.completed).length;
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
      
      // Categorize performance
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
    
    // Get submissions for the last 12 weeks
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
      
      // Count submissions by period for this week
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

// Helper function to generate consultation data for all adviser
async function generateConsultationData(adviserId) {
  try {
    // Get consultations for this adviser
    const consultations = await Consultation.find({ adviser: adviserId });
    
    const concerns = {};
    
    // Count concerns from all bookings
    for (const consultation of consultations) {
      for (const booking of consultation.bookings) {
        if (booking.concern) {
          concerns[booking.concern] = (concerns[booking.concern] || 0) + 1;
        }
      }
    }
    
    // Convert to chart format
    const labels = Object.keys(concerns);
    const values = Object.values(concerns);
    
    return {
      labels: labels.length > 0 ? labels : ['No Data'],
      values: values.length > 0 ? values : [1]
    };
    
  } catch (error) {
    console.error('Error generating consultation data:', error);
    return {
      labels: ['Academic Performance', 'Career Planning', 'Time Management', 'Financial Concerns', 'Mental Health', 'Other'],
      values: [0, 0, 0, 0, 0, 0]
    };
  }
}

// Helper function to generate consultation data for specific class
async function generateConsultationDataForClass(adviserId, classId) {
  try {
    // Get students in this class
    const students = await Student.find({ class: classId });
    const studentIds = students.map(s => s._id);
    
    // Get consultations for this adviser
    const consultations = await Consultation.find({ adviser: adviserId });
    
    const concerns = {};
    
    // Count concerns from bookings by students in this class
    for (const consultation of consultations) {
      for (const booking of consultation.bookings) {
        if (booking.concern && studentIds.includes(booking.student)) {
          concerns[booking.concern] = (concerns[booking.concern] || 0) + 1;
        }
      }
    }
    
    // Convert to chart format
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

// Get SSP progress analytics for dashboard
router.get('/ssp-progress-analytics', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const adviserId = req.user._id;
    const { period = 'month', classId } = req.query;
    
    // Get adviser's classes
    const advisoryClasses = await AdvisoryClass.find({ adviser: adviserId });
    const classIds = advisoryClasses.map(ac => ac.class);
    console.log(`Found ${advisoryClasses.length} advisory classes for adviser ${adviserId}`);
    
    // If specific class is requested, filter to that class
    const targetClassIds = classId ? [classId] : classIds;
    console.log(`Target class IDs: ${targetClassIds}`);
    
    // Get students in the target classes
    const students = await Student.find({ class: { $in: targetClassIds } });
    console.log(`Found ${students.length} students in target classes`);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get session completions for the period
    const sessionCompletions = await SessionCompletion.find({
      student: { $in: students.map(s => s._id) },
      $or: [
        { completionDate: { $gte: startDate } },
        { completionDate: { $exists: false } },
        { completionDate: null }
      ]
    }).populate('student');
    console.log(`Found ${sessionCompletions.length} session completions`);
    
    // Group completions by time period
    const completionData = {};
    
    sessionCompletions.forEach(completion => {
      let timeKey;
      const completionDate = new Date(completion.completionDate || completion.createdAt);
      
      switch (period) {
        case 'week':
          timeKey = completionDate.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case 'month':
          const weekNumber = Math.ceil((completionDate.getDate()) / 7);
          timeKey = `Week ${weekNumber}`;
          break;
        case 'quarter':
          const month = completionDate.getMonth() + 1;
          timeKey = `Month ${month}`;
          break;
        default:
          timeKey = completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      if (!completionData[timeKey]) {
        completionData[timeKey] = { total: 0, completed: 0 };
      }
      
      completionData[timeKey].total++;
      if (completion.completed === true) {
        completionData[timeKey].completed++;
      }
    });
    
    // Calculate completion rates
    const labels = Object.keys(completionData).sort();
    const completionRates = labels.map(label => {
      const data = completionData[label];
      return data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
    });
    
    // If no data, provide default structure
    if (labels.length === 0) {
      const defaultLabels = period === 'week' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : period === 'month'
        ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        : ['Q1', 'Q2', 'Q3', 'Q4'];
      
      return res.json({
        success: true,
        labels: defaultLabels,
        completionRates: new Array(defaultLabels.length).fill(0)
      });
    }
    
    res.json({
      success: true,
      labels,
      completionRates
    });
    
  } catch (error) {
    console.error('Error fetching SSP progress analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching SSP progress analytics'
    });
  }
});

module.exports = router; 