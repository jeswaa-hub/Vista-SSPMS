require('dotenv').config();
const mongoose = require('mongoose');

async function fixClassIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection;
    
    // Get all indexes for the classes collection
    const indexes = await db.collection('classes').indexes();
    console.log('Current indexes:', indexes);
    
    // Find the index with yearLevel and section
    const targetIndex = indexes.find(index => 
      index.key.yearLevel === 1 && 
      index.key.section === 1 && 
      !index.key.major);
    
    if (targetIndex) {
      console.log('Found target index to drop:', targetIndex.name);
      
      // Drop the existing index
      await db.collection('classes').dropIndex(targetIndex.name);
      console.log(`Dropped index: ${targetIndex.name}`);
      
      // Create a new compound index that includes major
      await db.collection('classes').createIndex(
        { yearLevel: 1, section: 1, major: 1 }, 
        { unique: true }
      );
      console.log('Created new compound index with yearLevel, section, and major');
    } else {
      console.log('No index found with just yearLevel and section');
      
      // Create the new index anyway
      await db.collection('classes').createIndex(
        { yearLevel: 1, section: 1, major: 1 }, 
        { unique: true }
      );
      console.log('Created new compound index with yearLevel, section, and major');
    }
    
    // Verify the new indexes
    const updatedIndexes = await db.collection('classes').indexes();
    console.log('Updated indexes:', updatedIndexes);
    
    console.log('Index update completed successfully');
  } catch (error) {
    console.error('Error updating index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixClassIndex(); 