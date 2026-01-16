# College Admin Student Management API Documentation

## Overview

Complete CRUD APIs for managing students within a college. All endpoints are scoped to the authenticated College Admin's college.

**Base URL:** `/api/college-admin/students`

**Authentication:** JWT token required
**Authorization:** CollegeAdmin role only

---

## Endpoints

### 1. Create Student

**POST** `/api/college-admin/students`

Create a new student record in your college.

**Request Body:**

```json
{
  "name": "Ahmed Ali",
  "rollNumber": "123",
  "fatherName": "Muhammad Ali",
  "contactNumber": "03001234567",
  "cnic": "1234567890123",
  "email": "ahmed@example.com",
  "dateOfBirth": "2005-01-15",
  "gender": "Male",
  "address": "123 Main Street, Karachi",
  "programId": "507f1f77bcf86cd799439011",
  "sectionId": "507f1f77bcf86cd799439012",
  "enrollmentDate": "2024-01-15",
  "status": "Active",
  "createLoginAccount": true
}
```

**Required Fields:**

- `name` (2-100 chars)
- `rollNumber` (1-50 chars, unique per college)
- `fatherName` (2-100 chars)
- `programId` (MongoDB ID)
- `sectionId` (MongoDB ID)

**Optional Fields:**

- `contactNumber` (Pakistani phone format)
- `cnic` (13 digits or formatted: 12345-1234567-1)
- `email` (valid email)
- `dateOfBirth` (ISO date)
- `gender` (Male, Female, Other)
- `address` (max 500 chars)
- `enrollmentDate` (ISO date, defaults to now)
- `status` (Active, Inactive, Graduated, Dropped - defaults to Active)
- `createLoginAccount` (boolean, defaults to false)

**Success Response (201):**

```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "student": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Ahmed Ali",
      "rollNumber": "123",
      "fatherName": "Muhammad Ali",
      "contactNumber": "03001234567",
      "cnic": "1234567890123",
      "email": "ahmed@example.com",
      "collegeId": {...},
      "programId": {...},
      "sectionId": {...},
      "userId": "507f1f77bcf86cd799439014",
      "status": "Active",
      "enrollmentDate": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    "credentials": {
      "loginEmail": "123@collegecode.edu.pk",
      "password": "generated12char"
    }
  }
}
```

**Notes:**

- If `createLoginAccount` is `true`, a user account is created with auto-generated email (format: rollnumber@collegecode.edu.pk)
- Roll number must be unique within your college
- Program and Section must belong to your college

---

### 2. Get All Students

**GET** `/api/college-admin/students?page=1&limit=50&programId=xxx&sectionId=xxx&status=Active`

Retrieve all students in your college with pagination and optional filters.

**Query Parameters:**

- `page` (optional, default: 1, min: 1)
- `limit` (optional, default: 50, min: 1, max: 100)
- `programId` (optional, MongoDB ID)
- `sectionId` (optional, MongoDB ID)
- `status` (optional: Active, Inactive, Graduated, Dropped)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Ahmed Ali",
        "rollNumber": "123",
        "fatherName": "Muhammad Ali",
        "contactNumber": "03001234567",
        "collegeId": {...},
        "programId": {...},
        "sectionId": {...},
        "status": "Active"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 50,
      "pages": 3
    }
  }
}
```

---

### 3. Search Students

**GET** `/api/college-admin/students/search?query=ahmed&page=1&limit=50`

Fuzzy search students across multiple fields.

**Query Parameters:**

- `query` (required, 1-100 chars)
- `page` (optional, default: 1)
- `limit` (optional, default: 50, max: 100)

**Search Fields:**

- Name
- Roll Number
- Email
- CNIC
- Father Name
- Contact Number

**Success Response (200):**

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "students": [...],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 50,
      "pages": 1
    }
  }
}
```

---

### 4. Get Student by ID

**GET** `/api/college-admin/students/:studentId`

Retrieve detailed information about a specific student.

**URL Parameters:**

- `studentId` (MongoDB ID)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Ahmed Ali",
    "rollNumber": "123",
    "fatherName": "Muhammad Ali",
    "contactNumber": "03001234567",
    "cnic": "1234567890123",
    "email": "ahmed@example.com",
    "dateOfBirth": "2005-01-15T00:00:00.000Z",
    "gender": "Male",
    "address": "123 Main Street, Karachi",
    "collegeId": {...},
    "programId": {...},
    "sectionId": {...},
    "userId": {...},
    "status": "Active",
    "enrollmentDate": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Student not found"
}
```

---

### 5. Update Student

**PUT** `/api/college-admin/students/:studentId`

Update student information.

**URL Parameters:**

- `studentId` (MongoDB ID)

**Request Body:** (all fields optional)

```json
{
  "name": "Ahmed Ali Updated",
  "contactNumber": "03009876543",
  "email": "newemail@example.com",
  "programId": "507f1f77bcf86cd799439015",
  "sectionId": "507f1f77bcf86cd799439016",
  "status": "Graduated"
}
```

**Allowed Update Fields:**

- All fields from create (except collegeId, userId)

**Restricted Fields:**

- `collegeId` (cannot be changed)
- `userId` (cannot be changed)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Ahmed Ali Updated",
    ...updated fields
  }
}
```

**Notes:**

- If updating roll number, it must still be unique within your college
- If updating program/section, they must belong to your college

---

### 6. Delete Student

**DELETE** `/api/college-admin/students/:studentId`

Soft delete a student (sets isActive to false).

**URL Parameters:**

- `studentId` (MongoDB ID)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Student deleted successfully",
  "data": {
    "studentId": "507f1f77bcf86cd799439013"
  }
}
```

**Notes:**

- This is a soft delete - student record is not removed from database
- Student will no longer appear in listings

---

### 7. Bulk Import Students

**POST** `/api/college-admin/students/bulk-import`

Import multiple students at once.

**Request Body:**

```json
{
  "students": [
    {
      "name": "Ahmed Ali",
      "rollNumber": "123",
      "fatherName": "Muhammad Ali",
      "contactNumber": "03001234567",
      "cnic": "1234567890123",
      "email": "ahmed@example.com",
      "dateOfBirth": "2005-01-15",
      "gender": "Male",
      "programId": "507f1f77bcf86cd799439011",
      "sectionId": "507f1f77bcf86cd799439012",
      "status": "Active"
    },
    {
      "name": "Sara Khan",
      "rollNumber": "124",
      "fatherName": "Imran Khan",
      "programId": "507f1f77bcf86cd799439011",
      "sectionId": "507f1f77bcf86cd799439012"
    }
  ],
  "createLoginAccounts": false
}
```

**Constraints:**

- Minimum: 1 student
- Maximum: 500 students per request
- Each student must have: name, rollNumber, fatherName, programId, sectionId

**Success Response (200):**

```json
{
  "success": true,
  "message": "Bulk import completed",
  "data": {
    "summary": {
      "total": 2,
      "successful": 1,
      "failed": 1
    },
    "results": {
      "successful": [
        {
          "row": 1,
          "studentId": "507f1f77bcf86cd799439013",
          "name": "Ahmed Ali",
          "rollNumber": "123",
          "credentials": {
            "loginEmail": "123@collegecode.edu.pk",
            "password": "generated12char"
          }
        }
      ],
      "failed": [
        {
          "row": 2,
          "data": {...},
          "error": "Roll number 124 already exists"
        }
      ]
    }
  }
}
```

**Notes:**

- Import continues even if some students fail
- Each failure includes row number and error reason
- If `createLoginAccounts` is true, user accounts are created for all successful imports

---

### 8. Export Students

**GET** `/api/college-admin/students/export?programId=xxx&sectionId=xxx`

Export students to CSV format.

**Query Parameters:**

- `programId` (optional, MongoDB ID)
- `sectionId` (optional, MongoDB ID)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Students exported successfully",
  "data": [
    {
      "rollNumber": "123",
      "name": "Ahmed Ali",
      "fatherName": "Muhammad Ali",
      "contactNumber": "03001234567",
      "cnic": "1234567890123",
      "email": "ahmed@example.com",
      "loginEmail": "123@collegecode.edu.pk",
      "program": "F.Sc. Pre-Engineering",
      "programCode": "FSC-PE",
      "section": "1st Year - A",
      "year": "1st Year",
      "shift": "1st Shift",
      "status": "Active",
      "enrollmentDate": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

**Notes:**

- Returns all students (no pagination)
- Can filter by program and/or section
- Includes populated program and section details
- Suitable for CSV conversion on frontend

---

## Common Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Roll number 123 already exists in your college"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Student not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to retrieve students"
}
```

---

## Features Summary

✅ **Full CRUD Operations** - Create, Read, Update, Delete (soft)
✅ **College Scoping** - All operations automatically scoped to admin's college
✅ **Pagination** - Efficient data loading with customizable page size
✅ **Fuzzy Search** - Search across 6 fields: name, roll number, email, CNIC, father name, contact
✅ **Filtering** - Filter by program, section, and status
✅ **Bulk Import** - Import up to 500 students at once
✅ **Export** - Export student data for CSV conversion
✅ **Optional User Accounts** - Create login accounts for students
✅ **Auto Email Generation** - Format: rollnumber@collegecode.edu.pk
✅ **Validation** - Comprehensive input validation using express-validator
✅ **Error Handling** - Detailed error messages for debugging
✅ **Optimized Queries** - Using MongoDB indexes and lean() for performance

---

## Data Model

**Student Schema:**

```javascript
{
  name: String (required),
  rollNumber: String (required, unique per college),
  fatherName: String (required),
  contactNumber: String (optional),
  cnic: String (optional),
  email: String (optional),
  dateOfBirth: Date (optional),
  gender: String (optional: Male, Female, Other),
  address: String (optional),
  collegeId: ObjectId (required, ref: College),
  programId: ObjectId (required, ref: Program),
  sectionId: ObjectId (required, ref: Section),
  userId: ObjectId (optional, ref: User),
  enrollmentDate: Date (default: now),
  status: String (default: Active, enum: Active, Inactive, Graduated, Dropped),
  isActive: Boolean (default: true)
}
```

**Indexes:**

- Compound unique: `{ collegeId: 1, rollNumber: 1 }`
- Query optimization: `{ collegeId: 1, sectionId: 1, isActive: 1 }`
- Program queries: `{ collegeId: 1, programId: 1, isActive: 1 }`

---

## Testing Examples

### Create Student with Login Account

```bash
curl -X POST http://localhost:5000/api/college-admin/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Ali",
    "rollNumber": "123",
    "fatherName": "Muhammad Ali",
    "contactNumber": "03001234567",
    "programId": "507f1f77bcf86cd799439011",
    "sectionId": "507f1f77bcf86cd799439012",
    "createLoginAccount": true
  }'
```

### Search Students

```bash
curl -X GET "http://localhost:5000/api/college-admin/students/search?query=ahmed&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Bulk Import

```bash
curl -X POST http://localhost:5000/api/college-admin/students/bulk-import \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "students": [
      {
        "name": "Ahmed Ali",
        "rollNumber": "123",
        "fatherName": "Muhammad Ali",
        "programId": "507f1f77bcf86cd799439011",
        "sectionId": "507f1f77bcf86cd799439012"
      }
    ],
    "createLoginAccounts": false
  }'
```

### Export Students

```bash
curl -X GET "http://localhost:5000/api/college-admin/students/export?programId=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
