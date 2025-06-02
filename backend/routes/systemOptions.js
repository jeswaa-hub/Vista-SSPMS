const express = require('express');
const router = express.Router();
const SystemOption = require('../models/SystemOption');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Get all system options - allow public access for read-only
router.get('/', async (req, res) => {
  try {
    // Find the options in the database, or create default if none exist
    let options = await SystemOption.findOne();
    
    if (!options) {
      // Create default options
      options = new SystemOption();
      await options.save();
    }
    
    res.json(options);
  } catch (error) {
    console.error('Error getting system options:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update system options - admin only
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const updatedOptions = req.body;
    
    // Find the options in the database, or create default if none exist
    let options = await SystemOption.findOne();
    
    if (!options) {
      options = new SystemOption(updatedOptions);
    } else {
      // Update the options
      if (updatedOptions.class) options.class = updatedOptions.class;
      if (updatedOptions.subject) options.subject = updatedOptions.subject;
      options.updatedAt = Date.now();
    }
    
    await options.save();
    
    // Update Class model schema validation based on new options
    if (updatedOptions.class) {
      // Update validation for year levels in Class model
      if (updatedOptions.class.yearLevels && updatedOptions.class.yearLevels.length > 0) {
        try {
          // Update Class schema to match new year levels
          Class.schema.path('yearLevel').enum(updatedOptions.class.yearLevels);
          console.log('Updated Class schema yearLevel enum with:', updatedOptions.class.yearLevels);
        } catch (err) {
          console.error('Error updating Class schema yearLevel enum:', err);
        }
      }
      
      // Update validation for majors in Class model
      if (updatedOptions.class.majors) {
        try {
          // Collect all unique majors from all year levels
          const allMajors = new Set();
          
          // Check if majors is an object (per year level) or array (legacy format)
          if (Array.isArray(updatedOptions.class.majors)) {
            // Legacy format - flat array of majors
            updatedOptions.class.majors.forEach(major => allMajors.add(major));
          } else {
            // New format - majors organized by year level
            Object.values(updatedOptions.class.majors).forEach(majorList => {
              if (Array.isArray(majorList)) {
                majorList.forEach(major => allMajors.add(major));
              }
            });
          }
          
          // Convert Set to Array for enum
          const uniqueMajors = Array.from(allMajors);
          
          // Update Class schema to match all possible majors
          if (uniqueMajors.length > 0) {
            Class.schema.path('major').enum(uniqueMajors);
            console.log('Updated Class schema major enum with:', uniqueMajors);
          }
        } catch (err) {
          console.error('Error updating Class schema major enum:', err);
        }
      }
    }
    
    if (updatedOptions.subject) {
      // Update validation for subject year levels separately
      if (updatedOptions.subject.yearLevels && updatedOptions.subject.yearLevels.length > 0) {
        try {
          // Update Subject schema to match new year levels
          Subject.schema.path('yearLevel').enum(updatedOptions.subject.yearLevels);
          console.log('Updated Subject schema yearLevel enum with:', updatedOptions.subject.yearLevels);
        } catch (err) {
          console.error('Error updating Subject schema yearLevel enum:', err);
        }
      }
      
      // Update validation for hours in Subject model
      if (updatedOptions.subject.hoursOptions && updatedOptions.subject.hoursOptions.length > 0) {
        try {
          // Update subject hours options
          Subject.schema.path('hours').enum(updatedOptions.subject.hoursOptions);
          console.log('Updated Subject schema hours enum with:', updatedOptions.subject.hoursOptions);
        } catch (err) {
          console.error('Error updating Subject schema hours enum:', err);
        }
      }
    }
    
    res.json(options);
  } catch (error) {
    console.error('Error updating system options:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset system options to defaults - admin only
router.post('/reset', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Find the options in the database, or create default if none exist
    let options = await SystemOption.findOne();
    
    if (options) {
      await SystemOption.deleteOne({ _id: options._id });
    }
    
    // Create new options with defaults
    options = new SystemOption();
    await options.save();
    
    // Get default majors for schema validation
    const defaultMajors = [
      'Business Informatics', 
      'System Development', 
      'Digital Arts', 
      'Computer Security'
    ];
    
    // Reset Class model schema validation to defaults
    try {
      // Reset year levels to default
      Class.schema.path('yearLevel').enum(['2nd', '3rd', '4th']);
      console.log('Reset Class schema yearLevel enum to defaults');
      
      // Reset majors to default
      Class.schema.path('major').enum(defaultMajors);
      console.log('Reset Class schema major enum to defaults');
      
      // Reset Subject year levels to default
      Subject.schema.path('yearLevel').enum(['1st', '2nd', '3rd', '4th']);
      console.log('Reset Subject schema yearLevel enum to defaults');
    } catch (err) {
      console.error('Error resetting schema enum values:', err);
    }
    
    res.json(options);
  } catch (error) {
    console.error('Error resetting system options:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
