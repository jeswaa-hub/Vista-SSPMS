const mongoose = require('mongoose');

const SystemOptionSchema = new mongoose.Schema({
  class: {
    yearLevels: {
      type: [String],
      default: ['2nd', '3rd', '4th']
    },
    majors: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        '2nd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
        '3rd': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security'],
        '4th': ['Business Informatics', 'System Development', 'Digital Arts', 'Computer Security']
      }
    },
    defaultSessions: {
      type: [{
        title: String,
        count: Number
      }],
      default: [
        { title: 'INTRODUCTION', count: 0 },
        { title: 'ORIENTATION', count: 0 }
      ]
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        '2nd': ['South-1', 'South-2', 'South-3', 'South-4', 'South-5'],
        '3rd': ['South-1', 'South-2', 'South-3'],
        '4th': ['South-1', 'South-2']
      }
    },
    rooms: {
      type: [String],
      default: ['301', '302', '303', '304', '401', '402', '403', '404']
    }
  },
  subject: {
    yearLevels: {
      type: [String],
      default: ['1st', '2nd', '3rd', '4th']
    },
    schoolYear: {
      type: String,
      default: '2025 - 2026'
    },
    defaultZeroDayTitle: {
      type: String,
      default: 'INTRODUCTION'
    },
    hoursOptions: {
      type: [Number],
      default: [1, 2, 3]
    },
    examSessionDays: {
      type: [{
        name: String,
        day: Number
      }],
      default: [
        { name: 'Prelim Exam', day: 5 },
        { name: 'Midterm Exam', day: 10 },
        { name: 'Final Exam', day: 15 }
      ]
    }
  },
  consultation: {
    fixedDuration: {
      type: Number,
      default: 3,
      min: 1,
      max: 8
    },
    businessHours: {
      start: {
        type: Number,
        default: 7,
        min: 6,
        max: 12
      },
      end: {
        type: Number,
        default: 18,
        min: 17,
        max: 22
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to handle conversion from legacy majors format
SystemOptionSchema.pre('save', function(next) {
  // Check if majors is an array (legacy format)
  if (this.class && Array.isArray(this.class.majors)) {
    const majorsArray = [...this.class.majors];
    
    // Convert to object with majors per year level
    const majorsObject = {};
    if (this.class.yearLevels && this.class.yearLevels.length > 0) {
      this.class.yearLevels.forEach(yearLevel => {
        majorsObject[yearLevel] = [...majorsArray];
      });
      
      this.class.majors = majorsObject;
    }
  }
  
  // Ensure rooms array exists
  if (this.class && !this.class.rooms) {
    this.class.rooms = ['301', '302', '303', '304', '401', '402', '403', '404'];
  }
  
  next();
});

module.exports = mongoose.model('SystemOption', SystemOptionSchema);
