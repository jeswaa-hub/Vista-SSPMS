const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Student = require('../models/Student');
const { authenticate, authorizeAdmin, authorizeAdviser } = require('../middleware/auth');

// Get all consultations (Admin only)
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('adviser', 'firstName lastName email salutation')
      .populate({
        path: 'bookings.student',
        populate: {
          path: 'user',
          select: 'firstName lastName email idNumber'
        }
      })
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json(consultations);
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's bookings (moved before /:id route to prevent conflicts)
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    console.log('My-bookings endpoint called by user:', req.user._id, 'role:', req.user.role);
    
    // Only students can access this endpoint
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }
    
    // Find the student record
    const student = await Student.findOne({ user: req.user._id });
    console.log('Found student:', student ? student._id : 'not found');
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Find all consultations that have bookings from this student
    const consultations = await Consultation.find({
      'bookings.student': student._id
    })
    .populate('adviser', 'firstName lastName email salutation')
    .sort({ dayOfWeek: 1, startTime: 1 });
    
    console.log('Found consultations with student bookings:', consultations.length);
    
    // Extract and flatten the bookings for this student
    const studentBookings = [];
    
    consultations.forEach(consultation => {
      console.log(`Consultation ${consultation._id} has ${consultation.bookings.length} bookings`);
      
      consultation.bookings.forEach(booking => {
        console.log('Checking booking student:', booking.student.toString(), 'vs student:', student._id.toString());
        
        if (booking.student.toString() === student._id.toString()) {
          console.log('Found matching booking:', booking._id, 'feedback:', booking.feedback ? 'exists' : 'none');
          
          studentBookings.push({
            _id: booking._id,
            consultation: {
              _id: consultation._id,
              dayOfWeek: consultation.dayOfWeek,
              startTime: consultation.startTime,
              endTime: consultation.endTime,
              duration: consultation.duration,
              adviser: consultation.adviser,
              maxStudents: consultation.maxStudents,
              status: consultation.status
            },
            status: booking.status,
            concern: booking.concern,
            notes: booking.notes,
            feedback: booking.feedback,
            feedbackAt: booking.feedbackAt,
            bookedAt: booking.bookedAt,
            updatedAt: booking.updatedAt
          });
        }
      });
    });
    
    console.log('Total student bookings found:', studentBookings.length);
    
    // Sort bookings by booking date (newest first)
    studentBookings.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    
    res.json(studentBookings);
  } catch (error) {
    console.error('Get student bookings error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Alternative method to get student's bookings using aggregation
router.get('/my-bookings-alt', authenticate, async (req, res) => {
  try {
    console.log('My-bookings-alt endpoint called by user:', req.user._id, 'role:', req.user.role);
    
    // Only students can access this endpoint
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }
    
    // Find the student record
    const student = await Student.findOne({ user: req.user._id });
    console.log('Found student:', student ? student._id : 'not found');
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Use aggregation to get bookings
    const result = await Consultation.aggregate([
      // Match consultations that have bookings from this student
      {
        $match: {
          'bookings.student': student._id
        }
      },
      // Unwind bookings array
      {
        $unwind: '$bookings'
      },
      // Match only bookings from this student
      {
        $match: {
          'bookings.student': student._id
        }
      },
      // Lookup adviser information
      {
        $lookup: {
          from: 'users',
          localField: 'adviser',
          foreignField: '_id',
          as: 'adviserInfo'
        }
      },
      // Project the desired fields
      {
        $project: {
          _id: '$bookings._id',
          consultation: {
            _id: '$_id',
            dayOfWeek: '$dayOfWeek',
            startTime: '$startTime',
            endTime: '$endTime',
            duration: '$duration',
            maxStudents: '$maxStudents',
            status: '$status',
            adviser: { $arrayElemAt: ['$adviserInfo', 0] }
          },
          status: '$bookings.status',
          concern: '$bookings.concern',
          notes: '$bookings.notes',
          feedback: '$bookings.feedback',
          feedbackAt: '$bookings.feedbackAt',
          bookedAt: '$bookings.bookedAt',
          updatedAt: '$bookings.updatedAt'
        }
      },
      // Sort by booking date (newest first)
      {
        $sort: { bookedAt: -1 }
      }
    ]);
    
    console.log('Aggregation result count:', result.length);
    
    // Clean up adviser info
    const studentBookings = result.map(booking => ({
      ...booking,
      consultation: {
        ...booking.consultation,
        adviser: {
          _id: booking.consultation.adviser._id,
          firstName: booking.consultation.adviser.firstName,
          lastName: booking.consultation.adviser.lastName,
          email: booking.consultation.adviser.email,
          salutation: booking.consultation.adviser.salutation
        }
      }
    }));
    
    res.json(studentBookings);
  } catch (error) {
    console.error('Get student bookings (alt) error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Debug endpoint to check student and consultation data
router.get('/debug/student-data', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access this endpoint' });
    }
    
    // Find the student record
    const student = await Student.findOne({ user: req.user._id });
    
    // Get all consultations
    const allConsultations = await Consultation.find({})
      .populate('adviser', 'firstName lastName email')
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    // Get consultations with any bookings
    const consultationsWithBookings = await Consultation.find({
      'bookings.0': { $exists: true }
    }).populate('adviser', 'firstName lastName email');
    
    // Get consultations with this student's bookings
    const consultationsWithStudentBookings = await Consultation.find({
      'bookings.student': student ? student._id : null
    }).populate('adviser', 'firstName lastName email');
    
    res.json({
      user: {
        _id: req.user._id,
        role: req.user.role,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      },
      student: student ? {
        _id: student._id,
        user: student.user,
        idNumber: student.idNumber
      } : null,
      stats: {
        totalConsultations: allConsultations.length,
        consultationsWithBookings: consultationsWithBookings.length,
        consultationsWithStudentBookings: consultationsWithStudentBookings.length
      },
      consultationsWithStudentBookings: consultationsWithStudentBookings.map(c => ({
        _id: c._id,
        adviser: c.adviser,
        dayOfWeek: c.dayOfWeek,
        startTime: c.startTime,
        endTime: c.endTime,
        bookings: c.bookings.map(b => ({
          _id: b._id,
          student: b.student,
          status: b.status,
          concern: b.concern,
          feedback: b.feedback,
          feedbackAt: b.feedbackAt,
          bookedAt: b.bookedAt
        }))
      }))
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get available consultations for students
router.get('/available/all', authenticate, async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.query;
    
    let query = { status: 'Active' };
    
    if (dayOfWeek !== undefined) {
      query.dayOfWeek = parseInt(dayOfWeek);
    }
    
    if (startTime !== undefined && endTime !== undefined) {
      query.startTime = { $lte: parseInt(startTime) };
      query.endTime = { $gte: parseInt(endTime) };
    }
    
    const consultations = await Consultation.find(query)
      .populate('adviser', 'firstName lastName email salutation')
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    // Filter out full consultations
    const availableConsultations = consultations.filter(consultation => 
      consultation.bookedStudents < consultation.maxStudents
    );
    
    res.json(availableConsultations);
  } catch (error) {
    console.error('Get available consultations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultations by adviser (For adviser use)
router.get('/adviser/:adviserId', authenticate, async (req, res) => {
  try {
    const { adviserId } = req.params;
    
    // Check if requesting user is the adviser or an admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== adviserId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    console.log('Fetching consultations for adviser:', adviserId);
    
    const consultations = await Consultation.find({ adviser: adviserId })
      .populate('adviser', 'firstName lastName email salutation')
      .populate({
        path: 'bookings.student',
        populate: {
          path: 'user',
          select: 'firstName lastName email idNumber'
        }
      })
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    console.log(`Found ${consultations.length} consultations for adviser ${adviserId}`);
    console.log('Sample consultation bookings:', consultations[0]?.bookings?.map(b => ({
      student: b.student?.user?.firstName + ' ' + b.student?.user?.lastName,
      status: b.status,
      concern: b.concern
    })));
    
    res.json(consultations);
  } catch (error) {
    console.error('Get adviser consultations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultation by ID (moved after specific routes to prevent conflicts)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('adviser', 'firstName lastName email salutation')
      .populate({
        path: 'bookings.student',
        populate: {
          path: 'user',
          select: 'firstName lastName email idNumber'
        }
      });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Check if user has permission to view this consultation
    if (req.user.role === 'adviser' && consultation.adviser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(consultation);
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new consultation (Admin only)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { adviserId, dayOfWeek, startTime, duration, maxStudents, notes } = req.body;
    
    // Validate required fields
    if (!adviserId || dayOfWeek === undefined || !startTime || !duration || !maxStudents) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate adviser exists
    const adviser = await User.findOne({ _id: adviserId, role: 'adviser', status: 'active' });
    if (!adviser) {
      return res.status(404).json({ message: 'Adviser not found or inactive' });
    }
    
    // Validate day of week (0-4 for Monday-Friday)
    if (dayOfWeek < 0 || dayOfWeek > 4) {
      return res.status(400).json({ message: 'Invalid day of week. Must be 0-4 (Monday-Friday)' });
    }
    
    // Get system options for consultation settings
    const SystemOption = require('../models/SystemOption');
    const systemOptions = await SystemOption.findOne();
    const consultationSettings = systemOptions?.consultation || { fixedDuration: 3, businessHours: { start: 7, end: 18 } };
    
    // Validate duration matches system setting
    if (duration !== consultationSettings.fixedDuration) {
      return res.status(400).json({ 
        message: `Consultation duration must be ${consultationSettings.fixedDuration} hours as configured in system options` 
      });
    }
    
    // Validate time slots using system settings
    if (startTime < consultationSettings.businessHours.start || startTime > (consultationSettings.businessHours.end - duration)) {
      return res.status(400).json({ 
        message: `Start time must be between ${consultationSettings.businessHours.start} AM and ${consultationSettings.businessHours.end - duration} PM` 
      });
    }
    
    const endTime = startTime + duration;
    if (endTime > consultationSettings.businessHours.end) {
      return res.status(400).json({ 
        message: `Consultation would extend beyond business hours (${consultationSettings.businessHours.end} PM)` 
      });
    }
    
    // Check for conflicts with existing consultations for this adviser
    const conflictingConsultation = await Consultation.findOne({
      adviser: adviserId,
      dayOfWeek: dayOfWeek,
      $or: [
        {
          // New consultation starts during existing consultation
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        {
          // New consultation ends during existing consultation
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        {
          // New consultation completely overlaps existing consultation
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    });
    
    if (conflictingConsultation) {
      return res.status(400).json({ 
        message: 'Consultation time conflicts with existing schedule',
        conflictWith: {
          startTime: conflictingConsultation.startTime,
          endTime: conflictingConsultation.endTime
        }
      });
    }
    
    // Create new consultation
    const consultation = new Consultation({
      adviser: adviserId,
      dayOfWeek,
      startTime,
      endTime,
      duration,
      maxStudents,
      notes: notes || '',
      status: 'Active'
    });
    
    await consultation.save();
    
    // Populate adviser info for response
    await consultation.populate('adviser', 'firstName lastName email salutation');
    
    res.status(201).json({
      message: 'Consultation schedule created successfully',
      consultation
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update consultation (Admin only)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { adviserId, dayOfWeek, startTime, duration, maxStudents, notes, status } = req.body;
    
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // If changing adviser, validate new adviser
    if (adviserId && adviserId !== consultation.adviser.toString()) {
      const adviser = await User.findOne({ _id: adviserId, role: 'adviser', status: 'active' });
      if (!adviser) {
        return res.status(404).json({ message: 'Adviser not found or inactive' });
      }
      consultation.adviser = adviserId;
    }
    
    // Update fields if provided
    if (dayOfWeek !== undefined) {
      if (dayOfWeek < 0 || dayOfWeek > 4) {
        return res.status(400).json({ message: 'Invalid day of week. Must be 0-4 (Monday-Friday)' });
      }
      consultation.dayOfWeek = dayOfWeek;
    }
    
    if (startTime !== undefined) {
      // Get system options for consultation settings
      const SystemOption = require('../models/SystemOption');
      const systemOptions = await SystemOption.findOne();
      const consultationSettings = systemOptions?.consultation || { businessHours: { start: 7, end: 18 } };
      
      if (startTime < consultationSettings.businessHours.start || startTime > (consultationSettings.businessHours.end - consultation.duration)) {
        return res.status(400).json({ 
          message: `Start time must be between ${consultationSettings.businessHours.start} AM and ${consultationSettings.businessHours.end - consultation.duration} PM` 
        });
      }
      consultation.startTime = startTime;
    }
    
    if (duration !== undefined) {
      // Get system options for consultation settings
      const SystemOption = require('../models/SystemOption');
      const systemOptions = await SystemOption.findOne();
      const consultationSettings = systemOptions?.consultation || { fixedDuration: 3, businessHours: { start: 7, end: 18 } };
      
      // Validate duration matches system setting
      if (duration !== consultationSettings.fixedDuration) {
        return res.status(400).json({ 
          message: `Consultation duration must be ${consultationSettings.fixedDuration} hours as configured in system options` 
        });
      }
      consultation.duration = duration;
    }
    
    // Recalculate end time
    consultation.endTime = consultation.startTime + consultation.duration;
    
    // Get system options for validation
    const SystemOption = require('../models/SystemOption');
    const systemOptions = await SystemOption.findOne();
    const consultationSettings = systemOptions?.consultation || { businessHours: { start: 7, end: 18 } };
    
    if (consultation.endTime > consultationSettings.businessHours.end) {
      return res.status(400).json({ 
        message: `Consultation would extend beyond business hours (${consultationSettings.businessHours.end} PM)` 
      });
    }
    
    if (maxStudents !== undefined) {
      consultation.maxStudents = maxStudents;
    }
    
    if (notes !== undefined) {
      consultation.notes = notes;
    }
    
    if (status) {
      consultation.status = status;
    }
    
    consultation.updatedAt = Date.now();
    await consultation.save();
    
    // Populate adviser info for response
    await consultation.populate('adviser', 'firstName lastName email salutation');
    
    res.json({
      message: 'Consultation schedule updated successfully',
      consultation
    });
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete consultation (Admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    // Check if there are any active bookings
    const activeBookings = consultation.bookings.filter(booking => 
      booking.status === 'Pending' || booking.status === 'Confirmed'
    );
    
    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete consultation with active bookings',
        activeBookings: activeBookings.length
      });
    }
    
    await Consultation.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Consultation schedule deleted successfully' });
  } catch (error) {
    console.error('Delete consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book a consultation (Student only)
router.post('/:id/book', authenticate, async (req, res) => {
  try {
    // Only students can book consultations
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can book consultations' });
    }
    
    const { concern, notes } = req.body;
    
    // Validate concern field
    const validConcerns = [
      'Academic Performance and Grades',
      'Career Planning and Future Goals', 
      'Time Management and Workload',
      'Financial Concerns',
      'Mental Health and Personal Well-being',
      'Other'
    ];
    
    if (!concern || !validConcerns.includes(concern)) {
      return res.status(400).json({ 
        message: 'Please select a valid concern',
        validConcerns 
      });
    }
    
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    if (consultation.status !== 'Active') {
      return res.status(400).json({ message: 'Consultation is not available for booking' });
    }
    
    // Find the student record
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Check if student already has ANY active booking with ANY adviser (NEW RESTRICTION)
    const existingActiveBookings = await Consultation.find({
      'bookings.student': student._id,
      'bookings.status': { $in: ['Pending', 'Confirmed'] }
    }).populate('adviser', 'firstName lastName');
    
    if (existingActiveBookings.length > 0) {
      const existingAdviser = existingActiveBookings[0].adviser;
      return res.status(400).json({ 
        message: `You already have an active consultation booking with ${existingAdviser.firstName} ${existingAdviser.lastName}. Please complete or cancel your current booking before booking with another adviser.`,
        existingBooking: {
          adviser: `${existingAdviser.firstName} ${existingAdviser.lastName}`,
          consultationId: existingActiveBookings[0]._id
        }
      });
    }
    
    // Check if student already has a booking for this specific consultation
    const existingBooking = consultation.bookings.find(booking => 
      booking.student.toString() === student._id.toString() &&
      (booking.status === 'Pending' || booking.status === 'Confirmed')
    );
    
    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a booking for this consultation' });
    }
    
    // Check for time conflicts with other student bookings (keep existing logic for safety)
    const conflictingConsultations = await Consultation.find({
      dayOfWeek: consultation.dayOfWeek,
      'bookings.student': student._id,
      'bookings.status': { $in: ['Pending', 'Confirmed'] },
      $or: [
        {
          // New consultation starts during existing consultation
          startTime: { $lte: consultation.startTime },
          endTime: { $gt: consultation.startTime }
        },
        {
          // New consultation ends during existing consultation
          startTime: { $lt: consultation.endTime },
          endTime: { $gte: consultation.endTime }
        },
        {
          // New consultation completely overlaps existing consultation
          startTime: { $gte: consultation.startTime },
          endTime: { $lte: consultation.endTime }
        }
      ]
    }).populate('adviser', 'firstName lastName');
    
    if (conflictingConsultations.length > 0) {
      const conflictAdviser = conflictingConsultations[0].adviser;
      return res.status(400).json({ 
        message: `You have a conflicting consultation with ${conflictAdviser.firstName} ${conflictAdviser.lastName} at the same time slot`,
        conflictWith: {
          adviser: conflictAdviser.firstName + ' ' + conflictAdviser.lastName,
          time: `${conflictingConsultations[0].startTime}:00 - ${conflictingConsultations[0].endTime}:00`
        }
      });
    }
    
    // Check if consultation is full
    if (consultation.bookedStudents >= consultation.maxStudents) {
      return res.status(400).json({ message: 'Consultation is fully booked' });
    }
    
    // Add booking
    consultation.bookings.push({
      student: student._id,
      status: 'Pending',
      concern: concern,
      notes: notes || ''
    });
    
    await consultation.save();
    
    res.json({ 
      message: 'Consultation booked successfully! You can only have one active consultation booking at a time.',
      booking: consultation.bookings[consultation.bookings.length - 1]
    });
  } catch (error) {
    console.error('Book consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel a booking (Student only)
router.delete('/:id/bookings/:bookingId', authenticate, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    
    const booking = consultation.bookings.id(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Find the student record
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Check if this booking belongs to the requesting student or if user is admin/adviser
    if (req.user.role === 'student' && booking.student.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    booking.status = 'Cancelled';
    await consultation.save();
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (Adviser only)
router.put('/bookings/:bookingId/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const { bookingId } = req.params;
    
    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status',
        validStatuses 
      });
    }
    
    // Find consultation with this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    }).populate('adviser', 'firstName lastName email');
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the adviser for this consultation or admin
    if (req.user.role !== 'admin' && consultation.adviser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find and update the specific booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    booking.status = status;
    await consultation.save();
    
    res.json({ 
      message: 'Booking status updated successfully',
      booking: {
        _id: booking._id,
        status: booking.status,
        concern: booking.concern,
        notes: booking.notes
      }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add feedback to booking (Adviser only)
router.put('/bookings/:bookingId/feedback', authenticate, async (req, res) => {
  try {
    const { feedback } = req.body;
    const { bookingId } = req.params;
    
    if (!feedback || feedback.trim().length === 0) {
      return res.status(400).json({ message: 'Feedback is required' });
    }
    
    // Find the consultation containing this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the adviser for this consultation
    if (req.user.role !== 'admin' && consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find the booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only allow feedback for completed consultations
    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only add feedback to completed consultations' });
    }
    
    // Update feedback
    booking.feedback = feedback.trim();
    booking.feedbackAt = new Date();
    
    await consultation.save();
    
    console.log(`Feedback added to booking ${bookingId} by adviser ${req.user._id}`);
    
    res.json({ 
      message: 'Feedback added successfully', 
      booking: {
        _id: booking._id,
        feedback: booking.feedback,
        feedbackAt: booking.feedbackAt,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Add booking feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Escalate consultation to admin (Adviser only)
router.post('/bookings/:bookingId/escalate', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Escalation reason is required' });
    }
    
    // Find the consultation containing this booking
    const consultation = await Consultation.findOne({
      'bookings._id': bookingId
    }).populate({
      path: 'bookings.student',
      populate: {
        path: 'user',
        select: 'firstName lastName email idNumber'
      }
    });
    
    if (!consultation) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user is the adviser for this consultation
    if (req.user.role !== 'admin' && consultation.adviser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Find the booking
    const booking = consultation.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Only allow escalation for completed consultations
    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only escalate completed consultations' });
    }
    
    // Create admin report for escalation
    const AdminReport = require('../models/AdminReport');
    const Student = require('../models/Student');
    
    const student = await Student.findById(booking.student._id || booking.student).populate('user');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get semester from student's current class SSP subject
    let semester = '1st'; // default
    if (student.class) {
      // Populate the class with SSP subject to get semester information
      const Class = require('../models/Class');
      const populatedClass = await Class.findById(student.class._id)
        .populate('sspSubject', 'semester')
        .populate('firstSemester.sspSubject', 'semester')
        .populate('secondSemester.sspSubject', 'semester');
      
      if (populatedClass) {
        // Check if the class has the new semester structure
        if (populatedClass.firstSemester?.sspSubject || populatedClass.secondSemester?.sspSubject) {
          // Use the SSP subject semester from the current semester structure
          if (populatedClass.firstSemester?.sspSubject?.semester) {
            semester = populatedClass.firstSemester.sspSubject.semester.includes('1st') ? '1st' : '2nd';
          } else if (populatedClass.secondSemester?.sspSubject?.semester) {
            semester = populatedClass.secondSemester.sspSubject.semester.includes('2nd') ? '2nd' : '1st';
          }
        } else if (populatedClass.sspSubject?.semester) {
          // For legacy classes, use the main SSP subject semester
          semester = populatedClass.sspSubject.semester.includes('2nd') ? '2nd' : '1st';
        }
      }
    }
    
    await AdminReport.createConsultationEscalation(student, req.user, {
      consultationId: consultation._id,
      bookingId: bookingId,
      reason: reason.trim(),
      feedback: booking.feedback || '',
      concern: booking.concern
    }, semester);
    
    console.log(`Consultation escalated to admin by adviser ${req.user._id} for booking ${bookingId}`);
    
    res.json({ 
      message: 'Consultation escalated to admin successfully',
      escalation: {
        bookingId: bookingId,
        reason: reason.trim(),
        escalatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Escalate consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get consultation statistics for adviser dashboard
router.get('/adviser-stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Only allow advisers to access this endpoint
    if (userRole !== 'adviser') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Adviser role required.' 
      });
    }
    
    // Find consultations for this adviser
    const consultations = await Consultation.find({ adviser: userId });
    
    let pending = 0;
    let confirmed = 0;
    let completed = 0;
    const concerns = {};
    
    // Analyze all bookings across all consultations
    for (const consultation of consultations) {
      for (const booking of consultation.bookings) {
        // Count by status
        switch (booking.status) {
          case 'Pending':
            pending++;
            break;
          case 'Confirmed':
            confirmed++;
            break;
          case 'Completed':
            completed++;
            break;
        }
        
        // Count concerns
        if (booking.concern) {
          concerns[booking.concern] = (concerns[booking.concern] || 0) + 1;
        }
      }
    }
    
    // Convert concerns object to sorted array
    const topConcerns = Object.entries(concerns)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 concerns
    
    res.json({
      success: true,
      pending,
      confirmed,
      completed,
      topConcerns
    });
    
  } catch (error) {
    console.error('Error fetching adviser consultation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching consultation statistics'
    });
  }
});

module.exports = router; 