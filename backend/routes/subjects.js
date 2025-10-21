const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Get all subjects
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subject by ID
router.get('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new subject
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { sspCode, name, yearLevel, sessions, secondSemesterSessions, description, semester, hours, schoolYear } = req.body;
    
    // Check if subject with same code and semester already exists
    const existingSubject = await Subject.findOne({ sspCode, semester });
    if (existingSubject) {
      return res.status(400).json({ message: `Subject with SSP code "${sspCode}" for "${semester}" already exists` });
    }
    
    // Validate semester
    if (!semester || !['1st Semester', '2nd Semester'].includes(semester)) {
      return res.status(400).json({ message: 'Valid semester (1st Semester or 2nd Semester) is required' });
    }
    
    // Validate yearLevel (string: 1st, 2nd, 3rd, 4th)
    if (yearLevel && !['1st', '2nd', '3rd', '4th'].includes(yearLevel)) {
      return res.status(400).json({ message: 'Year level must be "1st", "2nd", "3rd", or "4th"' });
    }

    // Create subject
    const subject = new Subject({
      sspCode,
      name: name || sspCode, // Use sspCode as fallback for name
      yearLevel,
      description,
      semester,
      schoolYear: schoolYear || '2024 - 2025', // Default to current school year
      hours: hours || 1, // Default to 1 hour if not specified
      sessions: sessions || [],
      secondSemesterSessions: secondSemesterSessions || [] 
    });
    
    await subject.save();
    
    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject with this SSP code and semester already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subject
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { sspCode, name, yearLevel, description, hours, schoolYear } = req.body;
    const { id } = req.params;

    // --- DEBUGGING LOGS ---
    console.log(`[DEBUG] Received update request for subject ID: ${id}`);
    console.log('[DEBUG] Request Body:', req.body);

    // Find subject first
    const subjectToUpdate = await Subject.findById(id);
    if (!subjectToUpdate) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // VALIDATION FIRST - bago mag-prepare ng update
    // Validate yearLevel if provided
    if (yearLevel && !['1st', '2nd', '3rd', '4th'].includes(yearLevel)) {
      return res.status(400).json({ message: 'Year level must be "1st", "2nd", "3rd", or "4th"' });
    }

    // Validate hours if provided
    if (hours && (!Number.isInteger(hours) || hours < 0)) {
      return res.status(400).json({ message: 'Hours must be a positive integer' });
    }

    // Validation for unique sspCode and semester combination
    if (sspCode) {
      const finalSspCode = sspCode ? sspCode : subjectToUpdate.sspCode;

      const query = {
        sspCode: finalSspCode,
        semester: subjectToUpdate.semester, // Use the existing semester for the check
        _id: { $ne: id }
      };
      
      const existingSubject = await Subject.findOne(query);
      if (existingSubject) {
        return res.status(400).json({ 
          message: `Update failed: A different subject (SSP Code: "${finalSspCode}") is already assigned to the "${finalSemester}".` 
        });
      }
    }

    // Prepare update payload AFTER validation
    const payload = { sspCode, name, yearLevel, description, hours, schoolYear };
    const updateData = {};

    // Conditionally add fields to the update data if they are not undefined
    for (const key in payload) {
      if (payload[key] !== undefined) {
        updateData[key] = payload[key];
      }
    }

    // If no fields are being updated, return the original subject
    if (Object.keys(updateData).length === 0) {
      return res.json(subjectToUpdate);
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    console.log('Updating subject with payload:', updateData);

    // Perform the update
    const updatedSubject = await Subject.findByIdAndUpdate(
      id, 
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedSubject);

  } catch (error) {
    console.error('Update subject error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject with this SSP code and semester already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Add session to subject
router.post('/:id/sessions', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, isSemesterTwo } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Session title is required' });
    }
    
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Determine if session is for first or second semester
    if (isSemesterTwo) {
      // Add new session to second semester
      subject.secondSemesterSessions.push({ title });
    } else {
      // Add new session to first semester
    subject.sessions.push({ title });
    }
    
    subject.updatedAt = Date.now();
    
    await subject.save();
    
    res.status(201).json({ message: 'Session added successfully' });
  } catch (error) {
    console.error('Add session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update session status
router.put('/:id/sessions/:sessionId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { status, title, isSemesterTwo } = req.body;
    
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Find session in the appropriate semester array
    const sessionArray = isSemesterTwo ? subject.secondSemesterSessions : subject.sessions;
    const sessionIndex = sessionArray.findIndex(
      session => session._id.toString() === req.params.sessionId
    );
    
    if (sessionIndex === -1) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Update session
    if (status) {
      if (isSemesterTwo) {
        subject.secondSemesterSessions[sessionIndex].status = status;
      } else {
        subject.sessions[sessionIndex].status = status;
      }
    }
    
    if (title) {
      if (isSemesterTwo) {
        subject.secondSemesterSessions[sessionIndex].title = title;
      } else {
        subject.sessions[sessionIndex].title = title;
      }
    }
    
    subject.updatedAt = Date.now();
    await subject.save();
    
    res.json({ message: 'Session updated successfully' });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete session
router.delete('/:id/sessions/:sessionId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { isSemesterTwo } = req.body;
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Find and remove session from the appropriate semester array
    const sessionArray = isSemesterTwo ? 'secondSemesterSessions' : 'sessions';
    const sessionIndex = subject[sessionArray].findIndex(
      session => session._id.toString() === req.params.sessionId
    );
    
    if (sessionIndex === -1) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    subject[sessionArray].splice(sessionIndex, 1);
    subject.updatedAt = Date.now();
    
    await subject.save();
    
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 