const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ExamPermit = require('../models/ExamPermit');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { authenticate, authorizeAdviser } = require('../middleware/auth');
const Tesseract = require('tesseract.js');
// Try to load PDF parser for PDF OCR support (text extraction)
let pdfParse = null;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('pdf-parse not installed; PDF text extraction may be limited.');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/exam-permits');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'permit-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// OCR extraction function focused on reference number extraction
const extractPermitData = async (filePath, mimetype) => {
  try {
    console.log(`Starting OCR extraction for permit file: ${filePath}`);
    
    let extractedText = '';
    
    if (mimetype === 'application/pdf') {
      // Extract text from PDF using pdf-parse if available
      if (pdfParse) {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = (pdfData && pdfData.text) ? pdfData.text : '';
        console.log('PDF text extracted length:', extractedText.length);
      } else {
        console.warn('pdf-parse unavailable; skipping PDF extraction');
        extractedText = '';
      }
    } else {
      // For image files, use Tesseract.js
      const { data: { text, confidence } } = await Tesseract.recognize(filePath, 'eng', {
        logger: m => console.log(m)
      });
      
      extractedText = text;
      console.log(`OCR extraction completed with confidence: ${confidence}`);
    }
    
    // Extract specific data using regex patterns - focus on reference number
    const referenceNumberMatch = extractedText.match(/(?:Ref(?:erence)?\s*(?:No\.?|Number)\s*:?\s*|REF\s*:?\s*)([A-Z0-9\-:\s]+)/i) ||
                                 extractedText.match(/\b(\d{8,})\b/g); // Look for long numeric sequences like reference numbers
    const periodMatch = extractedText.match(/Period\s*:?\s*([1-4])/i);
    
    // Extract reference number from student number line pattern (like "01:2223-030689 1156510250658")
    const studentLineMatch = extractedText.match(/\d{2}:\d{4}-\d{6}\s+(\d{10,})/);
    
    let referenceNumber = null;
    if (studentLineMatch) {
      referenceNumber = studentLineMatch[1]; // number captured
    } else if (referenceNumberMatch) {
      if (Array.isArray(referenceNumberMatch)) {
        // Extract numeric-only candidates from each match and pick the longest
        const numericCandidates = referenceNumberMatch
          .map(m => (m.match(/\d{6,}/g) || []))
          .flat();
        if (numericCandidates.length > 0) {
          referenceNumber = numericCandidates.reduce((longest, current) => current.length > longest.length ? current : longest, '');
        }
      } else {
        const captured = referenceNumberMatch[1] || '';
        const numeric = captured.match(/\d{6,}/);
        referenceNumber = numeric ? numeric[0] : captured.replace(/[^0-9]/g, '');
      }
    }
    
    // Validate this is actually a permit by looking for key permit indicators
    const permitIndicators = [
      /permit/i,
      /examination/i,
      /exam/i,
      /period\s*[1-4]/i,
      /ref(?:erence)?\s*(?:no\.?|number)/i
    ];
    
    const isValidPermit = permitIndicators.some(pattern => pattern.test(extractedText));
    
    if (!isValidPermit) {
      console.log('Document does not appear to be a valid exam permit');
      return {
        isValidPermit: false,
        extractedText: extractedText,
        confidence: 0
      };
    }
    
    const extractedData = {
      referenceNumber: referenceNumber,
      period: periodMatch ? periodMatch[1].trim() : null,
      extractedText: extractedText,
      confidence: extractedText ? 0.8 : 0,
      isValidPermit: true
    };
    
    console.log('Extracted permit data:', extractedData);
    return extractedData;
    
  } catch (error) {
    console.error('OCR extraction error:', error);
    return null;
  }
};

// Student upload permit (from student side)
router.post('/student/upload', authenticate, upload.single('permitFile'), async (req, res) => {
  try {
    const { period, semester } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No permit file uploaded'
      });
    }
    
    if (!period) {
      return res.status(400).json({
        success: false,
        message: 'Period is required'
      });
    }
    
    // Get student from authenticated user
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName idNumber')
      .populate('class', 'yearLevel section major schoolYear adviser');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }
    
    if (!student.class) {
      return res.status(400).json({
        success: false,
        message: 'Student is not assigned to any class'
      });
    }
    
    // Check if permit already exists for this student and period
    const existingPermit = await ExamPermit.findOne({
      student: student._id,
      period: period,
      schoolYear: student.class.schoolYear,
      semester: semester || '1st Semester'
    });
    
    if (existingPermit) {
      return res.status(400).json({
        success: false,
        message: 'Permit already exists for this period'
      });
    }
    
    // Extract data using OCR
    const extractedData = await extractPermitData(req.file.path, req.file.mimetype);
    
    if (!extractedData) {
      return res.status(400).json({
        success: false,
        message: 'Failed to process permit file'
      });
    }
    
    if (!extractedData.isValidPermit) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded file does not appear to be a valid exam permit'
      });
    }
    
    // Verify period alignment if period was extracted
    if (extractedData.period && extractedData.period !== period) {
      return res.status(400).json({
        success: false,
        message: `Period mismatch: You are uploading for Period ${period} but the permit shows Period ${extractedData.period}`
      });
    }
    
    // Create new permit record
    const examPermit = new ExamPermit({
      student: student._id,
      class: student.class._id,
      adviser: student.class.adviser || null, // Make adviser optional
      studentNumber: student.user.idNumber,
      referenceNumber: extractedData.referenceNumber || `REF-${Date.now()}`,
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      course: student.class.yearLevel,
      period: period,
      schoolYear: student.class.schoolYear,
      semester: semester || '1st Semester',
      permitAttachment: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      },
      extractionData: {
        extractedText: extractedData.extractedText || '',
        confidence: extractedData.confidence || 0.5,
        extractionMethod: 'tesseract',
        extractedAt: new Date()
      },
      status: 'pending'
    });
    
    await examPermit.save();
    
    console.log(`Exam permit uploaded by student ${student._id} for period ${period}`);
    
    res.json({
      success: true,
      message: 'Permit uploaded successfully and is pending validation',
      permit: {
        id: examPermit._id,
        period: examPermit.period,
        status: examPermit.status,
        createdAt: examPermit.createdAt
      }
    });
    
  } catch (error) {
    console.error('Student permit upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload permit',
      error: error.message
    });
  }
});

// Upload and extract permit data (adviser upload)
router.post('/upload', authenticate, authorizeAdviser, upload.single('permitFile'), async (req, res) => {
  try {
    const { studentId, classId, semester } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No permit file uploaded'
      });
    }
    
    if (!studentId || !classId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Class ID are required'
      });
    }
    
    // Verify student exists and belongs to the class
    const student = await Student.findById(studentId).populate('user');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    // Check if student belongs to this class
    if (!classObj.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student does not belong to this class'
      });
    }
    
    // Extract data using OCR
    const extractedData = await extractPermitData(req.file.path, req.file.mimetype);
    
    if (!extractedData) {
      return res.status(400).json({
        success: false,
        message: 'Failed to extract data from permit file'
      });
    }
    
    // Validate extracted data
    if (!extractedData.studentNumber || !extractedData.referenceNumber || !extractedData.period) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract required permit information (Student Number, Reference Number, or Period)',
        extractedData: extractedData
      });
    }
    
    // Check if permit already exists for this student and period
    const existingPermit = await ExamPermit.findOne({
      student: studentId,
      period: extractedData.period,
      schoolYear: extractedData.schoolYear || classObj.schoolYear
    });
    
    if (existingPermit) {
      return res.status(400).json({
        success: false,
        message: 'Permit already exists for this student and period'
      });
    }
    
    // Create new permit record
    const examPermit = new ExamPermit({
      student: studentId,
      class: classId,
      adviser: req.user._id,
      studentNumber: extractedData.studentNumber,
      referenceNumber: extractedData.referenceNumber,
      studentName: extractedData.studentName || `${student.user.firstName} ${student.user.lastName}`,
      course: extractedData.course || classObj.yearLevel,
      period: extractedData.period,
      schoolYear: extractedData.schoolYear || classObj.schoolYear,
      semester: semester || '1st Semester',
      permitAttachment: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      },
      extractionData: {
        extractedText: extractedData.extractedText,
        confidence: extractedData.confidence,
        extractionMethod: 'tesseract',
        extractedAt: new Date()
      },
      status: 'pending'
    });
    
    await examPermit.save();
    
    console.log(`Exam permit uploaded and processed for student ${studentId}`);
    
    res.json({
      success: true,
      message: 'Permit uploaded and processed successfully',
      permit: {
        id: examPermit._id,
        studentNumber: examPermit.studentNumber,
        referenceNumber: examPermit.referenceNumber,
        period: examPermit.period,
        status: examPermit.status,
        extractedData: extractedData
      }
    });
    
  } catch (error) {
    console.error('Permit upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload and process permit',
      error: error.message
    });
  }
});

// Get permits for adviser's classes (similar to M&M structure)
router.get('/adviser/my', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'adviser') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const AdvisoryClass = require('../models/AdvisoryClass');

    // Find classes handled by this adviser
    const advisoryClasses = await AdvisoryClass.find({ adviser: req.user._id, status: 'active' }).populate('class');
    const classIds = advisoryClasses.map(ac => ac.class?._id).filter(Boolean);

    // Collect unique student ids from these classes
    const studentIdSet = new Set();
    for (const ac of advisoryClasses) {
      if (ac.class && Array.isArray(ac.class.students)) {
        ac.class.students.forEach(sid => studentIdSet.add(String(sid)));
      }
    }
    const studentIds = Array.from(studentIdSet);

    // Get permits for these students
    const permits = await ExamPermit.find({ student: { $in: studentIds } })
      .populate('class', 'yearLevel section major schoolYear')
      .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName idNumber' } })
      .sort({ schoolYear: -1, period: 1, createdAt: -1 });

    // Compute filter options
    const schoolYears = new Set();
    const yearLevels = new Set();
    const sections = new Set();
    const majors = new Set();

    permits.forEach(p => {
      if (p.schoolYear) schoolYears.add(p.schoolYear);
      const cls = p.class;
      if (cls) {
        if (cls.yearLevel) yearLevels.add(cls.yearLevel);
        if (cls.section) sections.add(cls.section);
        if (cls.major) majors.add(cls.major);
      }
    });

    return res.status(200).json({
      success: true,
      permits: permits,
      filterOptions: {
        schoolYears: Array.from(schoolYears).sort(),
        yearLevels: Array.from(yearLevels).sort(),
        sections: Array.from(sections).sort(),
        majors: Array.from(majors).sort()
      }
    });

  } catch (error) {
    console.error('Error fetching adviser permit submissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch permit submissions',
      error: error.message
    });
  }
});

// Get permits for a class (adviser/admin only)
router.get('/class/:classId', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId } = req.params;
    const { period, status } = req.query;
    
    let query = { class: classId };
    
    if (period) {
      query.period = period;
    }
    
    if (status) {
      query.status = status;
    }
    
    const permits = await ExamPermit.find(query)
      .populate('student', 'user odysseyPlanCompleted srmSurveyCompleted')
      .populate('student.user', 'firstName lastName idNumber email')
      .populate('class', 'yearLevel section major schoolYear')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      permits: permits
    });
    
  } catch (error) {
    console.error('Get permits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve permits',
      error: error.message
    });
  }
});

// Get current student's own permits
router.get('/student/my', authenticate, async (req, res) => {
  try {
    // Find the student linked to this user
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    const { semester, period } = req.query;
    const query = { student: student._id };
    if (semester) query.semester = semester;
    if (period) query.period = period;

    const permits = await ExamPermit.find(query)
      .populate('class', 'yearLevel section major schoolYear')
      .sort({ createdAt: -1 });

    res.json({ success: true, permits });
  } catch (error) {
    console.error('Get my permits error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve permits', error: error.message });
  }
});

// Get current student's permits for a specific class
router.get('/student/class/:classId', authenticate, async (req, res) => {
  try {
    const { classId } = req.params;
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    const { semester, period } = req.query;
    const query = { student: student._id, class: classId };
    if (semester) query.semester = semester;
    if (period) query.period = period;

    const permits = await ExamPermit.find(query)
      .populate('class', 'yearLevel section major schoolYear')
      .sort({ createdAt: -1 });

    res.json({ success: true, permits });
  } catch (error) {
    console.error('Get my class permits error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve permits', error: error.message });
  }
});

// Validate permit
router.put('/validate/:permitId', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { permitId } = req.params;
    const { isValid, validationNotes } = req.body;
    
    const permit = await ExamPermit.findById(permitId);
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      });
    }
    
    permit.isValid = isValid;
    permit.validationNotes = validationNotes;
    permit.validatedBy = req.user._id;
    permit.validatedAt = new Date();
    permit.status = isValid ? 'validated' : 'rejected';
    
    await permit.save();
    
    res.json({
      success: true,
      message: `Permit ${isValid ? 'validated' : 'rejected'} successfully`,
      permit: permit
    });
    
  } catch (error) {
    console.error('Permit validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate permit',
      error: error.message
    });
  }
});

// Get permit attachment (public for student preview)
router.get('/attachment/:permitId', async (req, res) => {
  try {
    const { permitId } = req.params;
    
    const permit = await ExamPermit.findById(permitId);
    
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      });
    }
    
    if (!permit.permitAttachment) {
      return res.status(404).json({
        success: false,
        message: 'Permit attachment not found'
      });
    }
    // Resolve stored path safely (supports absolute or relative)
    const storedPath = permit.permitAttachment.path || '';
    let resolvedPath = null;
    if (storedPath) {
      resolvedPath = path.isAbsolute(storedPath)
        ? storedPath
        : path.join(__dirname, '..', storedPath);
    }

    // Fallback to uploads/exam-permits/<filename>
    const uploadsFallback = permit.permitAttachment.filename
      ? path.join(__dirname, '../uploads/exam-permits', permit.permitAttachment.filename)
      : null;

    const candidatePaths = [resolvedPath, uploadsFallback].filter(Boolean);
    const existingPath = candidatePaths.find(p => fs.existsSync(p));

    if (!existingPath) {
      return res.status(404).json({ success: false, message: 'Permit file not found on server' });
    }

    res.setHeader('Content-Type', permit.permitAttachment.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${permit.permitAttachment.originalName || permit.permitAttachment.filename || 'permit'}"`);
    return res.sendFile(existingPath);
  } catch (error) {
    console.error('Error serving permit attachment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve permit attachment'
    });
  }
});

// Export permits data
router.get('/export/:classId', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { classId } = req.params;
    const { format = 'csv', period } = req.query;
    
    let query = { class: classId };
    if (period) {
      query.period = period;
    }
    
    const permits = await ExamPermit.find(query)
      .populate('student.user', 'firstName lastName idNumber email')
      .populate('class', 'yearLevel section major schoolYear')
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Student Number',
        'Student Name',
        'Reference Number',
        'Period',
        'School Year',
        'Semester',
        'Status',
        'Valid',
        'Uploaded Date',
        'Validated Date'
      ];
      
      const csvRows = permits.map(permit => [
        permit.studentNumber,
        permit.studentName,
        permit.referenceNumber,
        permit.period,
        permit.schoolYear,
        permit.semester,
        permit.status,
        permit.isValid ? 'Yes' : 'No',
        permit.createdAt.toISOString().split('T')[0],
        permit.validatedAt ? permit.validatedAt.toISOString().split('T')[0] : ''
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="exam-permits-${classId}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
      
    } else if (format === 'json') {
      res.json({
        success: true,
        permits: permits
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported export format. Use csv or json'
      });
    }
    
  } catch (error) {
    console.error('Export permits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export permits',
      error: error.message
    });
  }
});

// Get permit by ID
router.get('/:permitId', authenticate, authorizeAdviser, async (req, res) => {
  try {
    const { permitId } = req.params;
    
    const permit = await ExamPermit.findById(permitId)
      .populate('student.user', 'firstName lastName idNumber email')
      .populate('class', 'yearLevel section major schoolYear')
      .populate('adviser', 'firstName lastName email');
    
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      });
    }
    
    res.json({
      success: true,
      permit: permit
    });
    
  } catch (error) {
    console.error('Get permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve permit',
      error: error.message
    });
  }
});

// Delete permit
router.delete('/:permitId', authenticate, async (req, res) => {
  try {
    const { permitId } = req.params;
    
    const permit = await ExamPermit.findById(permitId);
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit not found'
      });
    }
    // Authorization: advisers/admin can delete; students can delete their own if not validated
    const userRole = req.user.role;
    let isAuthorized = false;
    if (userRole === 'admin' || userRole === 'adviser') {
      isAuthorized = true;
    } else if (userRole === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student && String(permit.student) === String(student._id)) {
        // Students can only delete if not validated
        if (permit.status === 'validated') {
          return res.status(400).json({ success: false, message: 'Validated permits cannot be deleted' });
        }
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Delete the file
    if (permit.permitAttachment && permit.permitAttachment.path) {
      try {
        fs.unlinkSync(permit.permitAttachment.path);
      } catch (fileError) {
        console.warn('Could not delete permit file:', fileError.message);
      }
    }
    
    await ExamPermit.findByIdAndDelete(permitId);
    
    res.json({
      success: true,
      message: 'Permit deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete permit',
      error: error.message
    });
  }
});

module.exports = router;



// Removed duplicated trailing route handlers and extra module.exports


