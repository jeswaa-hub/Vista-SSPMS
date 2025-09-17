const express = require('express');
const router = express.Router();
const DropRequest = require('../models/DropRequest');
const AdminNotification = require('../models/AdminNotification');
const Student = require('../models/Student');
const Class = require('../models/Class');
const User = require('../models/User');
const { authenticate, authorizeAdmin, authorizeAdviser } = require('../middleware/auth');

// Create a new drop request (Adviser only)
router.post('/', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { studentId, classId, reason } = req.body;

    if (!studentId || !classId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, class ID, and reason are required'
      });
    }

    // Check if student exists and is in the class
    const student = await Student.findById(studentId).populate('user');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Allow multiple requests - advisers can send up to 5 requests per student/class
    const existingRequestsCount = await DropRequest.countDocuments({
      student: studentId,
      class: classId,
      status: 'pending'
    });

    if (existingRequestsCount >= 5) {
      return res.status(409).json({
        success: false,
        message: 'Maximum of 5 pending drop requests allowed per student in this class'
      });
    }

    // Create the drop request
    const dropRequest = new DropRequest({
      student: studentId,
      class: classId,
      requester: req.user.id,
      reason: reason.trim()
    });

    await dropRequest.save();

    // Get requester info
    const requester = await User.findById(req.user.id);

    // Create admin notification
    const notification = new AdminNotification({
      title: 'Drop Request',
      message: `${requester.firstName} ${requester.lastName} has requested to drop ${student.user.firstName} ${student.user.lastName} from ${classData.yearLevel} Year - ${classData.section}`,
      type: 'drop_request',
      dropRequestId: dropRequest._id,
      studentInfo: {
        id: student._id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        idNumber: student.idNumber
      },
      classInfo: {
        id: classData._id,
        name: `${classData.yearLevel} Year - ${classData.section}`,
        yearLevel: classData.yearLevel,
        section: classData.section,
        major: classData.major
      },
      requesterInfo: {
        id: requester._id,
        name: `${requester.firstName} ${requester.lastName}`,
        email: requester.email,
        role: requester.role
      },
      reason: reason.trim(),
      status: 'pending'
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Drop request submitted successfully',
      data: {
        dropRequest: dropRequest._id,
        notification: notification._id
      }
    });

  } catch (error) {
    console.error('Error creating drop request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create drop request'
    });
  }
});

// Get all drop requests (Admin only)
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const dropRequests = await DropRequest.find(query)
      .populate('student', 'idNumber user')
      .populate('class', 'yearLevel section major')
      .populate('requester', 'firstName lastName email')
      .populate('adminResponse.respondedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DropRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        dropRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching drop requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drop requests'
    });
  }
});

// Approve drop request (Admin only)
router.put('/:id/approve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const dropRequest = await DropRequest.findById(id)
      .populate('student')
      .populate('class');

    if (!dropRequest) {
      return res.status(404).json({
        success: false,
        message: 'Drop request not found'
      });
    }

    if (dropRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Drop request has already been processed'
      });
    }

    // Update drop request status
    dropRequest.status = 'approved';
    dropRequest.adminResponse = {
      respondedBy: req.user.id,
      response: 'Approved by admin',
      respondedAt: new Date()
    };
    await dropRequest.save();

    // Remove student from class
    const classData = await Class.findById(dropRequest.class);
    if (classData && classData.students) {
      classData.students = classData.students.filter(
        studentId => !studentId.equals(dropRequest.student._id)
      );
      await classData.save();
    }

    // Update notification
    await AdminNotification.findOneAndUpdate(
      { dropRequestId: id },
      { 
        status: 'approved',
        title: 'Drop Request Approved',
        message: `Student ${dropRequest.student.user.firstName} ${dropRequest.student.user.lastName} has been dropped from the class.`
      }
    );

    res.json({
      success: true,
      message: 'Drop request approved and student removed from class'
    });

  } catch (error) {
    console.error('Error approving drop request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve drop request'
    });
  }
});

// Reject drop request (Admin only)
router.put('/:id/reject', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const dropRequest = await DropRequest.findById(id)
      .populate('student')
      .populate('class');

    if (!dropRequest) {
      return res.status(404).json({
        success: false,
        message: 'Drop request not found'
      });
    }

    if (dropRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Drop request has already been processed'
      });
    }

    // Update drop request status
    dropRequest.status = 'rejected';
    dropRequest.adminResponse = {
      respondedBy: req.user.id,
      response: reason || 'Rejected by admin',
      respondedAt: new Date()
    };
    await dropRequest.save();

    // Update notification
    await AdminNotification.findOneAndUpdate(
      { dropRequestId: id },
      { 
        status: 'rejected',
        title: 'Drop Request Rejected',
        message: `Drop request for ${dropRequest.student.user.firstName} ${dropRequest.student.user.lastName} has been rejected.`,
        details: reason || 'No reason provided'
      }
    );

    res.json({
      success: true,
      message: 'Drop request rejected'
    });

  } catch (error) {
    console.error('Error rejecting drop request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject drop request'
    });
  }
});

module.exports = router;
