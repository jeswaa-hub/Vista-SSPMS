const mongoose = require('mongoose');
const Class = require('../models/Class');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ssp_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration to add schoolYear field to existing classes
const addSchoolYearToClasses = async () => {
  try {
    console.log('Starting migration: Adding schoolYear field to existing classes...');
    
    // Get all classes that don't have a schoolYear field
    const classesWithoutSchoolYear = await Class.find({
      $or: [
        { schoolYear: { $exists: false } },
        { schoolYear: null },
        { schoolYear: '' }
      ]
    });
    
    console.log(`Found ${classesWithoutSchoolYear.length} classes without schoolYear field`);
    
    if (classesWithoutSchoolYear.length === 0) {
      console.log('All classes already have schoolYear field. Migration not needed.');
      return;
    }
    
    // Update classes with default school year
    const defaultSchoolYear = '2025-2026';
    
    for (const classItem of classesWithoutSchoolYear) {
      try {
        classItem.schoolYear = defaultSchoolYear;
        await classItem.save();
        console.log(`Updated class ${classItem._id} (${classItem.yearLevel} - ${classItem.section}) with schoolYear: ${defaultSchoolYear}`);
      } catch (error) {
        console.error(`Error updating class ${classItem._id}:`, error);
      }
    }
    
    console.log(`Migration completed. Updated ${classesWithoutSchoolYear.length} classes with default schoolYear: ${defaultSchoolYear}`);
    
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

// Run migration
const runMigration = async () => {
  try {
    await connectDB();
    await addSchoolYearToClasses();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Export for programmatic use
module.exports = {
  addSchoolYearToClasses,
  runMigration
};

// Run migration if called directly
if (require.main === module) {
  runMigration();
} 