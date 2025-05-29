# SSPMS Data Migration Scripts

## Semester Data Migration

The `migrateSemesterData.js` script updates the class and student data to work with the new model that handles both first and second semester in a single class record.

### Changes Made

1. **Class Model**:
   - Added `firstSemester` and `secondSemester` nested objects to store semester-specific data
   - Each semester contains its own subject, schedule, room, and hours

2. **Student Model**:
   - Added `semesterData` with nested `firstSemester` and `secondSemester` objects
   - Each semester tracks completion status and sessions completed

### How to Run the Migration

To migrate existing data to the new model, run:

```bash
npm run migrate:semester-data
```

This will:
1. Find all classes without semester data
2. Determine if each class is first or second semester based on subject
3. Add appropriate semester data to each class
4. Pair first and second semester classes with the same year, section, and major

### Manual Setup

If you prefer not to run the migration script, you can manually add both semesters when creating a new class. The new model allows both semesters to be stored in a single record.

### Benefits of the New Model

- Single record for a class across both semesters
- Simplified student assignment (one class record for the whole year)
- Better tracking of student progress across semesters
- Easier reporting and analysis