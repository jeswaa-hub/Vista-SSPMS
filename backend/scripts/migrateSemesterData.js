const mongoose = require('mongoose');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
require('dotenv').config();

async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function migrateSemesterData() {
  try {
    console.log('Starting migration of semester data...');
    
    // Get all classes that don't have firstSemester data
    const classes = await Class.find({ 
      'firstSemester.sspSubject': { $exists: false } 
    }).populate('sspSubject');
    
    console.log(`Found ${classes.length} classes without semester data`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const classItem of classes) {
      try {
        // Skip if class doesn't have main subject data
        if (!classItem.sspSubject) {
          console.log(`Warning: No subject found for class ${classItem._id}`);
          continue;
        }
        
        // Get the semester from the subject
        const semester = classItem.sspSubject.semester || '';
        
        // Determine which semester this class is for
        const isFirstSem = semester.includes('1st') || !semester.includes('2nd');
        
        if (isFirstSem) {
          // This is a first semester class, add data to firstSemester field
          await Class.updateOne(
            { _id: classItem._id },
            { 
              $set: { 
                firstSemester: {
                  daySchedule: classItem.daySchedule,
                  timeSchedule: classItem.timeSchedule,
                  room: classItem.room,
                  sspSubject: classItem.sspSubject._id,
                  hours: classItem.hours
                }
              } 
            }
          );
          
          console.log(`Updated class ${classItem._id} with first semester data`);
        } else {
          // This is a second semester class, add data to secondSemester field
          await Class.updateOne(
            { _id: classItem._id },
            { 
              $set: { 
                secondSemester: {
                  daySchedule: classItem.daySchedule,
                  timeSchedule: classItem.timeSchedule,
                  room: classItem.room,
                  sspSubject: classItem.sspSubject._id,
                  hours: classItem.hours
                }
              } 
            }
          );
          
          // Try to find matching first semester class with same year/section/major
          const firstSemClass = await Class.findOne({
            yearLevel: classItem.yearLevel,
            section: classItem.section,
            major: classItem.major,
            'sspSubject.semester': { $regex: '1st' },
            status: 'active'
          }).populate('sspSubject');
          
          if (firstSemClass) {
            // Add first semester data too
            await Class.updateOne(
              { _id: classItem._id },
              { 
                $set: { 
                  firstSemester: {
                    daySchedule: firstSemClass.daySchedule,
                    timeSchedule: firstSemClass.timeSchedule,
                    room: firstSemClass.room,
                    sspSubject: firstSemClass.sspSubject._id,
                    hours: firstSemClass.hours
                  }
                } 
              }
            );
            
            console.log(`Updated class ${classItem._id} with both semester data`);
          } else {
            console.log(`Updated class ${classItem._id} with second semester data (no matching first semester class found)`);
          }
        }
        
        updatedCount++;
      } catch (error) {
        console.error(`Error updating class ${classItem._id}:`, error);
        errorCount++;
      }
    }
    
    // Now find first semester classes and pair them with second semester classes
    const firstSemClasses = await Class.find({ 
      'firstSemester.sspSubject': { $exists: true },
      'secondSemester.sspSubject': { $exists: false },
      'sspSubject.semester': { $regex: '1st' }
    }).populate('sspSubject');
    
    console.log(`Found ${firstSemClasses.length} first semester classes without second semester data`);
    
    for (const firstSemClass of firstSemClasses) {
      try {
        // Try to find matching second semester class
        const secondSemClass = await Class.findOne({
          yearLevel: firstSemClass.yearLevel,
          section: firstSemClass.section,
          major: firstSemClass.major,
          'sspSubject.semester': { $regex: '2nd' },
          status: 'active'
        }).populate('sspSubject');
        
        if (secondSemClass) {
          // Add second semester data to first semester class
          await Class.updateOne(
            { _id: firstSemClass._id },
            { 
              $set: { 
                secondSemester: {
                  daySchedule: secondSemClass.daySchedule,
                  timeSchedule: secondSemClass.timeSchedule,
                  room: secondSemClass.room,
                  sspSubject: secondSemClass.sspSubject._id,
                  hours: secondSemClass.hours
                }
              } 
            }
          );
          
          console.log(`Added second semester data from class ${secondSemClass._id} to class ${firstSemClass._id}`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error updating first semester class ${firstSemClass._id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Migration complete. Updated ${updatedCount} classes. Errors: ${errorCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
connectToDatabase()
  .then(migrateSemesterData)
  .catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });