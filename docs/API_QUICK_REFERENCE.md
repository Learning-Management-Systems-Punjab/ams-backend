# 📋 Quick API Reference Card - College Admin

## 🔐 Authentication

All endpoints require: `Authorization: Bearer <JWT_TOKEN>`

---

## 📚 SUBJECTS

| Method | Endpoint                                 | Description               |
| ------ | ---------------------------------------- | ------------------------- |
| POST   | `/api/college-admin/subjects`            | Create subject            |
| GET    | `/api/college-admin/subjects`            | List subjects (paginated) |
| GET    | `/api/college-admin/subjects/:subjectId` | Get subject details       |
| PUT    | `/api/college-admin/subjects/:subjectId` | Update subject            |
| DELETE | `/api/college-admin/subjects/:subjectId` | Delete subject            |

**Create/Update Payload:**

```json
{
  "name": "Mathematics",
  "code": "MATH",
  "description": "Optional description"
}
```

---

## 📂 SECTIONS

| Method | Endpoint                                              | Description                       |
| ------ | ----------------------------------------------------- | --------------------------------- |
| POST   | `/api/college-admin/sections`                         | Create section                    |
| GET    | `/api/college-admin/sections`                         | List sections (paginated)         |
| GET    | `/api/college-admin/sections/:sectionId`              | Get section details               |
| PUT    | `/api/college-admin/sections/:sectionId`              | Update section                    |
| DELETE | `/api/college-admin/sections/:sectionId`              | Delete section                    |
| POST   | `/api/college-admin/sections/split-by-roll-ranges` ⭐ | **Split sections by roll ranges** |
| POST   | `/api/college-admin/sections/assign-student`          | Assign student to section         |
| POST   | `/api/college-admin/sections/bulk-assign`             | Bulk assign students              |

**Create Section Payload:**

```json
{
  "name": "Section A",
  "programId": "mongoId",
  "year": "1st Year",
  "shift": "1st Shift",
  "rollNumberRange": {
    "start": 1,
    "end": 50
  },
  "subjects": ["subjectId1"],
  "capacity": 50
}
```

**Split by Roll Ranges Payload:** ⭐

```json
{
  "programId": "mongoId",
  "year": "1st Year",
  "sectionRanges": [
    {
      "name": "Section A",
      "start": 1,
      "end": 50,
      "shift": "1st Shift",
      "subjects": ["subjectId"],
      "capacity": 50
    }
  ]
}
```

**Assign Student Payload:**

```json
{
  "studentId": "mongoId",
  "sectionId": "mongoId"
}
```

---

## 👨‍🏫 TEACHER ASSIGNMENTS

| Method | Endpoint                                                    | Description            |
| ------ | ----------------------------------------------------------- | ---------------------- |
| POST   | `/api/college-admin/teacher-assignments`                    | Create assignment      |
| GET    | `/api/college-admin/teacher-assignments`                    | List all assignments   |
| GET    | `/api/college-admin/teacher-assignments/teacher/:teacherId` | Get teacher's schedule |
| GET    | `/api/college-admin/teacher-assignments/section/:sectionId` | Get section's teachers |
| PUT    | `/api/college-admin/teacher-assignments/:assignmentId`      | Update assignment      |
| DELETE | `/api/college-admin/teacher-assignments/:assignmentId`      | Delete assignment      |

**Create Assignment Payload:**

```json
{
  "teacherId": "mongoId",
  "subjectId": "mongoId",
  "sectionId": "mongoId",
  "academicYear": "2025-2026",
  "semester": "Fall"
}
```

**Query Filters:**

- `?academicYear=2025-2026`
- `?semester=Fall`
- `?programId=mongoId`
- `?page=1&limit=50`

---

## ✅ ATTENDANCE

| Method | Endpoint                                                    | Description                    |
| ------ | ----------------------------------------------------------- | ------------------------------ |
| POST   | `/api/college-admin/attendance/mark` ⭐                     | **Mark attendance (bulk)**     |
| GET    | `/api/college-admin/attendance`                             | Get attendance by section/date |
| GET    | `/api/college-admin/attendance/student/:studentId`          | Get student attendance         |
| GET    | `/api/college-admin/attendance/stats/student/:studentId` ⭐ | **Student statistics**         |
| GET    | `/api/college-admin/attendance/stats/section/:sectionId` ⭐ | **Section statistics**         |
| GET    | `/api/college-admin/attendance/sheet/:sectionId` ⭐         | **Generate attendance sheet**  |
| PUT    | `/api/college-admin/attendance/:attendanceId`               | Update attendance record       |
| DELETE | `/api/college-admin/attendance/:attendanceId`               | Delete attendance record       |

**Mark Attendance Payload:** ⭐

```json
{
  "sectionId": "mongoId",
  "subjectId": "mongoId",
  "date": "2026-01-16",
  "period": 1,
  "attendanceRecords": [
    {
      "studentId": "mongoId",
      "status": "Present",
      "remarks": ""
    }
  ]
}
```

**Status Options:**

- `Present` ✅
- `Absent` ❌
- `Late` 🕐
- `Leave` 📋
- `Excused` ✓

**Get Attendance Query:**

- Required: `?sectionId=xxx&subjectId=xxx&date=2026-01-16`
- Optional: `?page=1&limit=200`

**Student Statistics Query:**

- Optional: `?subjectId=xxx&startDate=2026-01-01&endDate=2026-01-31`

**Section Statistics Query:**

- Required: `?subjectId=xxx&startDate=2026-01-01&endDate=2026-01-31`

---

## 📊 Response Format

**Success Response (200/201):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response (400/404/500):**

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "name",
      "message": "Validation error"
    }
  ]
}
```

---

## 🔍 Query Parameters

**Pagination (All List Endpoints):**

- `?page=1` (default: 1)
- `?limit=50` (default varies: 50-200)

**Filters:**

- Subjects: None
- Sections: `?programId=xxx&year=1st Year`
- Teacher Assignments: `?academicYear=2025-2026&semester=Fall&programId=xxx`
- Attendance: `?sectionId=xxx&subjectId=xxx&date=2026-01-16`
- Student Attendance: `?startDate=2026-01-01&endDate=2026-01-31&subjectId=xxx`

---

## ⚡ Quick Tips

1. **All endpoints require JWT token** in Authorization header
2. **All operations are college-scoped** - you only see your college's data
3. **Pagination is automatic** - always check `totalPages` in response
4. **MongoDB IDs** - All IDs are MongoDB ObjectIds (24 hex characters)
5. **Date format** - ISO 8601: `YYYY-MM-DD`
6. **Academic year format** - `YYYY-YYYY` (e.g., 2025-2026)
7. **Semester values** - `Fall`, `Spring`, `Summer`
8. **Year values** - `1st Year`, `2nd Year`, `3rd Year`, `4th Year`
9. **Shift values** - `1st Shift`, `2nd Shift`, `Morning`, `Evening`

---

## 🎯 Key Features

### ⭐ Split Sections by Roll Ranges

Automatically creates sections and assigns students based on roll numbers.

```
POST /api/college-admin/sections/split-by-roll-ranges
```

### ⭐ Mark Attendance (Bulk)

Mark attendance for entire section at once.

```
POST /api/college-admin/attendance/mark
```

### ⭐ Attendance Statistics

Get detailed statistics with percentages.

```
GET /api/college-admin/attendance/stats/student/:studentId
GET /api/college-admin/attendance/stats/section/:sectionId
```

### ⭐ Generate Attendance Sheet

Get pre-formatted list of students ready for marking.

```
GET /api/college-admin/attendance/sheet/:sectionId
```

---

## 🚨 Common HTTP Status Codes

| Code | Meaning      | Action                   |
| ---- | ------------ | ------------------------ |
| 200  | Success      | Continue                 |
| 201  | Created      | Resource created         |
| 400  | Bad Request  | Check validation         |
| 401  | Unauthorized | Login required           |
| 404  | Not Found    | Resource doesn't exist   |
| 500  | Server Error | Retry or contact support |

---

## 📝 Sample cURL Commands

**Login:**

```bash
curl -X POST https://api.yourapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"password"}'
```

**Get Subjects:**

```bash
curl -X GET https://api.yourapp.com/api/college-admin/subjects?page=1&limit=50 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Subject:**

```bash
curl -X POST https://api.yourapp.com/api/college-admin/subjects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mathematics","code":"MATH","description":"Math subject"}'
```

**Mark Attendance:**

```bash
curl -X POST https://api.yourapp.com/api/college-admin/attendance/mark \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sectionId":"xxx",
    "subjectId":"xxx",
    "date":"2026-01-16",
    "period":1,
    "attendanceRecords":[
      {"studentId":"xxx","status":"Present","remarks":""}
    ]
  }'
```

---

**Print this page and keep it handy! 📌**
