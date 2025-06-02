const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/auth');
const Student = require('../models/Student');
const OdysseyPlan = require('../models/OdysseyPlan');
const User = require('../models/User');

// Get all odyssey plans for the current student
router.get('/my-plans', authenticate, async (req, res) => {
  try {
    // Find the student record for the current user
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Find all odyssey plans for this student
    const plans = await OdysseyPlan.find({ student: student._id }).sort({ year: 1, semester: 1 });
    
    res.json(plans);
  } catch (error) {
    console.error('Error fetching odyssey plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get odyssey plan for specific year and semester
router.get('/year/:year/semester/:semester', authenticate, async (req, res) => {
  try {
    const { year, semester } = req.params;
    
    // Find the student record for the current user
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Find the specific odyssey plan
    const plan = await OdysseyPlan.findOne({
      student: student._id,
      year: parseInt(year),
      semester: parseInt(semester)
    });
    
    if (!plan) {
      return res.status(404).json({ message: 'Odyssey plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error fetching odyssey plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update odyssey plan
router.post('/', authenticate, async (req, res) => {
  try {
    const { year, semester, academicGoals, personalGoals, financialGoals } = req.body;
    
    // Find the student record for the current user
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Validate that the student should be filling this year's plan
    const studentUser = await User.findById(req.user.id);
    let studentYearLevel = null;
    
    if (student.class) {
      // If student has class assigned, get year level from there
      const classObj = await mongoose.model('Class').findById(student.class);
      if (classObj && classObj.yearLevel) {
        // Convert year level like "3rd" to number 3
        studentYearLevel = parseInt(classObj.yearLevel.replace(/[^0-9]/g, ''));
      }
    }
    
    // If we couldn't determine year level from class, use student info directly if available
    if (!studentYearLevel && student.yearLevel) {
      studentYearLevel = parseInt(student.yearLevel.replace(/[^0-9]/g, ''));
    }
    
    // Ensure students can only submit plans for their current year level
    if (studentYearLevel && parseInt(year) !== studentYearLevel) {
      // Special case: If they have access to 4th year plans, allow it
      if (parseInt(year) === 4 && student.canAccess4thYearOdysseyPlan === true) {
        // Allow this special case
      } else {
        return res.status(400).json({ 
          message: `You can only complete Odyssey Plans for your current year level (${studentYearLevel}).`
        });
      }
    }

    // Find existing plan or create new one
    let plan = await OdysseyPlan.findOne({
      student: student._id,
      year: parseInt(year),
      semester: parseInt(semester)
    });
    
    if (plan) {
      // Update existing plan
      plan.academicGoals = academicGoals;
      plan.personalGoals = personalGoals;
      plan.financialGoals = financialGoals;
      plan.updatedAt = Date.now();
    } else {
      // Create new plan
      plan = new OdysseyPlan({
        student: student._id,
        year: parseInt(year),
        semester: parseInt(semester),
        academicGoals,
        personalGoals,
        financialGoals
      });
    }
    
    await plan.save();
    
    // Update student record to mark odyssey plan as completed
    student.odysseyPlanCompleted = true;
    await student.save();
    
    res.status(201).json({ message: 'Odyssey plan saved successfully', plan });
  } catch (error) {
    console.error('Error saving odyssey plan:', error);
    
    // Handle duplicate key error (trying to create multiple plans for same year/semester)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted a plan for this year and semester' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Get completed years and semesters for the student
router.get('/completed', authenticate, async (req, res) => {
  try {
    // Find the student record for the current user
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Find all odyssey plans for this student
    const plans = await OdysseyPlan.find(
      { student: student._id },
      { year: 1, semester: 1 }
    ).sort({ year: 1, semester: 1 });
    
    // Format the response to include completion status
    const completedPlans = plans.map(plan => ({
      year: plan.year,
      semester: plan.semester,
      completed: true
    }));
    
    res.json(completedPlans);
  } catch (error) {
    console.error('Error fetching completed odyssey plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all odyssey plans for a specific student (for advisers)
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Verify the current user is an adviser
    if (req.user.role !== 'adviser' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view student plans' });
    }
    
    // Find the student record
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    // Find all odyssey plans for this student
    const plans = await OdysseyPlan.find({ student: studentId }).sort({ year: 1, semester: 1 });
    
    res.json(plans);
  } catch (error) {
    console.error('Error fetching student odyssey plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's current year level
router.get('/student-year', authenticate, async (req, res) => {
  try {
    // Find the student record for the current user
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }
    
    let yearLevel = 1; // Default to 1 if not found
    
    if (student.class) {
      // If student has class assigned, get year level from there
      const classObj = await mongoose.model('Class').findById(student.class);
      if (classObj && classObj.yearLevel) {
        // Convert year level like "3rd" to number 3
        yearLevel = parseInt(classObj.yearLevel.replace(/[^0-9]/g, ''));
      }
    }
    
    // If we couldn't determine year level from class, use student info directly if available
    if (yearLevel === 1 && student.yearLevel) {
      yearLevel = parseInt(student.yearLevel.replace(/[^0-9]/g, ''));
    }
    
    // Check if student has been granted access to 4th year plans
    const canAccess4thYearOdysseyPlan = student.canAccess4thYearOdysseyPlan === true || yearLevel >= 4;
    
    res.json({ 
      yearLevel,
      canAccess4thYearOdysseyPlan
    });
  } catch (error) {
    console.error('Error fetching student year level:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 