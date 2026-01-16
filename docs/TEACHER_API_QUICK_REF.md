# Teacher Portal - API Quick Reference Card

## Base URL

```
http://localhost:3000/api/teacher-portal
```

## Authentication

All endpoints require: `Authorization: Bearer <JWT_TOKEN>`

---

## 📋 Quick Reference

### 1. Get My Assignments

```http
GET /my-assignments?page=1&limit=50
```

**Returns:** List of sections and subjects teacher is assigned to teach

---

### 2. Get My Sections

```http
GET /my-sections
```

**Returns:** Unique sections teacher teaches

---

### 3. Get My Subjects

```http
GET /my-subjects
```

**Returns:** Unique subjects teacher teaches

---

### 4. Get Students in Section

```http
GET /sections/:sectionId/students
```

**Requires:** Teacher must be assigned to the section
**Returns:** List of students in the section

---

### 5. Generate Attendance Sheet

```http
GET /attendance/sheet?sectionId=xxx&subjectId=xxx
```

**Requires:** Teacher must be assigned to section+subject
**Returns:** Pre-filled attendance sheet with student list

---

### 6. Mark Attendance ⭐

```http
POST /attendance/mark
Content-Type: application/json

{
  "sectionId": "xxx",
  "subjectId": "xxx",
  "date": "2024-01-16",
  "period": 1,
  "attendanceRecords": [
    { "studentId": "xxx", "status": "Present" },
    { "studentId": "xxx", "status": "Absent" }
  ]
}
```

**Requires:** Teacher assigned to section+subject
**Note:** Cannot mark twice for same class/date/period

---

### 7. Get Attendance by Date

```http
GET /attendance?sectionId=xxx&subjectId=xxx&date=2024-01-16&period=1
```

**Requires:** Teacher assigned to section+subject
**Returns:** Previously marked attendance

---

### 8. Get Student Stats

```http
GET /attendance/stats/student/:studentId?subjectId=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Requires:** Teacher must teach the subject
**Returns:** Student attendance statistics

---

### 9. Get Section Stats

```http
GET /attendance/stats/section/:sectionId?subjectId=xxx&startDate=2024-01-01&endDate=2024-01-31
```

**Requires:** Teacher assigned to section+subject
**Returns:** Class-wide attendance statistics

---

## 🚦 Response Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 201  | Created (attendance marked)          |
| 400  | Validation error                     |
| 401  | Unauthorized (invalid token)         |
| 403  | Forbidden (not assigned to class)    |
| 404  | Not found                            |
| 409  | Conflict (attendance already marked) |
| 500  | Server error                         |

---

## 📝 Attendance Status Values

- `"Present"` - Student was present
- `"Absent"` - Student was absent
- `"Late"` - Student arrived late
- `"Excused"` - Excused absence

---

## ⚠️ Common Errors

### "You are not assigned to teach this subject for this section"

**Cause:** Teacher not assigned to the section+subject combination
**Fix:** Contact college admin to assign you to the class

### "Attendance has already been marked..."

**Cause:** Attempting to mark attendance twice for same class/date/period
**Fix:** View existing attendance instead of creating new

### "Invalid section ID"

**Cause:** MongoDB ObjectId format error
**Fix:** Ensure sectionId is a valid 24-character hex string

---

## 📚 Full Documentation

See `TEACHER_PORTAL_UI_GUIDE.md` for complete implementation guide with:

- Detailed API specs
- UI designs
- React code examples
- Error handling
- Best practices
