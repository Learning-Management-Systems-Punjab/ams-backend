# Student Roll Number - Composite Key Uniqueness

## Overview

The student model uses a **composite key uniqueness** constraint, not a simple unique constraint on roll number alone.

## Implementation

### Database Index

```javascript
studentSchema.index({ collegeId: 1, rollNumber: 1 }, { unique: true });
```

This creates a compound unique index that ensures:

- ✅ **Two different colleges CAN have students with the same roll number**
- ✅ **Within the same college, roll numbers MUST be unique**

## Example Scenarios

### ✅ Allowed (Valid)

```javascript
// College A - Student with roll number "2024-CS-001"
{
  collegeId: "65abc...",
  rollNumber: "2024-CS-001",
  name: "John Doe"
}

// College B - Student with SAME roll number "2024-CS-001"
{
  collegeId: "65xyz...",
  rollNumber: "2024-CS-001",
  name: "Jane Smith"
}
```

✅ **This is valid** - Different colleges can use the same roll number format.

### ❌ Not Allowed (Duplicate)

```javascript
// College A - First student
{
  collegeId: "65abc...",
  rollNumber: "2024-CS-001",
  name: "John Doe"
}

// College A - Second student with SAME roll number
{
  collegeId: "65abc...",
  rollNumber: "2024-CS-001",  // ❌ Duplicate in same college
  name: "Jane Smith"
}
```

❌ **This will fail** - Same roll number within the same college is not allowed.

## Database Migration

If you previously had a unique index on `rollNumber` alone, you need to run the migration script to fix it.

### Run Migration

**For Staging:**

```bash
npm run migrate:fix-rollnumber
```

**For Production:**

```bash
npm run migrate:fix-rollnumber:prod
```

### What the Migration Does

1. **Checks existing indexes** on the students collection
2. **Drops old unique index** on `rollNumber` alone (if it exists)
3. **Creates compound unique index** on `collegeId` + `rollNumber`
4. **Displays summary** of all indexes

### Migration Output Example

```
📊 Checking existing indexes...
Current indexes:
  - _id_: {"_id":1}
  - rollNumber_1: {"rollNumber":1}  (unique: true)  ← Will be dropped
  - collegeId_1_rollNumber_1: {"collegeId":1,"rollNumber":1}

⚠️  Found problematic unique index on rollNumber alone: rollNumber_1
🗑️  Dropping index...
✅ Index dropped successfully

✅ Compound unique index already exists: collegeId_1_rollNumber_1

📊 Final indexes:
  - _id_: {"_id":1}
  - collegeId_1_rollNumber_1: {"collegeId":1,"rollNumber":1}
    (unique: true)

✅ Migration completed successfully!
```

## API Validation

When creating or updating students, the API should validate:

1. **Roll number is required**
2. **College ID is required**
3. **Combination must be unique** (handled by database)

### Error Handling

When a duplicate roll number is attempted within the same college:

```javascript
// MongoDB Error Code 11000 (Duplicate Key Error)
{
  code: 11000,
  keyPattern: { collegeId: 1, rollNumber: 1 },
  keyValue: { collegeId: "65abc...", rollNumber: "2024-CS-001" }
}
```

The API should catch this and return a user-friendly message:

```javascript
{
  success: false,
  message: "Student with this roll number already exists in this college"
}
```

## Benefits

### 1. Multi-Tenancy Support

Each college can manage their own roll number scheme without conflicts.

### 2. Independent Roll Number Schemes

- College A can use: `2024-CS-001`, `2024-CS-002`, etc.
- College B can use: `CS-2024-001`, `CS-2024-002`, etc.
- Both schemes can coexist without issues

### 3. Data Integrity

Roll numbers remain unique within each college, preventing duplicate student records.

## Queries

### Find Student by Roll Number (Requires College)

```javascript
const student = await Student.findOne({
  collegeId: req.user.collegeId,
  rollNumber: "2024-CS-001",
});
```

### Check if Roll Number Exists (Within College)

```javascript
const exists = await Student.exists({
  collegeId: collegeId,
  rollNumber: rollNumber,
});
```

## Testing

### Test Case 1: Different Colleges, Same Roll Number

```javascript
// Create student in College A
const studentA = await Student.create({
  collegeId: collegeA._id,
  rollNumber: "2024-001",
  name: "Student A",
  // ... other fields
});

// Create student in College B with SAME roll number
const studentB = await Student.create({
  collegeId: collegeB._id,
  rollNumber: "2024-001", // Same roll number, different college
  name: "Student B",
  // ... other fields
});

// ✅ Both should succeed
```

### Test Case 2: Same College, Duplicate Roll Number

```javascript
// Create first student in College A
const student1 = await Student.create({
  collegeId: collegeA._id,
  rollNumber: "2024-001",
  name: "Student 1",
});

// Try to create another student in same college with same roll number
try {
  const student2 = await Student.create({
    collegeId: collegeA._id,
    rollNumber: "2024-001", // Duplicate in same college
    name: "Student 2",
  });
  // ❌ Should not reach here
} catch (error) {
  // ✅ Should throw duplicate key error (code 11000)
  console.log(error.code === 11000); // true
}
```

## Summary

- ✅ Roll number uniqueness is **scoped to college level**
- ✅ Different colleges **can** have the same roll numbers
- ✅ Within same college, roll numbers **must** be unique
- ✅ Use composite key index: `{ collegeId, rollNumber }`
- ✅ Run migration if upgrading from old schema

## Related Files

- **Model**: `src/models/student.js`
- **Migration**: `Migrations/fix-student-rollnumber-index.js`
- **DAL**: `src/dal/student.dal.js`
