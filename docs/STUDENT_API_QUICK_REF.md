# Student Portal API - Quick Reference Card

## 🚀 Quick Start

### Base URL

```
http://localhost:3000/api/student-portal
```

### Authentication

All endpoints require JWT Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

### Role Required

```
Student
```

---

## 📍 Endpoints Overview

| #   | Method | Endpoint                          | Description           | Pagination |
| --- | ------ | --------------------------------- | --------------------- | ---------- |
| 1   | GET    | `/my-profile`                     | Student profile       | No         |
| 2   | GET    | `/my-section`                     | Section details       | No         |
| 3   | GET    | `/my-attendance`                  | Attendance records    | Yes        |
| 4   | GET    | `/my-attendance/stats`            | Attendance statistics | No         |
| 5   | GET    | `/my-attendance/summary`          | Overall summary       | No         |
| 6   | GET    | `/subjects/:subjectId/attendance` | Subject attendance    | Yes        |
| 7   | GET    | `/my-classmates`                  | Classmates list       | No         |

---

## 🔍 Detailed Endpoints

### 1. Get My Profile

```http
GET /my-profile
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": { "firstName": "...", "lastName": "...", "email": "..." },
    "rollNumber": "...",
    "sectionId": { "_id": "...", "name": "..." },
    "collegeId": { "_id": "...", "name": "..." },
    "programId": { "_id": "...", "name": "..." },
    "semester": 3
  }
}
```

---

### 2. Get My Section

```http
GET /my-section
```

**Response:**

```json
{
  "success": true,
  "data": {
    "section": { "_id": "...", "name": "CS-A", "semester": 3 },
    "subjects": [
      {
        "subject": {
          "_id": "...",
          "name": "Database Systems",
          "code": "CS301"
        },
        "teachers": [
          { "_id": "...", "userId": { "firstName": "...", "lastName": "..." } }
        ]
      }
    ]
  }
}
```

---

### 3. Get My Attendance

```http
GET /my-attendance?page=1&limit=50&subjectId=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number (min: 1) |
| limit | number | No | 50 | Items per page (max: 100) |
| subjectId | ObjectId | No | - | Filter by subject |
| startDate | ISO Date | No | - | Start date (YYYY-MM-DD) |
| endDate | ISO Date | No | - | End date (YYYY-MM-DD) |

**Response:**

```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "_id": "...",
        "subjectId": {
          "_id": "...",
          "name": "Database Systems",
          "code": "CS301"
        },
        "status": "Present",
        "date": "2024-01-15T00:00:00.000Z",
        "remarks": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 120,
      "hasMore": true
    }
  }
}
```

**Status Values:**

- `Present` - Student attended
- `Absent` - Student did not attend
- `Late` - Student arrived late
- `Excused` - Excused absence

---

### 4. Get My Attendance Stats

```http
GET /my-attendance/stats?subjectId=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| subjectId | ObjectId | No | Filter by subject |
| startDate | ISO Date | No | Start date (YYYY-MM-DD) |
| endDate | ISO Date | No | End date (YYYY-MM-DD) |

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalClasses": 30,
      "present": 25,
      "absent": 3,
      "late": 2,
      "excused": 0,
      "attendancePercentage": 90.0
    }
  }
}
```

**Percentage Calculation:**

```
percentage = ((present + late) / totalClasses) × 100
```

---

### 5. Get My Attendance Summary

```http
GET /my-attendance/summary
```

**Use Case:** Dashboard - show overall attendance and all subjects

**Response:**

```json
{
  "success": true,
  "data": {
    "overall": {
      "totalClasses": 120,
      "present": 102,
      "absent": 12,
      "late": 6,
      "excused": 0,
      "attendancePercentage": 90.0
    },
    "subjects": [
      {
        "subject": {
          "_id": "...",
          "name": "Database Systems",
          "code": "CS301"
        },
        "totalClasses": 30,
        "present": 25,
        "absent": 3,
        "late": 2,
        "excused": 0,
        "attendancePercentage": 90.0
      }
    ]
  }
}
```

---

### 6. Get Subject Attendance

```http
GET /subjects/:subjectId/attendance?page=1&limit=20
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| subjectId | ObjectId | Yes | Subject ID |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number (min: 1) |
| limit | number | No | 50 | Items per page (max: 100) |

**Response:**

```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "_id": "...",
        "status": "Present",
        "date": "2024-01-15T00:00:00.000Z",
        "remarks": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalRecords": 30,
      "hasMore": true
    }
  }
}
```

---

### 7. Get My Classmates

```http
GET /my-classmates
```

**Response:**

```json
{
  "success": true,
  "data": {
    "classmates": [
      {
        "_id": "...",
        "userId": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@college.edu"
        },
        "rollNumber": "CS2024001"
      }
    ]
  }
}
```

**Note:** Current student is excluded from the list.

---

## 🚨 Error Codes

| Code | Message          | Description                                 |
| ---- | ---------------- | ------------------------------------------- |
| 200  | Success          | Request successful                          |
| 400  | Validation Error | Invalid request parameters                  |
| 401  | Unauthorized     | Missing or invalid JWT token                |
| 404  | Not Found        | Resource not found (profile, section, etc.) |
| 500  | Server Error     | Internal server error                       |

---

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    /* validation errors */
  ]
}
```

---

## 🎨 Color Coding Guidelines

### Attendance Percentage

```javascript
function getAttendanceColor(percentage) {
  if (percentage >= 85) return "green"; // Good
  if (percentage >= 75) return "orange"; // Warning
  return "red"; // Critical
}
```

### Status Colors

```javascript
const statusColors = {
  Present: "green",
  Late: "orange",
  Absent: "red",
  Excused: "blue",
};
```

---

## 🔧 Common Use Cases

### Dashboard Load

```javascript
// 1. Get profile
const profile = await get("/my-profile");

// 2. Get summary
const summary = await get("/my-attendance/summary");

// 3. Display dashboard
renderDashboard(profile, summary);
```

### Attendance History with Filters

```javascript
// 1. Get subjects (from section)
const section = await get("/my-section");

// 2. Build filters
const params = new URLSearchParams({
  page: 1,
  limit: 50,
  subjectId: selectedSubjectId,
  startDate: "2024-01-01",
  endDate: "2024-01-31",
});

// 3. Fetch attendance
const attendance = await get(`/my-attendance?${params}`);
```

### Subject Details Page

```javascript
// 1. Get subject attendance
const attendance = await get(`/subjects/${subjectId}/attendance`);

// 2. Get subject stats
const stats = await get(`/my-attendance/stats?subjectId=${subjectId}`);

// 3. Display subject view
renderSubjectDetails(attendance, stats);
```

---

## 🔑 JWT Token Structure

```json
{
  "userId": "65abc123def456...",
  "role": "Student",
  "collegeId": "65xyz789ghi012...",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token must contain:**

- `userId` - User's MongoDB ObjectId
- `role` - Must be "Student"
- `collegeId` - College association

---

## 📊 Pagination Details

### Default Values

- Default page: `1`
- Default limit: `50`
- Maximum limit: `100`

### Pagination Object

```json
{
  "currentPage": 1,
  "totalPages": 5,
  "totalRecords": 120,
  "hasMore": true
}
```

### Frontend Implementation

```javascript
// Check if more pages available
if (pagination.hasMore) {
  // Show "Load More" button
}

// Calculate total pages
const totalPages = pagination.totalPages;

// Navigate
const nextPage = pagination.currentPage + 1;
```

---

## 🎯 Access Rules

### Student Can:

✅ View own profile
✅ View own section and subjects
✅ View own attendance records
✅ View classmates in same section
✅ View teachers for their subjects

### Student Cannot:

❌ View other students' data
❌ Mark attendance
❌ Modify any records
❌ Access other sections
❌ View college-wide data

---

## 💡 Tips & Best Practices

### 1. Cache Static Data

```javascript
// Cache profile (rarely changes)
const profile = localStorage.getItem("profile") || (await fetchProfile());

// Cache section/subjects (rarely change)
const section = localStorage.getItem("section") || (await fetchSection());
```

### 2. Debounce Filters

```javascript
// Debounce date picker changes
const debouncedFetch = debounce(fetchAttendance, 300);
```

### 3. Infinite Scroll

```javascript
// Load more on scroll
const loadMore = () => {
  setPage(page + 1);
  fetchAttendance(page + 1, filters);
};
```

### 4. Error Handling

```javascript
// Handle 401 - redirect to login
if (error.response?.status === 401) {
  logout();
  navigate("/login");
}

// Handle 404 - show friendly message
if (error.response?.status === 404) {
  showAlert("Section not assigned yet");
}
```

---

## 📱 Mobile Responsive

### Recommended Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  .subject-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .subject-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .subject-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🧪 Testing Checklist

### Quick Test Flow

1. ✅ Login as student → Get token
2. ✅ GET `/my-profile` → Verify profile data
3. ✅ GET `/my-section` → Check subjects/teachers
4. ✅ GET `/my-attendance/summary` → Verify stats
5. ✅ GET `/my-attendance?page=1` → Check pagination
6. ✅ GET `/my-attendance?subjectId=xxx` → Test filter
7. ✅ GET `/subjects/:id/attendance` → Subject view
8. ✅ GET `/my-classmates` → Classmates list

---

## 📞 Support

### Documentation

- **Complete Guide:** `STUDENT_PORTAL_UI_GUIDE.md`
- **Implementation:** `STUDENT_IMPLEMENTATION_COMPLETE.md`
- **This File:** `STUDENT_API_QUICK_REF.md`

### Common Issues

1. **401 Unauthorized** → Check token, role must be "Student"
2. **404 Not Found** → Check if student has section assigned
3. **Empty attendance** → No attendance marked yet
4. **Validation error** → Check query parameter formats

---

## 🚀 Ready to Start!

All endpoints are functional and ready for integration. Refer to `STUDENT_PORTAL_UI_GUIDE.md` for complete implementation examples with React code.

**Happy Coding! 🎉**
