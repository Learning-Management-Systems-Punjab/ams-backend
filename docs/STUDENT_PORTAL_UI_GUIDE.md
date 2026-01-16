# Student Portal - Complete UI Integration & Behavior Guide

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [User Interface Specifications](#user-interface-specifications)
5. [Screen-by-Screen Implementation](#screen-by-screen-implementation)
6. [Code Examples](#code-examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## Overview

The Student Portal allows students to:

- View their profile and section information
- See all subjects they're enrolled in
- View their teachers for each subject
- Check attendance records for all subjects
- View attendance statistics and analytics
- See classmates in their section

**Key Principles:**

- **Read-Only Access**: Students can only view data, not modify
- **College-Scoped**: Students only see data from their own college
- **Section-Scoped**: Students only see subjects and data for their section
- **Personal Data**: Students can only see their own attendance records

---

## Authentication & Authorization

### Login Flow

```javascript
// Student Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@college.edu",
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "student123",
      "email": "student@college.edu",
      "role": "Student",
      "collegeId": "college456",
      "firstName": "Alice",
      "lastName": "Johnson"
    }
  }
}
```

### Token Storage

```javascript
// Store token in localStorage
localStorage.setItem("studentToken", response.data.token);
localStorage.setItem("studentData", JSON.stringify(response.data.user));

// Set Authorization header for all requests
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
```

### Protected Routes

All student portal routes require:

- Valid JWT token in Authorization header
- `role: "Student"` in token payload
- `userId` in token payload (links to Student record)

**Middleware**: `isStudent` validates these requirements

---

## API Endpoints Reference

### Base URL

```
http://localhost:3000/api/student-portal
```

All endpoints require `Authorization: Bearer <token>` header.

---

### 1. Get My Profile

```http
GET /api/student-portal/my-profile
```

**Response:**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "student123",
    "rollNumber": "CS-2024-001",
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice@college.edu",
    "cnic": "12345-1234567-1",
    "phoneNumber": "+92-300-1234567",
    "dateOfBirth": "2005-03-15T00:00:00.000Z",
    "gender": "Female",
    "address": {
      "street": "123 Main St",
      "city": "Lahore",
      "state": "Punjab",
      "zipCode": "54000"
    },
    "section": {
      "_id": "section456",
      "name": "CS-A",
      "semester": 3,
      "year": 2024
    },
    "college": {
      "_id": "college456",
      "name": "Government College University"
    },
    "program": {
      "_id": "program789",
      "name": "Computer Science",
      "code": "CS"
    },
    "status": "Active",
    "enrollmentDate": "2024-01-10T00:00:00.000Z"
  }
}
```

**Usage:** Display on dashboard and profile screen

---

### 2. Get My Section Details

```http
GET /api/student-portal/my-section
```

**Response:**

```json
{
  "success": true,
  "message": "Section details retrieved successfully",
  "data": {
    "section": {
      "_id": "section456",
      "name": "CS-A",
      "semester": 3,
      "year": 2024,
      "program": {
        "_id": "program789",
        "name": "Computer Science",
        "code": "CS"
      }
    },
    "subjects": [
      {
        "_id": "subject101",
        "name": "Data Structures",
        "code": "CS201",
        "teachers": [
          {
            "_id": "teacher123",
            "firstName": "John",
            "lastName": "Smith",
            "email": "john@college.edu"
          }
        ]
      },
      {
        "_id": "subject102",
        "name": "Algorithms",
        "code": "CS301",
        "teachers": [
          {
            "_id": "teacher456",
            "firstName": "Sarah",
            "lastName": "Williams",
            "email": "sarah@college.edu"
          }
        ]
      }
    ],
    "totalSubjects": 2
  }
}
```

**Usage:** Display subjects and teachers on dashboard

---

### 3. Get My Attendance Records

```http
GET /api/student-portal/my-attendance?page=1&limit=50&subjectId=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `subjectId` (optional): Filter by subject
- `startDate` (optional): Filter from date (ISO 8601: YYYY-MM-DD)
- `endDate` (optional): Filter to date (ISO 8601: YYYY-MM-DD)

**Response:**

```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {
    "attendance": [
      {
        "_id": "attendance123",
        "student": "student123",
        "section": {
          "_id": "section456",
          "name": "CS-A"
        },
        "subject": {
          "_id": "subject101",
          "name": "Data Structures",
          "code": "CS201"
        },
        "teacher": {
          "_id": "teacher123",
          "name": "John Smith"
        },
        "date": "2024-01-16T00:00:00.000Z",
        "period": 1,
        "status": "Present",
        "markedAt": "2024-01-16T09:05:00.000Z"
      },
      {
        "_id": "attendance456",
        "student": "student123",
        "section": {
          "_id": "section456",
          "name": "CS-A"
        },
        "subject": {
          "_id": "subject102",
          "name": "Algorithms",
          "code": "CS301"
        },
        "teacher": {
          "_id": "teacher456",
          "name": "Sarah Williams"
        },
        "date": "2024-01-16T00:00:00.000Z",
        "period": 2,
        "status": "Absent",
        "markedAt": "2024-01-16T10:05:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "perPage": 50,
      "totalPages": 1,
      "totalItems": 2
    }
  }
}
```

**Usage:** Display attendance history

---

### 4. Get My Attendance Statistics

```http
GET /api/student-portal/my-attendance/stats?subjectId=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**

- `subjectId` (optional): Filter by subject
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**

```json
{
  "success": true,
  "message": "Attendance statistics retrieved successfully",
  "data": {
    "student": {
      "_id": "student123",
      "rollNumber": "CS-2024-001",
      "firstName": "Alice",
      "lastName": "Johnson"
    },
    "subject": {
      "_id": "subject101",
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

**Usage:** Display statistics for a specific subject

---

### 5. Get My Attendance Summary

```http
GET /api/student-portal/my-attendance/summary
```

**Response:**

```json
{
  "success": true,
  "message": "Attendance summary retrieved successfully",
  "data": {
    "overall": {
      "totalClasses": 100,
      "present": 85,
      "absent": 10,
      "late": 5,
      "excused": 0,
      "attendancePercentage": 90.0
    },
    "subjects": [
      {
        "subject": {
          "_id": "subject101",
          "name": "Data Structures",
          "code": "CS201"
        },
        "teachers": [
          {
            "_id": "teacher123",
            "firstName": "John",
            "lastName": "Smith",
            "email": "john@college.edu"
          }
        ],
        "totalClasses": 50,
        "present": 45,
        "absent": 3,
        "late": 2,
        "excused": 0,
        "attendancePercentage": 94.0
      },
      {
        "subject": {
          "_id": "subject102",
          "name": "Algorithms",
          "code": "CS301"
        },
        "teachers": [
          {
            "_id": "teacher456",
            "firstName": "Sarah",
            "lastName": "Williams",
            "email": "sarah@college.edu"
          }
        ],
        "totalClasses": 50,
        "present": 40,
        "absent": 7,
        "late": 3,
        "excused": 0,
        "attendancePercentage": 86.0
      }
    ],
    "section": {
      "_id": "section456",
      "name": "CS-A",
      "semester": 3,
      "year": 2024,
      "program": {
        "_id": "program789",
        "name": "Computer Science",
        "code": "CS"
      }
    }
  }
}
```

**Usage:** Dashboard overview with all subjects

---

### 6. Get Subject-Specific Attendance

```http
GET /api/student-portal/subjects/:subjectId/attendance?page=1&limit=50
```

**Path Parameters:**

- `subjectId`: MongoDB ObjectId of the subject

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**

```json
{
  "success": true,
  "message": "Subject attendance retrieved successfully",
  "data": {
    "attendance": [
      {
        "_id": "attendance123",
        "date": "2024-01-16T00:00:00.000Z",
        "period": 1,
        "status": "Present",
        "teacher": {
          "_id": "teacher123",
          "name": "John Smith"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "perPage": 50,
      "totalPages": 1,
      "totalItems": 20
    }
  }
}
```

**Usage:** View detailed attendance for one subject

---

### 7. Get My Classmates

```http
GET /api/student-portal/my-classmates
```

**Response:**

```json
{
  "success": true,
  "message": "Classmates retrieved successfully",
  "data": [
    {
      "_id": "student456",
      "rollNumber": "CS-2024-002",
      "firstName": "Bob",
      "lastName": "Williams",
      "email": "bob@college.edu"
    },
    {
      "_id": "student789",
      "rollNumber": "CS-2024-003",
      "firstName": "Charlie",
      "lastName": "Davis",
      "email": "charlie@college.edu"
    }
  ]
}
```

**Usage:** Display classmate list

---

## User Interface Specifications

### Design Principles

1. **Clean & Simple**: Focus on attendance information
2. **Data Visualization**: Use charts for attendance stats
3. **Mobile-Friendly**: Students access from phones
4. **Quick Overview**: Dashboard shows key metrics at a glance

### Color Scheme

```css
:root {
  --student-primary: #10b981; /* Green for student */
  --student-secondary: #64748b; /* Gray for secondary elements */
  --present: #10b981; /* Green for present */
  --absent: #ef4444; /* Red for absent */
  --late: #f59e0b; /* Orange for late */
  --excused: #8b5cf6; /* Purple for excused */
  --warning: #f59e0b; /* Orange for low attendance warning */
  --danger: #ef4444; /* Red for critical attendance */
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

/* Stats */
.stat-number {
  font-size: 32px;
  font-weight: 700;
}
.stat-label {
  font-size: 12px;
  text-transform: uppercase;
}
```

---

## Screen-by-Screen Implementation

### 1. Dashboard / Home Screen

**Purpose:** Overview of student's attendance and academic information

**Layout:**

```
┌─────────────────────────────────────────────┐
│ Student Portal          [Profile] [Logout]  │
├─────────────────────────────────────────────┤
│ Welcome back, Alice!                        │
│ CS-A • Semester 3, 2024                     │
├─────────────────────────────────────────────┤
│ 📊 Overall Attendance                       │
│ ┌─────────────────────────────────────────┐│
│ │   90.0%                                 ││
│ │   85/100 Classes                        ││
│ │   ██████████████████░░ Progress Bar     ││
│ │   ✓ 85 Present  ✗ 10 Absent  ⏰ 5 Late ││
│ └─────────────────────────────────────────┘│
├─────────────────────────────────────────────┤
│ 📚 Subject-wise Attendance                  │
│ ┌─────────────────────────────────────────┐│
│ │ Data Structures (CS201)                 ││
│ │ Teacher: John Smith                     ││
│ │ 94.0% | 45/50 classes                   ││
│ │ [View Details]                          ││
│ ├─────────────────────────────────────────┤│
│ │ Algorithms (CS301) ⚠️                   ││
│ │ Teacher: Sarah Williams                 ││
│ │ 86.0% | 40/50 classes                   ││
│ │ [View Details]                          ││
│ └─────────────────────────────────────────┘│
├─────────────────────────────────────────────┤
│ [View Full Attendance] [My Section Info]    │
└─────────────────────────────────────────────┘
```

**API Calls:**

1. `GET /api/student-portal/my-profile` (user info)
2. `GET /api/student-portal/my-attendance/summary` (dashboard data)

**React Component:**

```jsx
import { useState, useEffect } from "react";
import axios from "axios";

function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, summaryRes] = await Promise.all([
        axios.get("/api/student-portal/my-profile"),
        axios.get("/api/student-portal/my-attendance/summary"),
      ]);

      setProfile(profileRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const { overall, subjects } = summary;

  return (
    <div className="dashboard-container">
      <header>
        <h1>Student Portal</h1>
        <UserMenu />
      </header>

      <div className="welcome-section">
        <h2>Welcome back, {profile.firstName}!</h2>
        <p className="text-secondary">
          {summary.section.name} • Semester {summary.section.semester},{" "}
          {summary.section.year}
        </p>
      </div>

      <div className="overall-attendance-card">
        <h3>📊 Overall Attendance</h3>
        <div className="attendance-stats">
          <div className="stat-main">
            <div className="percentage">{overall.attendancePercentage}%</div>
            <div className="classes-count">
              {overall.present + overall.late}/{overall.totalClasses} Classes
            </div>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${overall.attendancePercentage}%`,
                backgroundColor: getAttendanceColor(
                  overall.attendancePercentage
                ),
              }}
            />
          </div>

          <div className="status-breakdown">
            <div className="status-item present">
              ✓ {overall.present} Present
            </div>
            <div className="status-item absent">✗ {overall.absent} Absent</div>
            <div className="status-item late">⏰ {overall.late} Late</div>
          </div>
        </div>
      </div>

      <div className="subjects-section">
        <h3>📚 Subject-wise Attendance</h3>
        <div className="subjects-list">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.subject._id}
              subject={subject}
              onClick={() =>
                navigate(`/subjects/${subject.subject._id}/attendance`)
              }
            />
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={() => navigate("/attendance")}>
          View Full Attendance
        </button>
        <button onClick={() => navigate("/section-info")}>
          My Section Info
        </button>
      </div>
    </div>
  );
}

function SubjectCard({ subject, onClick }) {
  const isLowAttendance = subject.attendancePercentage < 75;

  return (
    <div className={`subject-card ${isLowAttendance ? "warning" : ""}`}>
      <div className="subject-header">
        <h4>
          {subject.subject.name} ({subject.subject.code})
          {isLowAttendance && " ⚠️"}
        </h4>
        <div className="teacher-info">
          Teacher:{" "}
          {subject.teachers
            .map((t) => `${t.firstName} ${t.lastName}`)
            .join(", ")}
        </div>
      </div>

      <div className="subject-stats">
        <div className="percentage">{subject.attendancePercentage}%</div>
        <div className="classes">
          {subject.present + subject.late}/{subject.totalClasses} classes
        </div>
      </div>

      <button onClick={onClick} className="view-details-btn">
        View Details
      </button>
    </div>
  );
}

function getAttendanceColor(percentage) {
  if (percentage >= 85) return "#10b981"; // Green
  if (percentage >= 75) return "#f59e0b"; // Orange
  return "#ef4444"; // Red
}
```

---

### 2. Profile Screen

**Purpose:** Display student's personal and academic information

**Layout:**

```
┌─────────────────────────────────────────────┐
│ ← Back    My Profile                        │
├─────────────────────────────────────────────┤
│ 👤 Personal Information                     │
│ ┌─────────────────────────────────────────┐│
│ │ Name: Alice Johnson                     ││
│ │ Roll Number: CS-2024-001                ││
│ │ Email: alice@college.edu                ││
│ │ CNIC: 12345-1234567-1                   ││
│ │ Phone: +92-300-1234567                  ││
│ │ Date of Birth: March 15, 2005           ││
│ │ Gender: Female                          ││
│ └─────────────────────────────────────────┘│
├─────────────────────────────────────────────┤
│ 🎓 Academic Information                     │
│ ┌─────────────────────────────────────────┐│
│ │ College: Government College University  ││
│ │ Program: Computer Science (CS)          ││
│ │ Section: CS-A                           ││
│ │ Semester: 3                             ││
│ │ Year: 2024                              ││
│ │ Status: Active                          ││
│ │ Enrollment Date: January 10, 2024       ││
│ └─────────────────────────────────────────┘│
├─────────────────────────────────────────────┤
│ 📍 Address                                  │
│ ┌─────────────────────────────────────────┐│
│ │ 123 Main St                             ││
│ │ Lahore, Punjab 54000                    ││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**API Call:**

```javascript
GET / api / student - portal / my - profile;
```

---

### 3. Section Information Screen

**Purpose:** View section details, subjects, and teachers

**Layout:**

```
┌─────────────────────────────────────────────┐
│ ← Back    My Section                        │
├─────────────────────────────────────────────┤
│ 🎓 Section: CS-A                            │
│    Semester 3, 2024                         │
│    Program: Computer Science (CS)           │
├─────────────────────────────────────────────┤
│ 📚 Subjects (5)                             │
│ ┌─────────────────────────────────────────┐│
│ │ Data Structures                         ││
│ │ CS201                                   ││
│ │ 👨‍🏫 Teacher: John Smith                 ││
│ │     Email: john@college.edu             ││
│ ├─────────────────────────────────────────┤│
│ │ Algorithms                              ││
│ │ CS301                                   ││
│ │ 👨‍🏫 Teacher: Sarah Williams             ││
│ │     Email: sarah@college.edu            ││
│ ├─────────────────────────────────────────┤│
│ │ Database Systems                        ││
│ │ CS202                                   ││
│ │ 👨‍🏫 Teacher: Mike Johnson              ││
│ │     Email: mike@college.edu             ││
│ └─────────────────────────────────────────┘│
├─────────────────────────────────────────────┤
│ [View Classmates]                           │
└─────────────────────────────────────────────┘
```

**API Call:**

```javascript
GET / api / student - portal / my - section;
```

---

### 4. Attendance History Screen

**Purpose:** View detailed attendance records

**Layout:**

```
┌─────────────────────────────────────────────┐
│ ← Back    My Attendance                     │
├─────────────────────────────────────────────┤
│ Filters:                                    │
│ Subject: [All Subjects ▼]                   │
│ From: [2024-01-01 📅] To: [2024-01-31 📅]  │
│ [Apply Filters]                             │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐│
│ │ Jan 16, 2024 • Period 1                 ││
│ │ Data Structures (CS201)                 ││
│ │ Teacher: John Smith                     ││
│ │ Status: ✓ Present                       ││
│ ├─────────────────────────────────────────┤│
│ │ Jan 16, 2024 • Period 2                 ││
│ │ Algorithms (CS301)                      ││
│ │ Teacher: Sarah Williams                 ││
│ │ Status: ✗ Absent                        ││
│ ├─────────────────────────────────────────┤│
│ │ Jan 15, 2024 • Period 1                 ││
│ │ Data Structures (CS201)                 ││
│ │ Teacher: John Smith                     ││
│ │ Status: ⏰ Late                          ││
│ └─────────────────────────────────────────┘│
│ Page 1 of 5                  [Next →]       │
└─────────────────────────────────────────────┘
```

**Implementation:**

```jsx
import { useState, useEffect } from "react";
import axios from "axios";

function AttendanceHistory() {
  const [attendance, setAttendance] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  // Filters
  const [page, setPage] = useState(1);
  const [subjectId, setSubjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [page, subjectId, startDate, endDate]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("/api/student-portal/my-section");
      setSubjects(response.data.data.subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 20);
      if (subjectId) params.append("subjectId", subjectId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await axios.get(
        `/api/student-portal/my-attendance?${params.toString()}`
      );

      setAttendance(response.data.data.attendance);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return "✓";
      case "Absent":
        return "✗";
      case "Late":
        return "⏰";
      case "Excused":
        return "📋";
      default:
        return "";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "status-present";
      case "Absent":
        return "status-absent";
      case "Late":
        return "status-late";
      case "Excused":
        return "status-excused";
      default:
        return "";
    }
  };

  return (
    <div className="attendance-history-container">
      <header>
        <button onClick={() => navigate(-1)}>← Back</button>
        <h1>My Attendance</h1>
      </header>

      <div className="filters-section">
        <div className="filter-row">
          <div className="form-group">
            <label>Subject</label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="form-group">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : attendance.length === 0 ? (
        <div className="empty-state">
          <p>No attendance records found</p>
        </div>
      ) : (
        <>
          <div className="attendance-list">
            {attendance.map((record) => (
              <div key={record._id} className="attendance-record">
                <div className="record-header">
                  <div className="date-info">
                    {new Date(record.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    • Period {record.period}
                  </div>
                </div>

                <div className="record-body">
                  <div className="subject-info">
                    {record.subject.name} ({record.subject.code})
                  </div>
                  <div className="teacher-info text-secondary">
                    Teacher: {record.teacher.name}
                  </div>
                </div>

                <div
                  className={`status-badge ${getStatusColor(record.status)}`}
                >
                  {getStatusIcon(record.status)} {record.status}
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Previous
            </button>

            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

### 5. Subject Attendance Details Screen

**Purpose:** View attendance for a specific subject with statistics

**Layout:**

```
┌─────────────────────────────────────────────┐
│ ← Back    Data Structures Attendance        │
├─────────────────────────────────────────────┤
│ 📊 Statistics                               │
│ ┌─────────────────────────────────────────┐│
│ │   94.0%                                 ││
│ │   45/50 Classes                         ││
│ │   ✓ 45 Present  ✗ 3 Absent  ⏰ 2 Late  ││
│ └─────────────────────────────────────────┘│
├─────────────────────────────────────────────┤
│ 📅 Attendance Records                       │
│ ┌─────────────────────────────────────────┐│
│ │ Jan 16, 2024 • Period 1                 ││
│ │ Teacher: John Smith                     ││
│ │ ✓ Present                               ││
│ ├─────────────────────────────────────────┤│
│ │ Jan 15, 2024 • Period 1                 ││
│ │ Teacher: John Smith                     ││
│ │ ⏰ Late                                  ││
│ ├─────────────────────────────────────────┤│
│ │ Jan 14, 2024 • Period 1                 ││
│ │ Teacher: John Smith                     ││
│ │ ✓ Present                               ││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**API Calls:**

```javascript
GET /api/student-portal/my-attendance/stats?subjectId=xxx
GET /api/student-portal/subjects/:subjectId/attendance?page=1&limit=20
```

---

### 6. Classmates Screen

**Purpose:** View students in the same section

**Layout:**

```
┌─────────────────────────────────────────────┐
│ ← Back    My Classmates                     │
├─────────────────────────────────────────────┤
│ Section: CS-A • 50 Students                 │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐│
│ │ CS-2024-002                             ││
│ │ Bob Williams                            ││
│ │ bob@college.edu                         ││
│ ├─────────────────────────────────────────┤│
│ │ CS-2024-003                             ││
│ │ Charlie Davis                           ││
│ │ charlie@college.edu                     ││
│ └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**API Call:**

```javascript
GET / api / student - portal / my - classmates;
```

---

## Error Handling

### Common Error Responses

#### 404 - Not Found

```json
{
  "success": false,
  "message": "Student profile not found"
}
```

```javascript
if (error.response?.status === 404) {
  alert(error.response.data.message);
  // Redirect to login or support
}
```

#### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

```javascript
if (error.response?.status === 401) {
  localStorage.removeItem("studentToken");
  navigate("/login");
}
```

### Global Error Handler

```javascript
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("studentToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## Best Practices

### 1. Caching

```javascript
// Cache profile and section data
const fetchDashboardData = async () => {
  // Check cache first
  const cachedProfile = localStorage.getItem("student_profile");
  if (cachedProfile) {
    setProfile(JSON.parse(cachedProfile));
  }

  // Fetch fresh data
  const profileRes = await axios.get("/api/student-portal/my-profile");

  // Update cache
  localStorage.setItem("student_profile", JSON.stringify(profileRes.data.data));
  setProfile(profileRes.data.data);
};
```

### 2. Loading States

```javascript
{
  loading ? (
    <LoadingSpinner />
  ) : data.length === 0 ? (
    <EmptyState message="No data available" />
  ) : (
    <DataList data={data} />
  );
}
```

### 3. Responsive Design

```css
/* Mobile-first */
.dashboard-container {
  padding: 1rem;
}

.subject-card {
  flex-direction: column;
}

/* Tablet and above */
@media (min-width: 768px) {
  .dashboard-container {
    padding: 2rem;
  }

  .subjects-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
```

### 4. Attendance Color Coding

```javascript
function getAttendanceColor(percentage) {
  if (percentage >= 85) return "#10b981"; // Good - Green
  if (percentage >= 75) return "#f59e0b"; // Warning - Orange
  return "#ef4444"; // Critical - Red
}
```

### 5. Date Formatting

```javascript
// User-friendly date display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
```

---

## Summary

### Available APIs

✅ **7 Endpoints** for student operations:

1. Get my profile
2. Get my section details
3. Get my attendance records (paginated)
4. Get my attendance statistics
5. Get my attendance summary
6. Get subject-specific attendance
7. Get my classmates

### Key Features

- ✅ Complete profile information
- ✅ Section and subject details
- ✅ Teacher information per subject
- ✅ Attendance records with filtering
- ✅ Statistics and analytics
- ✅ Subject-wise breakdown
- ✅ Classmate list

### UI Components Needed

1. Dashboard with overview
2. Profile screen
3. Section information screen
4. Attendance history with filters
5. Subject details screen
6. Classmates list

### Data Visualization

- Progress bars for attendance percentage
- Color-coded status badges
- Statistics cards
- Charts for analytics

**All backend APIs are ready for frontend integration!** 🎉
