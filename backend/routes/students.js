const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const crypto = require('crypto');
const { authenticate, authorizeAdmin, authorizeAdviser } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Ultra-basic test route - no database, no error handling, just a simple response
router.get('/basic-test', (req, res) => {
  console.log('Basic test route accessed');
  res.json({ message: 'Basic test successful' });
});

// Get all students
router.get('/', authenticate, authorizeAdviser, async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { status, yearLevel, section, major } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Add status filter if provided, default to 'active'
    filter.status = status || 'active';
    
    console.log('Fetching students with filter:', filter);
    
    // Find students with the specified filters
    const students = await Student.find(filter)
      .populate('user', 'firstName middleName lastName nameExtension idNumber email')
      .populate('class', 'yearLevel section major');
    
    console.log(`Found ${students.length} students with status: ${filter.status}`);
    
    // For students with classDetails but no class assigned, find matching classes
    for (const student of students) {
      if (!student.class && student.classDetails && student.classDetails.yearLevel) {
        student._doc.classInfo = {
          yearLevel: student.classDetails.yearLevel,
          section: student.classDetails.section,
          major: student.classDetails.major || student.major
        };
      }
    }
    
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Debug route to test MongoDB Student model
router.get('/test-model', async (req, res) => {
  try {
    console.log('Testing Student model connection');
    
    // 1. Check if the Student model is defined
    if (!Student) {
      return res.status(500).json({ 
        error: 'Student model is not defined' 
      });
    }
    
    // 2. Try to list all model fields
    const fields = Object.keys(Student.schema.paths);
    console.log('Student model fields:', fields);
    
    // 3. Get total count of students (any status)
    const totalCount = await Student.countDocuments();
    console.log('Total students in database:', totalCount);
    
    // 4. Try to create a temporary student (but don't save it)
    const testStudent = new Student({
      pendingRegistration: {
        firstName: 'Test',
        lastName: 'User',
        idNumber: 'TEST-ID',
        email: 'test@example.com',
        password: 'password123'
      },
      gender: 'Male',
      contactNumber: '123456789',
      major: 'Business Informatics',
      approvalStatus: 'pending',
      status: 'inactive'
    });
    
    // 5. Validate the test student
    let validationError = null;
    try {
      await testStudent.validate();
    } catch (err) {
      validationError = err;
      console.error('Validation error:', err);
    }
    
    res.json({
      message: 'Student model diagnostic',
      modelExists: true,
      fields,
      totalStudents: totalCount,
      validationSuccess: !validationError,
      validationError: validationError ? {
        message: validationError.message,
        errors: Object.keys(validationError.errors || {})
      } : null
    });
  } catch (error) {
    console.error('Model test error:', error);
    res.status(500).json({ 
      message: 'Server error in model test', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Get pending registration students
router.get('/pending', authenticate, authorizeAdmin, async (req, res) => {
  try {
    console.log('Fetching pending students');
    
    // Find all students with pending approval status
    const pendingStudents = await Student.find({ approvalStatus: 'pending' })
      .populate('class', 'yearLevel section major');
    
    console.log(`Found ${pendingStudents.length} pending students`);
    
    if (pendingStudents.length === 0) {
      return res.json([]);
    }
    
    // Transform the data to make it compatible with the frontend
    const formattedStudents = pendingStudents.map(student => {
      // Create a formatted student object that has the structure expected by the frontend
      const formattedStudent = student.toObject();
      
      // If there's pendingRegistration data, create a "virtual" user object
      if (student.pendingRegistration) {
        formattedStudent.user = {
          firstName: student.pendingRegistration.firstName,
          middleName: student.pendingRegistration.middleName,
          lastName: student.pendingRegistration.lastName,
          nameExtension: student.pendingRegistration.nameExtension,
          idNumber: student.pendingRegistration.idNumber,
          email: student.pendingRegistration.email,
          status: 'pending'
        };
      }
      
      // Use classDetails if class is not assigned but we have the details
      if (!student.class && student.classDetails && student.classDetails.yearLevel) {
        formattedStudent.classInfo = {
          yearLevel: student.classDetails.yearLevel,
          section: student.classDetails.section,
          major: student.classDetails.major || student.major
        };
      }
      
      return formattedStudent;
    });
    
    console.log(`Successfully processed ${formattedStudents.length} pending students`);
    res.json(formattedStudents);
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Temporary debug route for pending students (no authentication)
router.get('/pending-debug', async (req, res) => {
  try {
    console.log('Fetching pending students (debug route)');
    
    // Find all students with pending approval status
    const pendingStudents = await Student.find({ approvalStatus: 'pending' });
    console.log(`Found ${pendingStudents.length} pending students`);
    
    // Show the full data structure to debug
    console.log('Pending students data structure:', JSON.stringify(pendingStudents, null, 2));
    
    // Send a simplified response for debugging
    res.json({
      count: pendingStudents.length,
      students: pendingStudents.map(s => ({
        _id: s._id,
        pendingData: s.pendingRegistration ? true : false,
        class: s.class,
        gender: s.gender,
        major: s.major,
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    console.error('DEBUG - Get pending students error:', error);
    res.status(500).json({ 
      message: 'Server error in debug endpoint', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Completely new test route to diagnose and create test data if needed
router.get('/pending-test', async (req, res) => {
  try {
    console.log('Pending test route accessed');
    
    // First check for ANY pending registrations
    const pendingCount = await Student.countDocuments({ approvalStatus: 'pending' });
    console.log(`Found ${pendingCount} pending students`);
    
    // If no pending students, create a test one
    if (pendingCount === 0) {
      console.log('No pending students found, creating a test pending registration');
      
      const testStudent = new Student({
        pendingRegistration: {
          firstName: 'Test',
          middleName: '',
          lastName: 'Student',
          nameExtension: 'N/A',
          idNumber: 'TEST' + Date.now(),
          email: `test${Date.now()}.au@phinmaed.com`,
          password: 'password123'
        },
        gender: 'Male',
        contactNumber: '09123456789',
        major: 'Business Informatics',
        approvalStatus: 'pending',
        status: 'inactive'
      });
      
      await testStudent.save();
      console.log('Created test pending registration with ID:', testStudent._id);
    }
    
    // Now fetch and return detailed information about all pending registrations
    const pendingStudents = await Student.find({ approvalStatus: 'pending' });
    
    // Return detailed information
    const detailedInfo = pendingStudents.map(student => {
      const studentObj = student.toObject();
      
      return {
        _id: studentObj._id,
        approvalStatus: studentObj.approvalStatus,
        hasPendingData: studentObj.pendingRegistration ? true : false,
        pendingFields: studentObj.pendingRegistration ? Object.keys(studentObj.pendingRegistration) : [],
        hasUser: studentObj.user ? true : false,
        userId: studentObj.user,
        gender: studentObj.gender,
        contactNumber: studentObj.contactNumber,
        major: studentObj.major,
        createdAt: studentObj.createdAt,
        
        // Include a formatted version for frontend testing
        formattedForFrontend: {
          _id: studentObj._id,
          approvalStatus: studentObj.approvalStatus,
          gender: studentObj.gender,
          contactNumber: studentObj.contactNumber,
          major: studentObj.major,
          user: studentObj.pendingRegistration ? {
            firstName: studentObj.pendingRegistration.firstName,
            middleName: studentObj.pendingRegistration.middleName,
            lastName: studentObj.pendingRegistration.lastName,
            nameExtension: studentObj.pendingRegistration.nameExtension,
            idNumber: studentObj.pendingRegistration.idNumber,
            email: studentObj.pendingRegistration.email,
            status: 'pending'
          } : null
        }
      };
    });
    
    res.json({
      message: 'Pending registrations test',
      pendingCount,
      students: detailedInfo
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({
      message: 'Error in test route',
      error: error.message,
      stack: error.stack
    });
  }
});

// Get analytics data
router.get('/analytics/data', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Get total counts
    const totalStudents = await Student.countDocuments({ status: 'active' });
    
    // Get completion rates
    const odysseyCompleted = await Student.countDocuments({ 
      status: 'active',
      odysseyPlanCompleted: true 
    });
    
    const srmCompleted = await Student.countDocuments({ 
      status: 'active',
      srmSurveyCompleted: true 
    });
    
    // Calculate completion percentages
    const odysseyCompletionRate = totalStudents > 0 ? (odysseyCompleted / totalStudents) * 100 : 0;
    const srmCompletionRate = totalStudents > 0 ? (srmCompleted / totalStudents) * 100 : 0;
    
    // Get consultation count
    const consultationCount = await Student.aggregate([
      { $match: { status: 'active' } },
      { $project: { consultationCount: { $size: '$consultations' } } },
      { $group: { _id: null, total: { $sum: '$consultationCount' } } }
    ]);
    
    const totalConsultations = consultationCount.length > 0 ? consultationCount[0].total : 0;
    
    res.json({
      totalStudents,
      odysseyCompletion: {
        completed: odysseyCompleted,
        rate: odysseyCompletionRate
      },
      srmCompletion: {
        completed: srmCompleted,
        rate: srmCompletionRate
      },
      consultations: totalConsultations
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// A simple test route to check if Student model is working correctly
router.get('/test', async (req, res) => {
  try {
    // Get the names of all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(collection => collection.name);
    
    // Check if students collection exists
    const studentCollection = collectionNames.includes('students');
    
    // Check the mongoose model
    const modelInfo = {
      name: Student.modelName,
      collection: Student.collection.name,
      schema: Object.keys(Student.schema.paths)
    };
    
    res.json({
      success: true,
      message: 'Student model test',
      existingCollections: collectionNames,
      studentCollectionExists: studentCollection,
      modelInfo
    });
  } catch (error) {
    console.error('Student model test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error testing Student model',
      error: error.message
    });
  }
});

// Get student by user ID
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find student with this user ID
    const student = await Student.findOne({ user: userId })
      .populate('user', 'firstName middleName lastName nameExtension idNumber email')
      .populate({
        path: 'class',
        populate: {
          path: 'sspSubject',
          select: 'sspCode name sessions'
        }
      });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found for this user' });
    }
    
    // Find adviser information from AdvisoryClass collection
    let adviserInfo = null;
    
    if (student.class) {
      const advisoryClass = await mongoose.model('AdvisoryClass').findOne({ 
        class: student.class._id,
        status: 'active'
      }).populate('adviser', 'firstName middleName lastName nameExtension salutation email contactNumber');
      
      if (advisoryClass && advisoryClass.adviser) {
        adviserInfo = advisoryClass.adviser;
      }
    }
    
    // Add the adviser information to the response
    const studentData = student.toObject();
    studentData.adviserInfo = adviserInfo;
    
    res.json(studentData);
  } catch (error) {
    console.error('Get student by user ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile by user ID
router.put('/user/:userId/profile', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, contactNumber, address } = req.body;
    
    // Find student with this user ID
    const student = await Student.findOne({ user: userId });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found for this user' });
    }
    
    // Verify that the logged-in user is the owner of this profile
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this profile' });
    }
    
    // Update contact information on student record
    if (contactNumber) {
      student.contactNumber = contactNumber;
    }
    
    // Handle address as a structured object with components
    if (address !== undefined) {
      // Ensure each address component is updated if provided
      if (typeof address === 'object') {
        student.address = {
          block: address.block !== undefined ? address.block : (student.address?.block || ''),
          street: address.street !== undefined ? address.street : (student.address?.street || ''),
          barangay: address.barangay !== undefined ? address.barangay : (student.address?.barangay || ''),
          municipality: address.municipality !== undefined ? address.municipality : (student.address?.municipality || ''),
          province: address.province !== undefined ? address.province : (student.address?.province || '')
        };
      } else {
        // If address is not an object, set empty structure
        student.address = {
          block: '',
          street: '',
          barangay: '',
          municipality: '',
          province: ''
        };
      }
    }
    
    await student.save();
    
    // Update user information
    if (firstName || lastName || email) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User record not found' });
      }
      
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) user.email = email;
      
      await user.save();
    }
    
    res.json({ 
      message: 'Profile updated successfully',
      data: {
        student: {
          ...student.toObject(),
          contactNumber: student.contactNumber,
          address: student.address,
          user: {
            firstName: firstName || (student.user && student.user.firstName),
            lastName: lastName || (student.user && student.user.lastName),
            email: email || (student.user && student.user.email)
          }
        }
      }
    });
  } catch (error) {
    console.error('Update student profile by user ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Review student registration (approve/reject)
router.put('/registration/:id/review', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { approvalStatus, approvalNotes } = req.body;
    
    // Validate input
    if (!approvalStatus || !['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }
    
    // Find the student record
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student registration not found' });
    }
    
    if (student.approvalStatus !== 'pending') {
      return res.status(400).json({ message: `Registration has already been ${student.approvalStatus}` });
    }
    
    // Update approval status and notes
    student.approvalStatus = approvalStatus;
    student.approvalNotes = approvalNotes || '';
    
    if (approvalStatus === 'approved') {
      // Create a new user for the student
      const newUser = new User({
        firstName: student.pendingRegistration.firstName,
        middleName: student.pendingRegistration.middleName || '',
        lastName: student.pendingRegistration.lastName,
        nameExtension: student.pendingRegistration.nameExtension || 'N/A',
        idNumber: student.pendingRegistration.idNumber,
        email: student.pendingRegistration.email,
        password: student.pendingRegistration.password, // This will be hashed by the User model
        role: 'student',
        status: 'active',
        passwordChangeRequired: true
      });
      
      await newUser.save();
      
      // Update student record with the new user reference
      student.user = newUser._id;
      student.status = 'active';
      
      // If student doesn't have a class assigned yet, find a matching class
      if (!student.class) {
        // Get details from classDetails
        const { yearLevel, section, major } = student.classDetails || {};
        const studentMajor = major || student.major;
        
        if (yearLevel && section) {
          console.log(`Looking for class with yearLevel: ${yearLevel}, section: ${section}, major: ${studentMajor}`);
          
          // Try to find a matching class
          const matchingClass = await Class.findOne({ 
            yearLevel,
            section,
            major: studentMajor,
            status: 'active'
          });
          
          if (matchingClass) {
            console.log(`Found matching class: ${matchingClass._id}`);
            student.class = matchingClass._id;
            
            // Add student to class's students array
            if (!matchingClass.students.includes(student._id)) {
              matchingClass.students.push(student._id);
              await matchingClass.save();
              console.log(`Added student to class ${matchingClass._id}`);
            }
          } else {
            console.log(`No matching class found for student ${student._id}`);
            
            // Try to find a class with just yearLevel and section
            const alternativeClass = await Class.findOne({
              yearLevel,
              section,
              status: 'active'
            });
            
            if (alternativeClass) {
              console.log(`Found alternative class match: ${alternativeClass._id}`);
              student.class = alternativeClass._id;
              
              if (!alternativeClass.students.includes(student._id)) {
                alternativeClass.students.push(student._id);
                await alternativeClass.save();
                console.log(`Added student to alternative class ${alternativeClass._id}`);
              }
            }
          }
        }
      } else {
        // Student already has a class, ensure they're in the class's students array
        const existingClass = await Class.findById(student.class);
        if (existingClass && !existingClass.students.includes(student._id)) {
          existingClass.students.push(student._id);
          await existingClass.save();
          console.log(`Added student to existing class ${existingClass._id}`);
        }
      }
    }
    
    await student.save();
    
    // Send notification email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      let emailSubject, emailText;
      
      if (approvalStatus === 'approved') {
        emailSubject = 'SSP Management System - Registration Approved';
        emailText = `Dear ${student.pendingRegistration.firstName},
        
Your registration for the SSP Management System has been approved. You can now log in using your email and the password you provided during registration.

Please log in at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}

Thank you,
SSP Management Team`;
      } else {
        emailSubject = 'SSP Management System - Registration Rejected';
        emailText = `Dear ${student.pendingRegistration.firstName},
        
We regret to inform you that your registration for the SSP Management System has been rejected.

${approvalNotes ? `Reason: ${approvalNotes}` : ''}

If you believe this is an error, please contact the SSP Management Team.

Thank you,
SSP Management Team`;
      }
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: student.pendingRegistration.email,
        subject: emailSubject,
        text: emailText
      });
      
      console.log(`Notification email sent to ${student.pendingRegistration.email}`);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // We don't want to fail the request if email fails
    }
    
    res.json({ 
      message: `Registration ${approvalStatus} successfully`,
      student: { 
        id: student._id,
        name: `${student.pendingRegistration.firstName} ${student.pendingRegistration.lastName}`,
        email: student.pendingRegistration.email,
        status: approvalStatus
      }
    });
  } catch (error) {
    console.error('Review registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get individual student by ID (for M&M notifications and other purposes)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user has admin/adviser role or is requesting their own data
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      // If student, check if they're requesting their own data
      const requestingStudent = await Student.findOne({ user: req.user._id });
      if (!requestingStudent || requestingStudent._id.toString() !== id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized to access this student data' 
        });
      }
    }
    
    console.log(`Fetching individual student data for ID: ${id}`);
    
    // Find the student with populated user data
    const student = await Student.findById(id)
      .populate('user', 'firstName middleName lastName nameExtension idNumber email')
      .populate('class', 'yearLevel section major');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }
    
    console.log(`Found student: ${student.user?.firstName} ${student.user?.lastName} (${student.user?.idNumber})`);
    
    // Add class info if available from classDetails
    if (!student.class && student.classDetails && student.classDetails.yearLevel) {
      student._doc.classInfo = {
        yearLevel: student.classDetails.yearLevel,
        section: student.classDetails.section,
        major: student.classDetails.major || student.major
      };
    }
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get individual student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create new student
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { firstName, middleName, lastName, nameExtension, idNumber, email, classId } = req.body;
    
    // Check if class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Generate random password
    const tempPassword = crypto.randomBytes(10).toString('hex');
    
    // Create student user
    const user = new User({
      firstName,
      middleName,
      lastName,
      nameExtension: nameExtension || 'N/A',
      idNumber,
      salutation: 'Student',
      email,
      password: tempPassword,
      role: 'student'
    });
    
    await user.save();
    
    // Create student record
    const student = new Student({
      user: user._id,
      class: classId,
      odysseyPlanCompleted: false,
      srmSurveyCompleted: false,
      status: 'active'
    });
    
    await student.save();
    
    // Add student to class's students array if not already there
    if (!classObj.students.includes(student._id)) {
      classObj.students.push(student._id);
      await classObj.save();
      console.log(`Added student ${student._id} to class ${classId}`);
    }
    
    res.status(201).json({ message: 'Student created successfully' });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { 
      firstName, middleName, lastName, nameExtension, 
      email, idNumber, contactNumber, address,
      gender, major, yearLevel, section, 
      classId, odysseyPlanCompleted, srmSurveyCompleted, status 
    } = req.body;
    
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update student fields
    if (contactNumber) {
      student.contactNumber = contactNumber;
    }
    
    // Handle address as a structured object with components
    if (address !== undefined) {
      // Ensure each address component is updated if provided
      if (typeof address === 'object') {
        student.address = {
          block: address.block !== undefined ? address.block : (student.address?.block || ''),
          street: address.street !== undefined ? address.street : (student.address?.street || ''),
          barangay: address.barangay !== undefined ? address.barangay : (student.address?.barangay || ''),
          municipality: address.municipality !== undefined ? address.municipality : (student.address?.municipality || ''),
          province: address.province !== undefined ? address.province : (student.address?.province || '')
        };
      } else {
        // If address is not an object, set empty structure
        student.address = {
          block: '',
          street: '',
          barangay: '',
          municipality: '',
          province: ''
        };
      }
    }
    
    if (gender) {
      student.gender = gender;
    }
    
    if (major) {
      student.major = major;
    }

    // If class is changing, handle class assignments
    if (classId && classId !== student.class?.toString()) {
      // Check if new class exists
      const newClass = await Class.findById(classId);
      if (!newClass) {
        return res.status(404).json({ message: 'Class not found' });
      }
      
      // Remove from old class if exists
      if (student.class) {
        const oldClass = await Class.findById(student.class);
        if (oldClass) {
          oldClass.students = oldClass.students.filter(
            id => id.toString() !== student._id.toString()
          );
          await oldClass.save();
          console.log(`Removed student ${student._id} from class ${student.class}`);
        }
      }
      
      // Update student's class
      student.class = classId;
      
      // Add to new class
      if (!newClass.students.includes(student._id)) {
        newClass.students.push(student._id);
        await newClass.save();
        console.log(`Added student ${student._id} to class ${classId}`);
      }
    }
    
    if (odysseyPlanCompleted !== undefined) student.odysseyPlanCompleted = odysseyPlanCompleted;
    if (srmSurveyCompleted !== undefined) student.srmSurveyCompleted = srmSurveyCompleted;
    
    if (status) {
      if (!['active', 'inactive', 'suspended', 'graduated'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      student.status = status;
      
      // Update user status as well
      await User.findByIdAndUpdate(student.user, { status });
    }
    
    student.updatedAt = Date.now();
    await student.save();
    
    // Update user information if provided
    if (firstName || lastName || middleName || nameExtension || email || idNumber) {
      const user = await User.findById(student.user);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (firstName) user.firstName = firstName;
      if (middleName) user.middleName = middleName;
      if (lastName) user.lastName = lastName;
      if (nameExtension) user.nameExtension = nameExtension;
      if (email) user.email = email;
      if (idNumber) user.idNumber = idNumber;
      
      await user.save();
    }
    
    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete student
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Instead of deleting, mark as archived
    student.status = 'archived';
    student.updatedAt = Date.now();
    await student.save();
    
    // Update user status as well
    await User.findByIdAndUpdate(student.user, { status: 'archived' });
    
    res.json({ message: 'Student archived successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add consultation record
router.post('/:id/consultations', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { notes, date } = req.body;
    
    if (!notes || !date) {
      return res.status(400).json({ message: 'Notes and date are required' });
    }
    
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Add consultation
    student.consultations.push({
      notes,
      date,
      adviser: req.user._id
    });
    
    student.updatedAt = Date.now();
    await student.save();
    
    res.status(201).json({ message: 'Consultation added successfully' });
  } catch (error) {
    console.error('Add consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Force create a test student for debugging
router.get('/force-create-test', async (req, res) => {
  try {
    console.log('Creating a test student with proper validation bypass');
    
    // Create a test student with all required fields
    const testStudent = new Student({
      pendingRegistration: {
        firstName: 'Force Test',
        middleName: '',
        lastName: 'Student',
        nameExtension: 'N/A',
        idNumber: 'FORCE' + Date.now(),
        email: `forcetest${Date.now()}.au@phinmaed.com`,
        password: 'password123'
      },
      classDetails: {
        yearLevel: '3',
        section: 'South-2',
        major: 'Business Informatics'
      },
      gender: 'Male',
      contactNumber: '09123456789',
      major: 'Business Informatics',
      approvalStatus: 'pending',
      status: 'inactive'
    });
    
    // Save while bypassing validation
    await testStudent.save();
    
    console.log('Successfully created test student with ID:', testStudent._id);
    
    res.json({ 
      success: true,
      message: 'Test student created successfully',
      student: {
        _id: testStudent._id,
        name: `${testStudent.pendingRegistration.firstName} ${testStudent.pendingRegistration.lastName}`,
        email: testStudent.pendingRegistration.email,
        idNumber: testStudent.pendingRegistration.idNumber,
        createdAt: testStudent.createdAt,
        classDetails: testStudent.classDetails
      }
    });
  } catch (error) {
    console.error('Force create student error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating test student',
      error: error.message,
      stack: error.stack
    });
  }
});

// AUTO-ASSIGN STUDENTS TO APPROPRIATE CLASSES
router.post('/assign-classes', async (req, res) => {
  try {
    console.log('Assign classes request received:', req.body);
    const forceReassign = req.body.forceReassign === true;
    console.log('Force reassign mode:', forceReassign);
    
    // Query to find students:
    // If forceReassign is true - get all active students
    // If forceReassign is false - get only unassigned students
    const query = forceReassign 
      ? { active: true } 
      : { 
          $or: [
            { class: { $exists: false } },
            { class: null },
            { class: "" }
          ],
          active: true
        };
    
    console.log('Using query to find students:', JSON.stringify(query));
    const students = await Student.find(query);
    console.log(`Found ${students.length} students to process`);
    
    // Find all active classes
    const classes = await Class.find({ active: true });
    console.log(`Found ${classes.length} active classes`);
    
    // Log class details for debugging
    classes.forEach(classObj => {
      console.log(`Class: ${classObj._id}, YL: ${classObj.yearLevel}, Sec: ${classObj.section}, Major: ${classObj.major || 'none'}`);
    });
    
    let assignedCount = 0;
    let failedCount = 0;
    const assignmentErrors = [];
    
    // Process each student
    for (const student of students) {
      try {
        console.log(`Processing student: ${student._id} (${student.lastName}, ${student.firstName})`);
        console.log(`Student details - YL: ${student.yearLevel}, Major: ${student.major || 'none'}, Class details:`, student.classDetails);
        
        // Find a matching class for this student
        let matchingClass = null;
        
        // Try to find an exact match first (year, section, and major)
        if (student.classDetails && student.classDetails.yearLevel && student.classDetails.section) {
          const yearLevel = student.classDetails.yearLevel;
          const section = student.classDetails.section;
          const major = student.major || "";
          
          matchingClass = classes.find(c => 
            c.yearLevel === yearLevel && 
            c.section === section && 
            (c.major || "") === major
          );
          
          if (matchingClass) {
            console.log(`Found exact class match: ${matchingClass._id} (${matchingClass.yearLevel}-${matchingClass.section})`);
          } else {
            // If no exact match with major, try without considering major
            matchingClass = classes.find(c => 
              c.yearLevel === yearLevel && 
              c.section === section
            );
            
            if (matchingClass) {
              console.log(`Found partial class match (ignoring major): ${matchingClass._id} (${matchingClass.yearLevel}-${matchingClass.section})`);
            }
          }
        }
        
        // If still no match, fall back to year level only
        if (!matchingClass && student.yearLevel) {
          console.log(`Falling back to year level only match for student ${student._id}`);
          matchingClass = classes.find(c => c.yearLevel === student.yearLevel);
          
          if (matchingClass) {
            console.log(`Found year level only match: ${matchingClass._id} (${matchingClass.yearLevel}-${matchingClass.section})`);
          }
        }
        
        if (matchingClass) {
          // Assign the class to the student
          student.class = matchingClass._id;
          await student.save();
          assignedCount++;
          console.log(`✅ Assigned student ${student._id} to class ${matchingClass._id}`);
        } else {
          failedCount++;
          const errorMsg = `No matching class found for student ${student._id} (${student.lastName}, ${student.firstName})`;
          console.error(errorMsg);
          assignmentErrors.push(errorMsg);
        }
      } catch (studentError) {
        failedCount++;
        console.error(`Error processing student ${student._id}:`, studentError);
        assignmentErrors.push(`Error with student ${student._id}: ${studentError.message}`);
      }
    }
    
    console.log(`Assignment complete. Assigned: ${assignedCount}, Failed: ${failedCount}`);
    return res.json({
      success: true,
      message: `Successfully assigned ${assignedCount} students to classes (${failedCount} failed)`,
      assigned: assignedCount,
      failed: failedCount,
      errors: assignmentErrors
    });
  } catch (error) {
    console.error('Error in assign-classes route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign students to classes: ' + error.message
    });
  }
});

// Get students by class ID
router.get('/by-class/:classId', authenticate, async (req, res) => {
  try {
    const { classId } = req.params;
    console.log(`Fetching students for class: ${classId}`);
    
    // Validate class ID
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: 'Invalid class ID format' });
    }
    
    // First check if the class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    console.log(`Class found: ${classItem.yearLevel} Year - ${classItem.section} (${classItem.major})`);
    
    // Get students directly assigned to this class
    const studentsFromClassRef = await Student.find({
      class: classId,
      status: 'active'
    }).populate('user', 'firstName middleName lastName nameExtension idNumber email');
    
    console.log(`Found ${studentsFromClassRef.length} students with direct class reference`);
    
    // Also look for students with matching classDetails but no class reference
    // This helps find students who should be in this class but don't have the proper reference
    const studentsFromClassDetails = await Student.find({
      class: { $exists: false },
      'classDetails.yearLevel': classItem.yearLevel,
      'classDetails.section': classItem.section,
      'classDetails.major': classItem.major,
      status: 'active'
    }).populate('user', 'firstName middleName lastName nameExtension idNumber email');
    
    console.log(`Found ${studentsFromClassDetails.length} additional students via classDetails match`);
    
    // Combine the results
    const allStudents = [...studentsFromClassRef];
    
    // For students found by classDetails, assign them to this class too
    for (const student of studentsFromClassDetails) {
      console.log(`Assigning student ${student._id} to class ${classId} based on matching details`);
      student.class = classId;
      await student.save();
      
      // Add to class students array if not already there
      if (!classItem.students.includes(student._id)) {
        classItem.students.push(student._id);
      }
      
      allStudents.push(student);
    }
    
    // Save class if we've updated its students array
    if (studentsFromClassDetails.length > 0) {
      await classItem.save();
      console.log(`Updated class ${classId} with ${studentsFromClassDetails.length} new students`);
    }
    
    console.log(`Returning total of ${allStudents.length} students for class ${classId}`);
    res.json(allStudents);
  } catch (error) {
    console.error('Get students by class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign a student to a class manually
router.post('/:id/assign-class', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { classId } = req.body;
    
    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }
    
    // Find student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find class
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Remove student from previous class if any
    if (student.class) {
      const oldClass = await Class.findById(student.class);
      if (oldClass) {
        // Remove student from old class's students array
        oldClass.students = oldClass.students.filter(
          studentId => studentId.toString() !== student._id.toString()
        );
        await oldClass.save();
        console.log(`Removed student ${student._id} from class ${oldClass._id}`);
      }
    }
    
    // Update student's class
    student.class = classId;
    
    // Update class details on student for reference
    student.classDetails = {
      yearLevel: classObj.yearLevel,
      section: classObj.section,
      major: classObj.major
    };
    
    await student.save();
    
    // Add student to new class's students array if not already there
    if (!classObj.students.includes(student._id)) {
      classObj.students.push(student._id);
      await classObj.save();
      console.log(`Added student ${student._id} to class ${classObj._id}`);
    }
    
    res.json({ 
      success: true, 
      message: 'Student assigned to class successfully',
      student: {
        id: student._id,
        name: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
        class: {
          id: classObj._id,
          name: `${classObj.yearLevel} Year - ${classObj.section} (${classObj.major})`
        }
      }
    });
  } catch (error) {
    console.error('Assign student to class error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fix student year level format - This is no longer needed as we ensure correct format at registration
router.put('/:id/fix-yearLevel', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { yearLevel, currentYearLevel } = req.body;
    
    if (!yearLevel) {
      return res.status(400).json({ message: 'New year level is required' });
    }
    
    // Find the student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    console.log(`Fixing year level for student ${id} from ${currentYearLevel || 'unknown'} to ${yearLevel}`);
    
    // Update the classDetails.yearLevel field
    if (!student.classDetails) {
      student.classDetails = {
        yearLevel,
        section: student.classDetails?.section || '',
        major: student.classDetails?.major || student.major || ''
      };
    } else {
      student.classDetails.yearLevel = yearLevel;
    }
    
    // Save the student
    await student.save();
    console.log(`Student ${id} year level updated to ${yearLevel}`);
    
    // Try to find a class with the updated year level format
    if (student.classDetails.section) {
      console.log(`Looking for class with yearLevel=${yearLevel}, section=${student.classDetails.section}`);
      
      const matchingClass = await Class.findOne({
        yearLevel,
        section: student.classDetails.section,
        status: 'active'
      });
      
      if (matchingClass) {
        console.log(`Found matching class ${matchingClass._id}, updating student's class reference`);
        
        // Update the student's class reference
        student.class = matchingClass._id;
        await student.save();
        
        // Add student to class's students array if not already there
        if (!matchingClass.students.includes(student._id)) {
          matchingClass.students.push(student._id);
          await matchingClass.save();
          console.log(`Added student ${id} to class ${matchingClass._id}`);
        }
      } else {
        console.log(`No matching class found for student ${id} with ${yearLevel} Year - ${student.classDetails.section}`);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Student year level format updated successfully',
      student: {
        id: student._id,
        yearLevel,
        previousYearLevel: currentYearLevel || 'unknown'
      }
    });
  } catch (error) {
    console.error('Fix year level error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fixing year level format', 
      error: error.message 
    });
  }
});

// Update student profile information
router.put('/:id/profile', authenticate, async (req, res) => {
  try {
    const studentId = req.params.id;
    const { firstName, lastName, email, contactNumber, address } = req.body;
    
    // Find the student record
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Verify that the logged-in user owns this student record
    if (student.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this profile' });
    }
    
    // Update contact information on student record
    if (contactNumber) {
      student.contactNumber = contactNumber;
    }
    
    // Handle address as a structured object with components
    if (address !== undefined) {
      // Ensure each address component is updated if provided
      if (typeof address === 'object') {
        student.address = {
          block: address.block !== undefined ? address.block : (student.address?.block || ''),
          street: address.street !== undefined ? address.street : (student.address?.street || ''),
          barangay: address.barangay !== undefined ? address.barangay : (student.address?.barangay || ''),
          municipality: address.municipality !== undefined ? address.municipality : (student.address?.municipality || ''),
          province: address.province !== undefined ? address.province : (student.address?.province || '')
        };
      } else {
        // If address is not an object, set empty structure
        student.address = {
          block: '',
          street: '',
          barangay: '',
          municipality: '',
          province: ''
        };
      }
    }
    
    await student.save();
    
    // Update user information
    if (firstName || lastName || email) {
      const user = await User.findById(student.user);
      if (!user) {
        return res.status(404).json({ message: 'User record not found' });
      }
      
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (email) user.email = email;
      
      await user.save();
    }
    
    res.json({ 
      message: 'Profile updated successfully',
      student: {
        ...student.toObject(),
        user: {
          firstName: firstName || student.user.firstName,
          lastName: lastName || student.user.lastName,
          email: email || student.user.email
        }
      }
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student details
router.get('/details', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find student by user ID
    const student = await Student.findOne({ user: userId })
      .populate('user', 'firstName lastName email idNumber')
      .populate({
        path: 'class',
        populate: {
          path: 'sspSubject',
          select: 'sspCode yearLevel hours schoolYear semester'
        }
      });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Log detailed information for debugging
    console.log(`Student details found for user ${userId}:`);
    console.log(`- Student ID: ${student._id}`);
    console.log(`- Class assigned: ${student.class ? student.class._id : 'None'}`);
    
    if (student.class) {
      console.log(`- Class yearLevel: ${student.class.yearLevel}`);
      console.log(`- Class section: ${student.class.section}`);
      console.log(`- SSP Subject: ${student.class.sspSubject ? student.class.sspSubject._id : 'None'}`);
      
      if (student.class.sspSubject) {
        console.log(`- Subject semester: ${student.class.sspSubject.semester}`);
      }
    } else {
      console.warn(`Student ${student._id} has no class assigned`);
    }
    
    // Set default classDetails if missing but class is assigned
    if (student.class && (!student.classDetails || !student.classDetails.yearLevel)) {
      student.classDetails = {
        yearLevel: student.class.yearLevel || '',
        section: student.class.section || '',
        major: student.major || ''
      };
      await student.save();
      console.log(`Updated missing classDetails for student ${student._id}`);
    }
    
    // Try to update class assignment if missing but classDetails exists
    if (!student.class && student.classDetails && student.classDetails.yearLevel && student.classDetails.section) {
      console.log(`Attempting to find matching class for student ${student._id} with yearLevel: ${student.classDetails.yearLevel}, section: ${student.classDetails.section}`);
      
      const matchingClass = await Class.findOne({
        yearLevel: student.classDetails.yearLevel,
        section: student.classDetails.section,
        status: 'active'
      });
      
      if (matchingClass) {
        student.class = matchingClass._id;
        await student.save();
        console.log(`Auto-assigned class ${matchingClass._id} to student ${student._id}`);
      }
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error getting student details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fix invalid class references
router.post('/fix-class-references', async (req, res) => {
  try {
    console.log('Starting fix for invalid class references');
    
    // Get all students
    const allStudents = await Student.find({}).lean();
    console.log(`Found ${allStudents.length} total students to check`);
    
    // Get all valid classes
    const allClasses = await Class.find({}).lean();
    const validClassIds = allClasses.map(c => c._id.toString());
    console.log(`Found ${allClasses.length} valid classes for reference`);
    
    let fixedCount = 0;
    let noIssueCount = 0;
    let errorCount = 0;
    
    // Process each student
    for (const student of allStudents) {
      try {
        // Check if the student has a class reference
        if (student.class) {
          const studentId = student._id;
          const classId = student.class.toString();
          
          // Check if the class reference is valid
          if (!validClassIds.includes(classId)) {
            console.log(`Found invalid class reference for student ${studentId}: ${classId}`);
            
            // Update the student to remove the invalid class reference
            const updatedStudent = await Student.findByIdAndUpdate(
              studentId,
              { 
                $unset: { class: 1 },
                status: 'active'  // Ensure student is marked as active for reassignment
              },
              { new: true }
            );
            
            console.log(`Fixed invalid class reference for student ${studentId}`);
            fixedCount++;
          } else {
            // Valid class reference
            noIssueCount++;
          }
        } else {
          // No class reference, nothing to fix
          noIssueCount++;
        }
      } catch (studentError) {
        console.error(`Error processing student ${student._id}:`, studentError);
        errorCount++;
      }
    }
    
    console.log(`Fix complete: ${fixedCount} students fixed, ${noIssueCount} had no issues, ${errorCount} errors`);
    
    // Return the results
    return res.json({
      success: true,
      message: `Fixed invalid class references for ${fixedCount} students`,
      results: {
        fixed: fixedCount,
        noIssue: noIssueCount,
        errors: errorCount
      }
    });
  } catch (error) {
    console.error('Error fixing class references:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fixing class references: ' + error.message
    });
  }
});

// Student registration with PSGC address format
router.post('/register', async (req, res) => {
  try {
    const { 
      firstName, middleName, lastName, nameExtension, 
      idNumber, email, gender, contactNumber, 
      address, // This can now be an object with components including region
      yearLevel, section, password, major 
    } = req.body;
    
    console.log('Processing student registration for:', email);
    console.log('Class information:', { yearLevel, section, major });
    
    // Validate email domain
    if (!email.endsWith('@phinmaed.com')) {
      return res.status(400).json({ message: 'Email must be from phinmaed.com domain' });
    }
    
    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }
    
    // Check if ID number already exists in User collection
    const existingIdUser = await User.findOne({ idNumber });
    if (existingIdUser) {
      return res.status(400).json({ message: 'A student with this ID number already exists' });
    }
    
    // Also check if this email/ID is already in pending registrations
    const existingPending = await Student.findOne({ 
      $or: [
        { 'pendingRegistration.email': email },
        { 'pendingRegistration.idNumber': idNumber }
      ],
      approvalStatus: 'pending'
    });
    
    if (existingPending) {
      return res.status(400).json({ message: 'A registration with this email or ID is already pending approval' });
    }
    
    // Ensure yearLevel is in the proper ordinal format for class matching (2nd, 3rd, 4th)
    let formattedYearLevel = yearLevel;
    
    // If it's just a number, convert to ordinal format
    if (/^[0-9]+$/.test(yearLevel)) {
      if (yearLevel === '2') {
        formattedYearLevel = '2nd';
      } else if (yearLevel === '3') {
        formattedYearLevel = '3rd';
      } else if (yearLevel === '4') {
        formattedYearLevel = '4th';
      }
      console.log(`Converted numeric year level "${yearLevel}" to ordinal format "${formattedYearLevel}"`);
    }
    
    // Try to find an appropriate class based on year level and section
    let classObj = null;
    try {
      // Use the formatted year level for class matching
      const classFilter = {
        yearLevel: formattedYearLevel,
        section,
        status: 'active'
      };
      
      if (major) {
        classFilter.major = major;
      }
      
      classObj = await Class.findOne(classFilter);
      
      if (classObj) {
        console.log('Found matching class:', classObj._id);
      } else {
        console.warn(`No matching class found for year level ${formattedYearLevel}, section ${section}, and major ${major}. Creating student without class assignment.`);
        
        // Try to find alternative match with just yearLevel and section
        const alternativeClass = await Class.findOne({
          yearLevel: formattedYearLevel,
          section,
          status: 'active'
        });
        
        if (alternativeClass) {
          console.log('Found alternative class match:', alternativeClass._id);
          classObj = alternativeClass;
        }
      }
    } catch (classError) {
      console.error('Error finding class:', classError);
    }
    
    // Create student record with pending approval status
    const student = new Student({
      pendingRegistration: {
        firstName,
        middleName: middleName || '',
        lastName,
        nameExtension: nameExtension || '',
        idNumber,
        email,
        password, // This will be hashed when creating the actual user
      },
      class: classObj ? classObj._id : null,
      classDetails: {
        yearLevel: formattedYearLevel,
        section,
        major: major || 'Business Informatics'
      },
      gender,
      contactNumber,
      address: {
        block: address?.block || '',
        street: address?.street || '',
        barangay: address?.barangay || '',
        municipality: address?.municipality || '',
        province: address?.province || '',
        region: address?.region || '' // Added region field from PSGC
      },
      major: major || 'Business Informatics',
      odysseyPlanCompleted: false,
      srmSurveyCompleted: false,
      approvalStatus: 'pending',
      status: 'inactive'
    });
    
    await student.save();
    console.log('Student pending registration created with ID:', student._id);
    
    res.status(201).json({ 
      message: 'Registration successful. Your account is pending admin approval. You will be notified via email when approved.'
    });
    
  } catch (error) {
    console.error('Student registration error:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

// Promote student to next year level
router.post('/promote-year', authenticate, async (req, res) => {
  try {
    const { studentId, currentClassId, nextClassId, currentYearLevel, nextYearLevel, currentSemester, currentMajor } = req.body;
    
    // Validate required fields
    if (!studentId || !currentClassId || !nextClassId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: studentId, currentClassId, and nextClassId are required' 
      });
    }
    
    // Log the current semester info
    console.log(`Promoting student ${studentId} from ${currentYearLevel} to ${nextYearLevel}, semester: ${currentSemester || 'Not specified'}`);
    
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }
    
    // Find and validate the current class
    const currentClass = await Class.findById(currentClassId);
    if (!currentClass) {
      return res.status(404).json({ 
        success: false, 
        message: 'Current class not found' 
      });
    }
    
    // Find and validate the next class
    const nextClass = await Class.findById(nextClassId);
    if (!nextClass) {
      return res.status(404).json({ 
        success: false, 
        message: 'Next class not found' 
      });
    }
    
    console.log(`PROMOTION: Current class: ${currentClass.yearLevel} - ${currentClass.section} (${currentClass.major})`);
    console.log(`PROMOTION: Next class: ${nextClass.yearLevel} - ${nextClass.section} (${nextClass.major})`);
    
    // Remove student from current class
    if (currentClass.students.includes(studentId)) {
      currentClass.students = currentClass.students.filter(
        sid => sid.toString() !== studentId
      );
      await currentClass.save();
      console.log(`PROMOTION: Removed student ${studentId} from current class ${currentClassId}`);
    }
    
    // Add student to next class (if not already there)
    if (!nextClass.students.includes(studentId)) {
      nextClass.students.push(studentId);
      await nextClass.save();
      console.log(`PROMOTION: Added student ${studentId} to next class ${nextClassId}`);
    }
    
    // Update student's class and year level
    student.class = nextClassId;
    
    // Set year level if available
    if (nextYearLevel) {
      student.yearLevel = nextYearLevel;
    }
    
    // Update class details on student record
    student.classDetails = {
      yearLevel: nextClass.yearLevel,
      section: nextClass.section,
      major: nextClass.major || currentMajor
    };
    
    // Add a flag if student is promoted to 4th year to enable 4th year Odyssey Plan
    const isPromotingTo4thYear = nextYearLevel && nextYearLevel.includes('4');
    if (isPromotingTo4thYear) {
      student.canAccess4thYearOdysseyPlan = true;
    }
    
    // Reset odyssey plan status for the new class
    student.odysseyPlanCompleted = false;
    
    // Save the student's previous class for reference (to help with student transfer)
    if (!student.classHistory) {
      student.classHistory = [];
    }
    
    // Add the current class to the history with relevant information
    student.classHistory.push({
      classId: currentClassId,
      yearLevel: currentYearLevel,
      endDate: new Date(),
      reason: 'Promotion',
      semester: currentSemester || '1st Semester',
      major: currentMajor
    });
    
    await student.save();
    
    console.log(`PROMOTION: Successfully promoted student ${studentId} from ${currentYearLevel} to ${nextYearLevel}`);
    
    // Return success response
    res.json({
      success: true,
      message: `Student promoted to ${nextYearLevel || 'next year'}`,
      student: {
        id: student._id,
        yearLevel: student.yearLevel,
        class: student.class,
        classDetails: student.classDetails,
        canAccess4thYearOdysseyPlan: student.canAccess4thYearOdysseyPlan || false,
        previousClass: currentClassId,
        promotedFrom: {
          yearLevel: currentYearLevel,
          semester: currentSemester || '1st Semester',
          major: currentMajor
        }
      }
    });
  } catch (error) {
    console.error('Error promoting student to next year:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error promoting student' 
    });
  }
});

// NEW ROUTE: Bulk promote students to next year with school year auto-increment
router.post('/bulk-promote-year', authenticate, async (req, res) => {
  try {
    const { currentClassId, nextClassId, studentIds } = req.body;
    
    // Validate required fields
    if (!currentClassId || !nextClassId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: currentClassId, nextClassId, and studentIds are required' 
      });
    }
    
    console.log(`Bulk promoting ${studentIds.length} students from class ${currentClassId} to class ${nextClassId}`);
    
    // Find and validate the current class
    const currentClass = await Class.findById(currentClassId);
    if (!currentClass) {
      return res.status(404).json({ 
        success: false, 
        message: 'Current class not found' 
      });
    }
    
    // Find and validate the next class
    const nextClass = await Class.findById(nextClassId);
    if (!nextClass) {
      return res.status(404).json({ 
        success: false, 
        message: 'Next class not found' 
      });
    }
    
    console.log(`BULK PROMOTION: Current class: ${currentClass.yearLevel} - ${currentClass.section} (${currentClass.major}) - School Year: ${currentClass.schoolYear}`);
    console.log(`BULK PROMOTION: Next class: ${nextClass.yearLevel} - ${nextClass.section} (${nextClass.major}) - School Year: ${nextClass.schoolYear}`);
    
    // Auto-increment school year for BOTH current and next class after promotion
    const currentSchoolYear = currentClass.schoolYear;
    const nextSchoolYear = nextClass.schoolYear;
    const incrementedSchoolYear = incrementSchoolYear(currentSchoolYear);
    const incrementedNextSchoolYear = incrementSchoolYear(nextSchoolYear);
    
    console.log(`SCHOOL YEAR AUTO-INCREMENT (Current Class): ${currentSchoolYear} -> ${incrementedSchoolYear}`);
    console.log(`SCHOOL YEAR AUTO-INCREMENT (Next Class): ${nextSchoolYear} -> ${incrementedNextSchoolYear}`);
    console.log(`BULK PROMOTION: Current class before school year update:`, {
      id: currentClass._id,
      yearLevel: currentClass.yearLevel,
      section: currentClass.section,
      schoolYear: currentClass.schoolYear
    });
    console.log(`BULK PROMOTION: Next class before school year update:`, {
      id: nextClass._id,
      yearLevel: nextClass.yearLevel,
      section: nextClass.section,
      schoolYear: nextClass.schoolYear
    });
    
    // Archive sessions for all students being promoted with current school year
    // This will be done by the session service - we'll call it from the frontend
    
    const promotedStudents = [];
    const errors = [];
    
    // Process each student
    for (const studentId of studentIds) {
      try {
        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }
        
        // Remove student from current class
        if (currentClass.students.includes(studentId)) {
          currentClass.students = currentClass.students.filter(
            sid => sid.toString() !== studentId
          );
        }
        
        // Add student to next class (if not already there)
        if (!nextClass.students.includes(studentId)) {
          nextClass.students.push(studentId);
        }
        
        // Update student's class and year level
        student.class = nextClassId;
        student.yearLevel = nextClass.yearLevel;
        
        // Update class details on student record
        student.classDetails = {
          yearLevel: nextClass.yearLevel,
          section: nextClass.section,
          major: nextClass.major
        };
        
        // Add a flag if student is promoted to 4th year to enable 4th year Odyssey Plan
        const isPromotingTo4thYear = nextClass.yearLevel && nextClass.yearLevel.includes('4');
        if (isPromotingTo4thYear) {
          student.canAccess4thYearOdysseyPlan = true;
        }
        
        // Reset odyssey plan status for the new class
        student.odysseyPlanCompleted = false;
        
        // Save the student's previous class for reference
        if (!student.classHistory) {
          student.classHistory = [];
        }
        
        // Add the current class to the history with relevant information including school year
        student.classHistory.push({
          classId: currentClassId,
          yearLevel: currentClass.yearLevel,
          schoolYear: currentSchoolYear,
          endDate: new Date(),
          reason: 'Bulk Promotion to Next Year',
          semester: '2nd Semester', // Students are being promoted after completing 2nd semester
          major: currentClass.major
        });
        
        await student.save();
        
        promotedStudents.push({
          id: student._id,
          name: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
          previousYearLevel: currentClass.yearLevel,
          newYearLevel: nextClass.yearLevel,
          schoolYear: currentSchoolYear
        });
        
        console.log(`BULK PROMOTION: Successfully promoted student ${studentId} from ${currentClass.yearLevel} to ${nextClass.yearLevel}`);
        
      } catch (error) {
        console.error(`Error promoting student ${studentId}:`, error);
        errors.push({ studentId, error: error.message });
      }
    }
    
    // Save class changes
    await currentClass.save();
    await nextClass.save();
    
    // Update school year for BOTH current and next class after promotion
    // Reload the classes to ensure we have the latest versions
    const updatedCurrentClass = await Class.findById(currentClassId);
    const updatedNextClass = await Class.findById(nextClassId);
    
    // Update current class school year
    if (updatedCurrentClass) {
      updatedCurrentClass.schoolYear = incrementedSchoolYear;
      await updatedCurrentClass.save();
      console.log(`BULK PROMOTION: Updated current class school year to ${incrementedSchoolYear}`);
      console.log(`BULK PROMOTION: Current class after school year update:`, {
        id: updatedCurrentClass._id,
        yearLevel: updatedCurrentClass.yearLevel,
        section: updatedCurrentClass.section,
        schoolYear: updatedCurrentClass.schoolYear
      });
    } else {
      console.error(`BULK PROMOTION: Could not find current class ${currentClassId} to update school year`);
    }
    
    // Update next class school year  
    if (updatedNextClass) {
      updatedNextClass.schoolYear = incrementedNextSchoolYear;
      await updatedNextClass.save();
      console.log(`BULK PROMOTION: Updated next class school year to ${incrementedNextSchoolYear}`);
      console.log(`BULK PROMOTION: Next class after school year update:`, {
        id: updatedNextClass._id,
        yearLevel: updatedNextClass.yearLevel,
        section: updatedNextClass.section,
        schoolYear: updatedNextClass.schoolYear
      });
    } else {
      console.error(`BULK PROMOTION: Could not find next class ${nextClassId} to update school year`);
    }
    
    // Return success response
    res.json({
      success: true,
      message: `Bulk promotion completed. ${promotedStudents.length} students promoted successfully.`,
      promotedStudents,
      errors,
      schoolYearUpdated: {
        currentClass: {
          classId: currentClassId,
          previousSchoolYear: currentSchoolYear,
          newSchoolYear: incrementedSchoolYear
        },
        nextClass: {
          classId: nextClassId,
          previousSchoolYear: nextSchoolYear,
          newSchoolYear: incrementedNextSchoolYear
        }
      },
      promotionDetails: {
        fromClass: {
          id: currentClassId,
          yearLevel: currentClass.yearLevel,
          section: currentClass.section,
          schoolYear: currentSchoolYear
        },
        toClass: {
          id: nextClassId,
          yearLevel: nextClass.yearLevel,
          section: nextClass.section,
          schoolYear: nextClass.schoolYear
        }
      }
    });
  } catch (error) {
    console.error('Error bulk promoting students to next year:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error bulk promoting students' 
    });
  }
});

// Helper function to increment school year
function incrementSchoolYear(schoolYear) {
  try {
    // Handle formats like "2025-2026" or "2025 - 2026"
    const yearMatch = schoolYear.match(/(\d{4})/g);
    if (yearMatch && yearMatch.length >= 1) {
      const startYear = parseInt(yearMatch[0]);
      const newStartYear = startYear + 1;
      const newEndYear = newStartYear + 1;
      
      // Maintain the same format as the original
      if (schoolYear.includes(' - ')) {
        return `${newStartYear} - ${newEndYear}`;
      } else {
        return `${newStartYear}-${newEndYear}`;
      }
    }
    
    // Fallback: if format is not recognized, just increment the first year found
    return schoolYear.replace(/(\d{4})/, (match) => {
      return (parseInt(match) + 1).toString();
    });
  } catch (error) {
    console.error('Error incrementing school year:', error);
    // Fallback to next year
    const currentYear = new Date().getFullYear();
    return `${currentYear + 1}-${currentYear + 2}`;
  }
}

// AUTO-ASSIGN SELECTED STUDENTS TO APPROPRIATE CLASSES
router.post('/assign-selected-classes', authenticate, authorizeAdmin, async (req, res) => {
  try {
    console.log('Assign selected students request received:', req.body);
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No student IDs provided'
      });
    }
    
    console.log(`Processing ${studentIds.length} selected students for class assignment`);
    
    // Find the selected students
    const students = await Student.find({
      _id: { $in: studentIds },
      status: 'active'
    });
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active students found with the provided IDs'
      });
    }
    
    console.log(`Found ${students.length} active students out of ${studentIds.length} requested IDs`);
    
    // Find all active classes
    const classes = await Class.find({ status: 'active' });
    console.log(`Found ${classes.length} active classes`);
    
    // Log class details for debugging
    classes.forEach(classObj => {
      console.log(`Class: ${classObj._id}, YL: ${classObj.yearLevel}, Sec: ${classObj.section}, Major: ${classObj.major || 'none'}`);
    });
    
    let assignedCount = 0;
    let failedCount = 0;
    const assignmentErrors = [];
    
    // Process each student
    for (const student of students) {
      try {
        console.log(`Processing student ${student._id} (${student.user?.firstName || ''} ${student.user?.lastName || ''})`);
        
        // Determine the student's year level and section
        let yearLevel = student.yearLevel;
        let section = student.section;
        let major = student.major;
        
        // Try to get from classDetails if direct properties are not available
        if (!yearLevel && student.classDetails) yearLevel = student.classDetails.yearLevel;
        if (!section && student.classDetails) section = student.classDetails.section;
        if (!major && student.classDetails) major = student.classDetails.major;
        
        console.log(`Student details - YL: ${yearLevel}, Sec: ${section}, Major: ${major}`);
        
        if (!yearLevel || !section) {
          failedCount++;
          const errorMsg = `Student ${student._id} has no year level or section information`;
          console.error(errorMsg);
          assignmentErrors.push(errorMsg);
          continue;
        }
        
        // Find a matching class
        let matchingClass = null;
        
        // First try exact match on yearLevel and section
        matchingClass = classes.find(c => 
          c.yearLevel === yearLevel && 
          c.section === section
        );
        
        if (!matchingClass) {
          // Try a more flexible match for the year level
          // This helps with variations like "2" vs "2nd" vs "2nd Year"
          const yearLevelNumber = yearLevel.replace(/[^0-9]/g, '');
          if (yearLevelNumber) {
            matchingClass = classes.find(c => {
              const classYearLevel = c.yearLevel.replace(/[^0-9]/g, '');
              return classYearLevel === yearLevelNumber && c.section === section;
            });
          }
        }
        
        if (matchingClass) {
          // Remove student from previous class if any
          if (student.class && student.class.toString() !== matchingClass._id.toString()) {
            const oldClass = await Class.findById(student.class);
            if (oldClass) {
              // Remove student from old class's students array
              oldClass.students = oldClass.students.filter(
                id => id.toString() !== student._id.toString()
              );
              await oldClass.save();
              console.log(`Removed student ${student._id} from class ${student.class}`);
            }
          }
          
          // Assign the class to the student
          student.class = matchingClass._id;
          
          // Update class details on student for reference
          student.classDetails = {
            yearLevel: matchingClass.yearLevel,
            section: matchingClass.section,
            major: matchingClass.major || student.major
          };
          
          await student.save();
          
          // Add student to new class's students array if not already there
          if (!matchingClass.students.includes(student._id)) {
            matchingClass.students.push(student._id);
            await matchingClass.save();
          }
          
          assignedCount++;
          console.log(`✅ Assigned student ${student._id} to class ${matchingClass._id}`);
        } else {
          failedCount++;
          const errorMsg = `No matching class found for student ${student._id} (${student.user?.lastName || ''}, ${student.user?.firstName || ''})`;
          console.error(errorMsg);
          assignmentErrors.push(errorMsg);
        }
      } catch (studentError) {
        failedCount++;
        console.error(`Error processing student ${student._id}:`, studentError);
        assignmentErrors.push(`Error with student ${student._id}: ${studentError.message}`);
      }
    }
    
    console.log(`Assignment complete. Assigned: ${assignedCount}, Failed: ${failedCount}`);
    return res.json({
      success: true,
      message: `Successfully assigned ${assignedCount} students to classes (${failedCount} failed)`,
      assignedCount: assignedCount,
      failedCount: failedCount,
      errors: assignmentErrors
    });
  } catch (error) {
    console.error('Error in assign-selected-classes route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign selected students to classes: ' + error.message
    });
  }
});

// Bulk graduate students (remove from class after completing 4th year 2nd semester)
router.post('/bulk-graduate', async (req, res) => {
  try {
    const { classId, studentIds, schoolYear } = req.body;
    
    console.log(`BULK GRADUATION: Starting graduation process for ${studentIds.length} students`);
    console.log(`BULK GRADUATION: Class ID: ${classId}`);
    console.log(`BULK GRADUATION: School Year: ${schoolYear}`);
    console.log(`BULK GRADUATION: Student IDs: ${studentIds.join(', ')}`);
    
    // Validate input
    if (!classId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Class ID and student IDs are required'
      });
    }
    
    // Find the class
    const currentClass = await Class.findById(classId).populate('students');
    if (!currentClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    console.log(`BULK GRADUATION: Found class ${currentClass.yearLevel} - ${currentClass.section}`);
    
    // Verify this is a 4th year class
    if (!currentClass.yearLevel.includes('4th') && !currentClass.yearLevel.includes('4')) {
      return res.status(400).json({
        success: false,
        message: 'Graduation is only available for 4th year classes'
      });
    }
    
    const graduatedStudents = [];
    const errors = [];
    
    // Process each student for graduation
    for (const studentId of studentIds) {
      try {
        console.log(`BULK GRADUATION: Processing student ${studentId}`);
        
        // Find the student
        const student = await Student.findById(studentId).populate('user');
        if (!student) {
          console.error(`BULK GRADUATION: Student ${studentId} not found`);
          errors.push({
            studentId,
            message: 'Student not found'
          });
          continue;
        }
        
        console.log(`BULK GRADUATION: Found student ${student.user.firstName} ${student.user.lastName}`);
        
        // Remove student from the class
        currentClass.students = currentClass.students.filter(
          s => s.toString() !== studentId
        );
        
        // Update student's status to graduated (optional - add graduated field)
        student.graduated = true;
        student.graduationDate = new Date();
        student.graduationSchoolYear = schoolYear;
        student.graduationClass = {
          classId: currentClass._id,
          yearLevel: currentClass.yearLevel,
          section: currentClass.section,
          major: currentClass.major
        };
        
        await student.save();
        
        graduatedStudents.push({
          studentId: studentId,
          name: `${student.user.firstName} ${student.user.lastName}`,
          idNumber: student.user.idNumber
        });
        
        console.log(`BULK GRADUATION: Student ${student.user.firstName} ${student.user.lastName} graduated successfully`);
        
      } catch (error) {
        console.error(`BULK GRADUATION: Error processing student ${studentId}:`, error);
        errors.push({
          studentId,
          message: error.message
        });
      }
    }
    
    // Save the updated class
    await currentClass.save();
    
    console.log(`BULK GRADUATION: Successfully graduated ${graduatedStudents.length} students`);
    console.log(`BULK GRADUATION: ${errors.length} errors occurred`);
    
    res.json({
      success: true,
      message: `Successfully graduated ${graduatedStudents.length} students`,
      graduatedStudents,
      errors,
      summary: {
        totalStudents: studentIds.length,
        successful: graduatedStudents.length,
        failed: errors.length,
        classId: classId,
        schoolYear: schoolYear
      }
    });
    
  } catch (error) {
    console.error('BULK GRADUATION: Error in bulk graduation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to graduate students', 
      error: error.message 
    });
  }
});

module.exports = router; 