# Teacher Portal - Complete UI Integration & Behavior Guide

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Teacher Scoping Rules](#teacher-scoping-rules)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [User Interface Specifications](#user-interface-specifications)
6. [Screen-by-Screen Implementation](#screen-by-screen-implementation)
7. [Code Examples](#code-examples)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)

---

## Overview

The Teacher Portal is designed specifically for teachers to manage their assigned classes and mark attendance. Unlike the College Admin portal, teachers have restricted access and can only:

- View sections and subjects they are assigned to teach
- View students in their assigned sections
- Mark attendance only for their assigned section+subject combinations
- View statistics for their own classes

**Key Principles:**

- **Assignment-Based Scoping**: All operations validate that the teacher is assigned to the specific section+subject
- **Read-Only Access**: Teachers cannot create/delete subjects or sections
- **College-Scoped**: Teachers only see data from their own college
- **Real-Time Validation**: Every operation validates permissions before execution

---

## Authentication & Authorization

### Login Flow

```javascript
// Teacher Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@college.edu",
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "teacher123",
      "email": "teacher@college.edu",
      "role": "Teacher",
      "collegeId": "college456",
      "firstName": "John",
      "lastName": "Smith"
    }
  }
}
```

### Token Storage

```javascript
// Store token in localStorage
localStorage.setItem("teacherToken", response.data.token);
localStorage.setItem("teacherData", JSON.stringify(response.data.user));

// Set Authorization header for all requests
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
```

### Protected Routes

All teacher portal routes require:

- Valid JWT token in Authorization header
- `role: "Teacher"` in token payload
- `collegeId` in token payload

**Middleware**: `isTeacher` validates these requirements on every request

---

## Teacher Scoping Rules

### Two-Level Scoping System

#### 1. College-Level Scoping

- Teacher can ONLY see data from their own college
- `collegeId` extracted from JWT token
- Cannot access other colleges' data

#### 2. Assignment-Level Scoping

- Teacher can ONLY see sections and subjects they're assigned to teach
- Validated via `TeacherAssignment` model
- Every operation checks: "Is this teacher assigned to this section+subject?"

### Permission Matrix

| Operation               | Requires Assignment            | Validation                                   |
| ----------------------- | ------------------------------ | -------------------------------------------- |
| Get My Assignments      | ✅ (Implicit)                  | Teacher must have assignments                |
| Get My Sections         | ✅ (Implicit)                  | Extracts from assignments                    |
| Get My Subjects         | ✅ (Implicit)                  | Extracts from assignments                    |
| Get Students in Section | ✅ Assigned to section         | Any subject for that section                 |
| Mark Attendance         | ✅ Assigned to section+subject | Must match both                              |
| View Attendance         | ✅ Assigned to section+subject | Must match both                              |
| Student Stats           | ✅ Assigned to subject         | Student must be in a section teacher teaches |
| Section Stats           | ✅ Assigned to section+subject | Must match both                              |

---

## API Endpoints Reference

### Base URL

```
http://localhost:3000/api/teacher-portal
```

All endpoints require `Authorization: Bearer <token>` header.

### 1. Get My Assignments

```http
GET /api/teacher-portal/my-assignments?page=1&limit=50
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response:**

```json
{
  "success": true,
  "message": "Assignments retrieved successfully",
  "data": {
    "assignments": [
      {
        "_id": "assignment123",
        "teacher": {
          "_id": "teacher123",
          "firstName": "John",
          "lastName": "Smith"
        },
        "section": {
          "_id": "section456",
          "name": "CS-A",
          "semester": 3,
          "year": 2024
        },
        "subject": {
          "_id": "subject789",
          "name": "Data Structures",
          "code": "CS201"
        },
        "assignedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "perPage": 50,
      "totalPages": 1,
      "totalItems": 5
    }
  }
}
```

**Usage:** Display teacher's schedule/timetable

---

### 2. Get My Sections

```http
GET /api/teacher-portal/my-sections
```

**Response:**

```json
{
  "success": true,
  "message": "Sections retrieved successfully",
  "data": [
    {
      "_id": "section456",
      "name": "CS-A",
      "semester": 3,
      "year": 2024,
      "rollNumberRanges": [{ "start": "CS-2024-001", "end": "CS-2024-050" }],
      "college": "college456"
    },
    {
      "_id": "section789",
      "name": "CS-B",
      "semester": 3,
      "year": 2024,
      "rollNumberRanges": [{ "start": "CS-2024-051", "end": "CS-2024-100" }],
      "college": "college456"
    }
  ]
}
```

**Usage:** Section dropdown for attendance marking

---

### 3. Get My Subjects

```http
GET /api/teacher-portal/my-subjects
```

**Response:**

```json
{
  "success": true,
  "message": "Subjects retrieved successfully",
  "data": [
    {
      "_id": "subject789",
      "name": "Data Structures",
      "code": "CS201",
      "college": "college456"
    },
    {
      "_id": "subject101",
      "name": "Algorithms",
      "code": "CS301",
      "college": "college456"
    }
  ]
}
```

**Usage:** Subject dropdown for attendance marking

---

### 4. Get Students in My Section

```http
GET /api/teacher-portal/sections/:sectionId/students
```

**Path Parameters:**

- `sectionId`: MongoDB ObjectId of the section

**Response:**

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    {
      "_id": "student123",
      "rollNumber": "CS-2024-001",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice@college.edu",
      "section": "section456",
      "college": "college456"
    },
    {
      "_id": "student456",
      "rollNumber": "CS-2024-002",
      "firstName": "Bob",
      "lastName": "Williams",
      "email": "bob@college.edu",
      "section": "section456",
      "college": "college456"
    }
  ]
}
```

**Error Cases:**

- `404`: Section not found
- `403`: "You are not assigned to teach this section"

**Usage:** Display student list for a selected section

---

### 5. Generate Attendance Sheet

```http
GET /api/teacher-portal/attendance/sheet?sectionId=xxx&subjectId=xxx
```

**Query Parameters:**

- `sectionId` (required): MongoDB ObjectId
- `subjectId` (required): MongoDB ObjectId

**Response:**

```json
{
  "success": true,
  "message": "Attendance sheet generated successfully",
  "data": {
    "section": {
      "_id": "section456",
      "name": "CS-A",
      "semester": 3,
      "year": 2024
    },
    "subject": {
      "_id": "subject789",
      "name": "Data Structures",
      "code": "CS201"
    },
    "students": [
      {
        "_id": "student123",
        "rollNumber": "CS-2024-001",
        "name": "Alice Johnson",
        "email": "alice@college.edu"
      },
      {
        "_id": "student456",
        "rollNumber": "CS-2024-002",
        "name": "Bob Williams",
        "email": "bob@college.edu"
      }
    ]
  }
}
```

**Error Cases:**

- `404`: Section not found
- `403`: "You are not assigned to teach this subject for this section"

**Usage:** Generate pre-filled form for marking attendance

---

### 6. Mark Attendance

```http
POST /api/teacher-portal/attendance/mark
Content-Type: application/json
```

**Request Body:**

```json
{
  "sectionId": "section456",
  "subjectId": "subject789",
  "date": "2024-01-16",
  "period": 1,
  "attendanceRecords": [
    {
      "studentId": "student123",
      "status": "Present"
    },
    {
      "studentId": "student456",
      "status": "Absent"
    },
    {
      "studentId": "student789",
      "status": "Late"
    }
  ]
}
```

**Validation Rules:**

- `sectionId`: Required, valid MongoDB ObjectId
- `subjectId`: Required, valid MongoDB ObjectId
- `date`: Required, ISO 8601 format (YYYY-MM-DD)
- `period`: Required, integer 1-10
- `attendanceRecords`: Required, non-empty array
- `status`: One of: "Present", "Absent", "Late", "Excused"

**Response:**

```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": [
    {
      "_id": "attendance123",
      "student": "student123",
      "section": "section456",
      "subject": "subject789",
      "date": "2024-01-16T00:00:00.000Z",
      "period": 1,
      "status": "Present",
      "markedBy": "teacher123"
    }
  ]
}
```

**Error Cases:**

- `403`: "You are not assigned to teach this subject for this section"
- `409`: "Attendance has already been marked for this section, subject, date, and period"
- `404`: Section not found

**Usage:** Submit attendance form

---

### 7. Get Attendance by Date

```http
GET /api/teacher-portal/attendance?sectionId=xxx&subjectId=xxx&date=2024-01-16&period=1
```

**Query Parameters:**

- `sectionId` (required): MongoDB ObjectId
- `subjectId` (required): MongoDB ObjectId
- `date` (required): ISO 8601 date (YYYY-MM-DD)
- `period` (required): Integer 1-10

**Response:**

```json
{
  "success": true,
  "message": "Attendance retrieved successfully",
  "data": [
    {
      "_id": "attendance123",
      "student": {
        "_id": "student123",
        "rollNumber": "CS-2024-001",
        "firstName": "Alice",
        "lastName": "Johnson"
      },
      "section": "section456",
      "subject": "subject789",
      "date": "2024-01-16T00:00:00.000Z",
      "period": 1,
      "status": "Present",
      "markedBy": {
        "_id": "teacher123",
        "firstName": "John",
        "lastName": "Smith"
      }
    }
  ]
}
```

**Usage:** View previously marked attendance

---

### 8. Get Student Attendance Stats

```http
GET /api/teacher-portal/attendance/stats/student/:studentId?subjectId=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Path Parameters:**

- `studentId`: MongoDB ObjectId

**Query Parameters:**

- `subjectId` (required): MongoDB ObjectId
- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date

**Response:**

```json
{
  "success": true,
  "message": "Student attendance stats retrieved successfully",
  "data": {
    "student": {
      "_id": "student123",
      "rollNumber": "CS-2024-001",
      "firstName": "Alice",
      "lastName": "Johnson"
    },
    "subject": {
      "_id": "subject789",
      "name": "Data Structures",
      "code": "CS201"
    },
    "totalClasses": 20,
    "present": 18,
    "absent": 2,
    "late": 0,
    "excused": 0,
    "attendancePercentage": 90.0
  }
}
```

**Error Cases:**

- `403`: "You are not assigned to teach this subject"

**Usage:** Individual student performance report

---

### 9. Get Section Attendance Stats

```http
GET /api/teacher-portal/attendance/stats/section/:sectionId?subjectId=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Path Parameters:**

- `sectionId`: MongoDB ObjectId

**Query Parameters:**

- `subjectId` (required): MongoDB ObjectId
- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date

**Response:**

```json
{
  "success": true,
  "message": "Section attendance stats retrieved successfully",
  "data": {
    "section": {
      "_id": "section456",
      "name": "CS-A",
      "semester": 3,
      "year": 2024
    },
    "subject": {
      "_id": "subject789",
      "name": "Data Structures",
      "code": "CS201"
    },
    "totalClasses": 20,
    "averageAttendance": 85.5,
    "studentStats": [
      {
        "student": {
          "_id": "student123",
          "rollNumber": "CS-2024-001",
          "name": "Alice Johnson"
        },
        "present": 18,
        "absent": 2,
        "late": 0,
        "excused": 0,
        "attendancePercentage": 90.0
      }
    ]
  }
}
```

**Usage:** Class-wide attendance report

---

## User Interface Specifications

### Design Principles

1. **Simple & Clear**: Teachers need quick access to mark attendance
2. **Mobile-First**: Many teachers use tablets/phones for attendance
3. **Offline Support**: Consider offline marking with sync later
4. **Quick Navigation**: 2-3 clicks to mark attendance

### Color Scheme

```css
:root {
  --teacher-primary: #2563eb; /* Blue for teacher actions */
  --teacher-secondary: #64748b; /* Gray for secondary elements */
  --present: #10b981; /* Green for present */
  --absent: #ef4444; /* Red for absent */
  --late: #f59e0b; /* Orange for late */
  --excused: #8b5cf6; /* Purple for excused */
  --background: #f8fafc; /* Light background */
  --card: #ffffff; /* White cards */
  --text-primary: #1e293b; /* Dark text */
  --text-secondary: #64748b; /* Gray text */
}
```

### Typography

```css
/* Headings */
h1 {
  font-size: 24px;
  font-weight: 700;
}
h2 {
  font-size: 20px;
  font-weight: 600;
}
h3 {
  font-size: 18px;
  font-weight: 600;
}

/* Body */
body {
  font-size: 14px;
  line-height: 1.5;
}

/* Small text */
.text-sm {
  font-size: 12px;
}
.text-xs {
  font-size: 11px;
}
```

---

## Screen-by-Screen Implementation

### 1. Dashboard / Home Screen

**Purpose:** Overview of teacher's schedule and quick actions

**Layout:**

```
┌─────────────────────────────────────────────┐
│ Teacher Portal              [Profile] [Logout]
├─────────────────────────────────────────────┤
│ Welcome back, John Smith!                    │
├─────────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐           │
│ │ Mark        │  │ View        │           │
│ │ Attendance  │  │ My Classes  │           │
│ └─────────────┘  └─────────────┘           │
├─────────────────────────────────────────────┤
│ Today's Schedule                             │
│ ┌─────────────────────────────────────────┐│
│ │ Period 1 (9:00 AM)                      ││
│ │ CS-A • Data Structures (CS201)          ││
│ │ [Mark Attendance]                       ││
│ ├─────────────────────────────────────────┤│
│ │ Period 2 (10:00 AM)                     ││
│ │ CS-B • Algorithms (CS301)               ││
│ │ [Mark Attendance]                       ││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**API Calls:**

1. `GET /api/teacher-portal/my-assignments` (on page load)
2. Filter by today's date (if assignment has schedule data)

**React Component Structure:**

```jsx
<TeacherDashboard>
  <Header />
  <WelcomeBanner name={user.firstName} />
  <QuickActions>
    <ActionCard title="Mark Attendance" onClick={navigateToMarkAttendance} />
    <ActionCard title="View My Classes" onClick={navigateToClasses} />
  </QuickActions>
  <TodaysSchedule assignments={todaysAssignments} />
</TeacherDashboard>
```

---

### 2. My Assignments Screen

**Purpose:** View all sections and subjects assigned to teacher

**Layout:**

```
┌─────────────────────────────────────────────┐
│ ← Back    My Assignments                     │
├─────────────────────────────────────────────┤
│ [Search...] [Filter by Section] [Subject]   │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐│
│ │ CS-A • Semester 3                       ││
│ │ Data Structures (CS201)                 ││
│ │ [View Students] [Mark Attendance]       ││
│ ├─────────────────────────────────────────┤│
│ │ CS-A • Semester 3                       ││
│ │ Algorithms (CS301)                      ││
│ │ [View Students] [Mark Attendance]       ││
│ ├─────────────────────────────────────────┤│
│ │ CS-B • Semester 3                       ││
│ │ Data Structures (CS201)                 ││
│ │ [View Students] [Mark Attendance]       ││
│ └─────────────────────────────────────────┘│
│ Page 1 of 2                  [Next →]       │
└─────────────────────────────────────────────┘
```

**API Calls:**

- `GET /api/teacher-portal/my-assignments?page=1&limit=20`

**React Component:**

```jsx
import { useState, useEffect } from "react";
import axios from "axios";

function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAssignments();
  }, [page]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/teacher-portal/my-assignments?page=${page}&limit=20`
      );
      setAssignments(response.data.data.assignments);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assignments-container">
      <header>
        <button onClick={() => navigate(-1)}>← Back</button>
        <h1>My Assignments</h1>
      </header>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="assignments-list">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                section={assignment.section}
                subject={assignment.subject}
                onViewStudents={() =>
                  handleViewStudents(assignment.section._id)
                }
                onMarkAttendance={() => handleMarkAttendance(assignment)}
              />
            ))}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
```

---

### 3. Mark Attendance Screen

**Purpose:** Main workflow for marking daily attendance

**Step 1: Select Section & Subject**

```
┌─────────────────────────────────────────────┐
│ ← Back    Mark Attendance                    │
├─────────────────────────────────────────────┤
│ Step 1: Select Class Details                │
│                                              │
│ Section *                                    │
│ ┌─────────────────────────────────────────┐│
│ │ Select Section              ▼           ││
│ └─────────────────────────────────────────┘│
│                                              │
│ Subject *                                    │
│ ┌─────────────────────────────────────────┐│
│ │ Select Subject              ▼           ││
│ └─────────────────────────────────────────┘│
│                                              │
│ Date *                                       │
│ ┌─────────────────────────────────────────┐│
│ │ 2024-01-16                  📅          ││
│ └─────────────────────────────────────────┘│
│                                              │
│ Period *                                     │
│ ┌─────────────────────────────────────────┐│
│ │ Select Period               ▼           ││
│ └─────────────────────────────────────────┘│
│                                              │
│              [Continue →]                    │
└─────────────────────────────────────────────┘
```

**Step 2: Mark Students**

```
┌─────────────────────────────────────────────┐
│ ← Back    Mark Attendance                    │
├─────────────────────────────────────────────┤
│ CS-A • Data Structures (CS201)               │
│ Date: Jan 16, 2024 • Period 1               │
├─────────────────────────────────────────────┤
│ [Mark All Present] [Mark All Absent]        │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐│
│ │ CS-2024-001 • Alice Johnson             ││
│ │ ● Present  ○ Absent  ○ Late  ○ Excused ││
│ ├─────────────────────────────────────────┤│
│ │ CS-2024-002 • Bob Williams              ││
│ │ ○ Present  ● Absent  ○ Late  ○ Excused ││
│ ├─────────────────────────────────────────┤│
│ │ CS-2024-003 • Charlie Davis             ││
│ │ ○ Present  ○ Absent  ● Late  ○ Excused ││
│ └─────────────────────────────────────────┘│
│                                              │
│ Present: 25 | Absent: 3 | Late: 2 | Excused: 0
│                                              │
│ [Cancel]              [Submit Attendance]    │
└─────────────────────────────────────────────┘
```

**Implementation:**

```jsx
import { useState, useEffect } from "react";
import axios from "axios";

function MarkAttendance() {
  const [step, setStep] = useState(1);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  // Form state
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    // Fetch sections and subjects
    fetchSectionsAndSubjects();
  }, []);

  const fetchSectionsAndSubjects = async () => {
    try {
      const [sectionsRes, subjectsRes] = await Promise.all([
        axios.get("/api/teacher-portal/my-sections"),
        axios.get("/api/teacher-portal/my-subjects"),
      ]);

      setSections(sectionsRes.data.data);
      setSubjects(subjectsRes.data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleContinue = async () => {
    if (
      !selectedSection ||
      !selectedSubject ||
      !selectedDate ||
      !selectedPeriod
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // Generate attendance sheet
      const response = await axios.get(
        `/api/teacher-portal/attendance/sheet?sectionId=${selectedSection}&subjectId=${selectedSubject}`
      );

      const sheet = response.data.data;

      // Initialize attendance records with default "Present" status
      const records = sheet.students.map((student) => ({
        studentId: student._id,
        rollNumber: student.rollNumber,
        name: student.name,
        status: "Present", // Default to Present
      }));

      setStudents(sheet.students);
      setAttendanceRecords(records);
      setStep(2);
    } catch (error) {
      if (error.response?.status === 403) {
        alert("You are not assigned to teach this subject for this section");
      } else {
        alert("Error loading students: " + error.message);
      }
    }
  };

  const updateAttendanceStatus = (studentId, status) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const markAllPresent = () => {
    setAttendanceRecords((prev) =>
      prev.map((record) => ({ ...record, status: "Present" }))
    );
  };

  const markAllAbsent = () => {
    setAttendanceRecords((prev) =>
      prev.map((record) => ({ ...record, status: "Absent" }))
    );
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        sectionId: selectedSection,
        subjectId: selectedSubject,
        date: selectedDate,
        period: parseInt(selectedPeriod),
        attendanceRecords: attendanceRecords.map((r) => ({
          studentId: r.studentId,
          status: r.status,
        })),
      };

      const response = await axios.post(
        "/api/teacher-portal/attendance/mark",
        payload
      );

      alert("Attendance marked successfully!");
      // Navigate back or reset form
      navigate("/teacher/dashboard");
    } catch (error) {
      if (error.response?.status === 409) {
        alert("Attendance already marked for this class");
      } else if (error.response?.status === 403) {
        alert("You are not authorized to mark attendance for this class");
      } else {
        alert("Error marking attendance: " + error.message);
      }
    }
  };

  const getStats = () => {
    return {
      present: attendanceRecords.filter((r) => r.status === "Present").length,
      absent: attendanceRecords.filter((r) => r.status === "Absent").length,
      late: attendanceRecords.filter((r) => r.status === "Late").length,
      excused: attendanceRecords.filter((r) => r.status === "Excused").length,
    };
  };

  if (step === 1) {
    return (
      <div className="mark-attendance-step1">
        <header>
          <button onClick={() => navigate(-1)}>← Back</button>
          <h1>Mark Attendance</h1>
        </header>

        <div className="form-container">
          <h2>Step 1: Select Class Details</h2>

          <div className="form-group">
            <label>Section *</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.name} - Semester {section.semester}, {section.year}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="form-group">
            <label>Period *</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="">Select Period</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                <option key={period} value={period}>
                  Period {period}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-primary" onClick={handleContinue}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Mark attendance
  const stats = getStats();

  return (
    <div className="mark-attendance-step2">
      <header>
        <button onClick={() => setStep(1)}>← Back</button>
        <h1>Mark Attendance</h1>
      </header>

      <div className="class-info">
        <div>
          {sections.find((s) => s._id === selectedSection)?.name} •{" "}
          {subjects.find((s) => s._id === selectedSubject)?.name}
        </div>
        <div className="text-sm">
          Date: {new Date(selectedDate).toLocaleDateString()} • Period{" "}
          {selectedPeriod}
        </div>
      </div>

      <div className="quick-actions">
        <button onClick={markAllPresent}>Mark All Present</button>
        <button onClick={markAllAbsent}>Mark All Absent</button>
      </div>

      <div className="students-list">
        {attendanceRecords.map((record) => (
          <div key={record.studentId} className="student-card">
            <div className="student-info">
              <div className="student-name">{record.name}</div>
              <div className="student-roll">{record.rollNumber}</div>
            </div>

            <div className="attendance-options">
              {["Present", "Absent", "Late", "Excused"].map((status) => (
                <label key={status} className="radio-label">
                  <input
                    type="radio"
                    name={`attendance-${record.studentId}`}
                    value={status}
                    checked={record.status === status}
                    onChange={() =>
                      updateAttendanceStatus(record.studentId, status)
                    }
                  />
                  <span className={`status-${status.toLowerCase()}`}>
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="stats-summary">
        <div>Present: {stats.present}</div>
        <div>Absent: {stats.absent}</div>
        <div>Late: {stats.late}</div>
        <div>Excused: {stats.excused}</div>
      </div>

      <div className="form-actions">
        <button onClick={() => setStep(1)}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit}>
          Submit Attendance
        </button>
      </div>
    </div>
  );
}
```

---

### 4. View Attendance History Screen

**Purpose:** View previously marked attendance

**Layout:**

```
┌─────────────────────────────────────────────┐
│ ← Back    Attendance History                 │
├─────────────────────────────────────────────┤
│ Section:  [CS-A ▼]  Subject: [DS ▼]        │
│ Date:     [2024-01-16 📅]  Period: [1 ▼]   │
│ [Load Attendance]                            │
├─────────────────────────────────────────────┤
│ CS-A • Data Structures • Jan 16 • Period 1  │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐│
│ │ ✓ CS-2024-001 • Alice Johnson           ││
│ │   Present                                ││
│ ├─────────────────────────────────────────┤│
│ │ ✗ CS-2024-002 • Bob Williams            ││
│ │   Absent                                 ││
│ ├─────────────────────────────────────────┤│
│ │ ⏰ CS-2024-003 • Charlie Davis          ││
│ │   Late                                   ││
│ └─────────────────────────────────────────┘│
│ Present: 25 | Absent: 3 | Late: 2           │
└─────────────────────────────────────────────┘
```

**API Call:**

```javascript
const loadAttendance = async () => {
  try {
    const response = await axios.get(
      `/api/teacher-portal/attendance?sectionId=${sectionId}&subjectId=${subjectId}&date=${date}&period=${period}`
    );

    setAttendance(response.data.data);
  } catch (error) {
    if (error.response?.status === 404) {
      alert("No attendance found for this class");
    } else if (error.response?.status === 403) {
      alert("You are not assigned to this class");
    }
  }
};
```

---

### 5. Class Statistics Screen

**Purpose:** View attendance statistics for a section

**Layout:**

```
┌─────────────────────────────────────────────┐
│ ← Back    Class Statistics                   │
├─────────────────────────────────────────────┤
│ Section:  [CS-A ▼]  Subject: [DS ▼]        │
│ Period:   [Jan 1 📅] to [Jan 31 📅]         │
│ [Generate Report]                            │
├─────────────────────────────────────────────┤
│ CS-A • Data Structures                       │
│ Total Classes: 20 | Avg Attendance: 85.5%   │
├─────────────────────────────────────────────┤
│ 📊 Overall Statistics                        │
│ ┌─────────────────────────────────────────┐│
│ │ ██████████████████░░ 90% Present        ││
│ │ ███░ 5% Absent                          ││
│ │ ██░ 3% Late                             ││
│ │ █░ 2% Excused                           ││
│ └─────────────────────────────────────────┘│
├─────────────────────────────────────────────┤
│ 👥 Student-wise Statistics                  │
│ ┌─────────────────────────────────────────┐│
│ │ CS-2024-001 • Alice Johnson             ││
│ │ 18/20 classes (90%) ✓                   ││
│ ├─────────────────────────────────────────┤│
│ │ CS-2024-002 • Bob Williams              ││
│ │ 15/20 classes (75%) ⚠️                  ││
│ ├─────────────────────────────────────────┤│
│ │ CS-2024-003 • Charlie Davis             ││
│ │ 12/20 classes (60%) ⚠️ Low!             ││
│ └─────────────────────────────────────────┘│
│ [Export as PDF] [Export as Excel]           │
└─────────────────────────────────────────────┘
```

**API Call:**

```javascript
const fetchStats = async () => {
  try {
    const response = await axios.get(
      `/api/teacher-portal/attendance/stats/section/${sectionId}?subjectId=${subjectId}&startDate=${startDate}&endDate=${endDate}`
    );

    setStats(response.data.data);
  } catch (error) {
    console.error("Error:", error);
  }
};
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "sectionId",
      "message": "Invalid section ID"
    }
  ]
}
```

### Common Error Codes

#### 400 - Bad Request

**Cause:** Validation errors

```javascript
// Handle validation errors
if (error.response?.status === 400) {
  const errors = error.response.data.errors;
  errors.forEach((err) => {
    // Display field-specific errors
    showFieldError(err.field, err.message);
  });
}
```

#### 401 - Unauthorized

**Cause:** Invalid/expired token

```javascript
if (error.response?.status === 401) {
  // Clear auth data and redirect to login
  localStorage.removeItem("teacherToken");
  localStorage.removeItem("teacherData");
  navigate("/login");
}
```

#### 403 - Forbidden

**Cause:** Teacher not assigned to section/subject

```javascript
if (error.response?.status === 403) {
  const message = error.response.data.message;
  // Show user-friendly message
  if (message.includes("not assigned")) {
    alert(
      "You are not assigned to teach this class. Please contact your college admin."
    );
  }
}
```

#### 404 - Not Found

**Cause:** Section/student/attendance not found

```javascript
if (error.response?.status === 404) {
  alert("The requested resource was not found");
}
```

#### 409 - Conflict

**Cause:** Attendance already marked

```javascript
if (error.response?.status === 409) {
  alert(
    "Attendance has already been marked for this class. You cannot mark it again."
  );
  // Optionally offer to view existing attendance
  navigate(`/view-attendance?sectionId=${sectionId}&date=${date}`);
}
```

#### 500 - Server Error

**Cause:** Internal server error

```javascript
if (error.response?.status === 500) {
  alert("Server error. Please try again later or contact support.");
}
```

### Global Error Handler

```javascript
// Setup Axios interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem("teacherToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## Best Practices

### 1. Caching Strategy

```javascript
// Cache sections and subjects (they rarely change)
const fetchSectionsAndSubjects = async () => {
  const cached = localStorage.getItem("teacher_sections_subjects");
  if (cached) {
    const { sections, subjects, timestamp } = JSON.parse(cached);
    // Use cache if less than 1 hour old
    if (Date.now() - timestamp < 3600000) {
      return { sections, subjects };
    }
  }

  // Fetch fresh data
  const [sectionsRes, subjectsRes] = await Promise.all([
    axios.get("/api/teacher-portal/my-sections"),
    axios.get("/api/teacher-portal/my-subjects"),
  ]);

  // Cache for future use
  localStorage.setItem(
    "teacher_sections_subjects",
    JSON.stringify({
      sections: sectionsRes.data.data,
      subjects: subjectsRes.data.data,
      timestamp: Date.now(),
    })
  );

  return {
    sections: sectionsRes.data.data,
    subjects: subjectsRes.data.data,
  };
};
```

### 2. Optimistic UI Updates

```javascript
// Show immediate feedback before API response
const handleMarkAttendance = async () => {
  // 1. Update UI immediately
  setSubmitting(true);
  setButtonText("Marking...");

  try {
    // 2. Make API call
    await axios.post("/api/teacher-portal/attendance/mark", payload);

    // 3. Show success
    setButtonText("✓ Marked Successfully");
    setTimeout(() => navigate("/dashboard"), 1500);
  } catch (error) {
    // 4. Revert on error
    setButtonText("Mark Attendance");
    alert("Error: " + error.message);
  } finally {
    setSubmitting(false);
  }
};
```

### 3. Loading States

```javascript
// Show loading indicators
{
  loading ? (
    <div className="spinner">Loading...</div>
  ) : students.length === 0 ? (
    <div className="empty-state">No students found</div>
  ) : (
    <StudentsList students={students} />
  );
}
```

### 4. Form Validation

```javascript
// Validate before submission
const validateForm = () => {
  const errors = [];

  if (!selectedSection) {
    errors.push("Please select a section");
  }

  if (!selectedSubject) {
    errors.push("Please select a subject");
  }

  if (!selectedDate) {
    errors.push("Please select a date");
  }

  if (new Date(selectedDate) > new Date()) {
    errors.push("Date cannot be in the future");
  }

  if (!selectedPeriod) {
    errors.push("Please select a period");
  }

  return errors;
};

const handleSubmit = () => {
  const errors = validateForm();
  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }

  // Proceed with submission
  submitAttendance();
};
```

### 5. Responsive Design

```css
/* Mobile-first approach */
.mark-attendance-container {
  padding: 1rem;
}

.student-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Tablet and above */
@media (min-width: 768px) {
  .mark-attendance-container {
    padding: 2rem;
  }

  .student-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
```

### 6. Accessibility

```jsx
// Use semantic HTML and ARIA labels
<button
  aria-label="Mark all students as present"
  onClick={markAllPresent}
>
  Mark All Present
</button>

<input
  type="radio"
  id={`present-${student._id}`}
  name={`attendance-${student._id}`}
  aria-label={`Mark ${student.name} as present`}
/>
```

---

## Summary

This guide provides everything needed to build the Teacher Portal UI:

✅ **9 API Endpoints** with complete request/response documentation
✅ **5 Main Screens** with detailed layouts and workflows
✅ **Complete React Code** for mark attendance workflow
✅ **Permission Validation** at every step
✅ **Error Handling** for all edge cases
✅ **Best Practices** for caching, loading states, and UX

**Key Takeaways:**

1. Teachers can ONLY access their assigned sections and subjects
2. Every operation validates via TeacherAssignment model
3. Attendance cannot be marked twice for same section/subject/date/period
4. All operations are college-scoped automatically
5. UI should be simple, fast, and mobile-friendly

For questions or issues, refer to backend API errors which provide clear messages for all permission violations.
