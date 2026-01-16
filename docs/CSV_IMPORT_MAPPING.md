# Student CSV Import - Field Mapping Guide

## CSV Column to API Field Mapping

When importing students from the CSV file (`Context/Student Data.csv`), you need to map the CSV column names to the API field names before sending the request.

### Required Field Mappings

| CSV Column Name     | API Field Name | Required | Description                                  |
| ------------------- | -------------- | -------- | -------------------------------------------- |
| Student Name        | `name`         | ✅ Yes   | Full name of the student                     |
| Roll No             | `rollNumber`   | ✅ Yes   | Student's roll number (unique per college)   |
| Father Name         | `fatherName`   | ✅ Yes   | Father's full name                           |
| Program             | -              | ✅ Yes\* | Used to find/create `programId`              |
| Class               | -              | ✅ Yes\* | Used to determine section (e.g., "1st Year") |
| Subject-Combination | -              | ✅ Yes\* | Used to determine section shift              |

\*These fields need to be processed to create `programId` and `sectionId` before importing.

### Optional Field Mappings

| CSV Column Name     | API Field Name  | Required | Description              |
| ------------------- | --------------- | -------- | ------------------------ |
| Student Phone       | `contactNumber` | ❌ No    | Pakistani phone format   |
| Student CNIC/FORM-B | `cnic`          | ❌ No    | 13 digits or formatted   |
| -                   | `email`         | ❌ No    | Not in CSV, can be added |
| -                   | `dateOfBirth`   | ❌ No    | Not in CSV, can be added |
| -                   | `gender`        | ❌ No    | Not in CSV, can be added |
| -                   | `address`       | ❌ No    | Not in CSV, can be added |

---

## Data Transformation Example

### CSV Row (from Student Data.csv):

```csv
1,"F.Sc. (Pre-Engineering)-Mathematics, Chemistry, Physics",435,NAWALGUL,3226292112,SOHAIL AKHTAR,3330379906284,1st Year,"1st Shift - Mathematics, Chemistry, Physics"
```

### Transformed API Payload:

```json
{
  "students": [
    {
      "name": "NAWALGUL",
      "rollNumber": "435",
      "fatherName": "SOHAIL AKHTAR",
      "contactNumber": "3226292112",
      "cnic": "3330379906284",
      "programId": "507f1f77bcf86cd799439011",
      "sectionId": "507f1f77bcf86cd799439012"
    }
  ],
  "createLoginAccounts": false
}
```

---

## JavaScript Transformation Function

```javascript
/**
 * Transform CSV data to API format
 * @param {Array} csvData - Parsed CSV data with headers
 * @param {String} programId - MongoDB ID of the program
 * @param {String} sectionId - MongoDB ID of the section
 * @returns {Array} Transformed student data ready for API
 */
function transformCSVToAPI(csvData, programId, sectionId) {
  return csvData.map((row) => {
    const student = {
      name: row["Student Name"]?.trim(),
      rollNumber: String(row["Roll No"]),
      fatherName: row["Father Name"]?.trim(),
      programId: programId,
      sectionId: sectionId,
    };

    // Add optional fields if they exist
    if (row["Student Phone"]) {
      student.contactNumber = String(row["Student Phone"]).trim();
    }

    if (row["Student CNIC/FORM-B"]) {
      student.cnic = String(row["Student CNIC/FORM-B"]).trim();
    }

    return student;
  });
}

// Usage example:
const csvData = parseCSV("Student Data.csv");
const transformedData = transformCSVToAPI(csvData, programId, sectionId);

// Send to API
fetch("/api/college-admin/students/bulk-import", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_TOKEN",
  },
  body: JSON.stringify({
    students: transformedData,
    createLoginAccounts: false,
  }),
});
```

---

## Python Transformation Function

```python
import pandas as pd

def transform_csv_to_api(csv_path, program_id, section_id):
    """
    Transform CSV data to API format

    Args:
        csv_path: Path to the CSV file
        program_id: MongoDB ID of the program
        section_id: MongoDB ID of the section

    Returns:
        List of student dictionaries ready for API
    """
    df = pd.read_csv(csv_path)

    students = []
    for _, row in df.iterrows():
        student = {
            'name': str(row['Student Name']).strip(),
            'rollNumber': str(row['Roll No']),
            'fatherName': str(row['Father Name']).strip(),
            'programId': program_id,
            'sectionId': section_id
        }

        # Add optional fields if they exist and are not NaN
        if pd.notna(row.get('Student Phone')):
            student['contactNumber'] = str(row['Student Phone']).strip()

        if pd.notna(row.get('Student CNIC/FORM-B')):
            student['cnic'] = str(row['Student CNIC/FORM-B']).strip()

        students.append(student)

    return students

# Usage example:
students = transform_csv_to_api(
    'Context/Student Data.csv',
    '507f1f77bcf86cd799439011',
    '507f1f77bcf86cd799439012'
)

import requests

response = requests.post(
    'http://localhost:5000/api/college-admin/students/bulk-import',
    headers={
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    json={
        'students': students,
        'createLoginAccounts': False
    }
)
```

---

## Step-by-Step Import Process

### 1. Create/Find Program

First, you need to ensure the program exists or create it:

```javascript
// Extract program info from CSV
const programName = "F.Sc. (Pre-Engineering)";
const programCode = "FSC-PE";
const subjects = ["Mathematics", "Chemistry", "Physics"];

// Create program if it doesn't exist
const program = await createOrFindProgram(programName, programCode, subjects);
const programId = program._id;
```

### 2. Create/Find Section

Next, create or find the appropriate section:

```javascript
// Extract section info from CSV
const year = "1st Year"; // from "Class" column
const shift = "1st Shift"; // from "Subject-Combination" column
const subjects = ["Mathematics", "Chemistry", "Physics"];

// Create section if it doesn't exist
const section = await createOrFindSection(programId, year, shift, subjects);
const sectionId = section._id;
```

### 3. Transform CSV Data

Transform the CSV data using the mapping:

```javascript
const students = transformCSVToAPI(csvData, programId, sectionId);
```

### 4. Import Students

Send the transformed data to the bulk import API:

```javascript
const response = await fetch("/api/college-admin/students/bulk-import", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    students: students,
    createLoginAccounts: false,
  }),
});
```

---

## Common Issues & Solutions

### Issue 1: "Each student must have a name"

**Cause:** CSV column "Student Name" not mapped to API field "name"
**Solution:** Transform the data using the mapping function above

### Issue 2: "Roll number already exists"

**Cause:** Duplicate roll numbers in the CSV or database
**Solution:** Check for duplicates in CSV and database before importing

### Issue 3: "Program not found"

**Cause:** programId not provided or invalid
**Solution:** Create/find the program first, then use its ID

### Issue 4: "Section not found"

**Cause:** sectionId not provided or invalid
**Solution:** Create/find the section first, then use its ID

### Issue 5: "Contact number must be a valid Pakistani phone number"

**Cause:** Phone number format doesn't match validation regex
**Solution:** Ensure format is: 03001234567 (10 digits after optional +92 or 0)

### Issue 6: "CNIC must be in format: 1234567890123 or 12345-1234567-1"

**Cause:** CNIC format doesn't match validation
**Solution:** Ensure 13 digits or formatted with dashes

---

## Complete Import Script Example

```javascript
async function importStudentsFromCSV(csvPath, token) {
  // 1. Parse CSV
  const csvData = await parseCSVFile(csvPath);

  // 2. Extract unique programs and sections
  const programs = extractUniquePrograms(csvData);
  const sections = extractUniqueSections(csvData);

  // 3. Create programs and sections
  for (const prog of programs) {
    await createProgramIfNotExists(prog, token);
  }

  for (const sec of sections) {
    await createSectionIfNotExists(sec, token);
  }

  // 4. Group students by program and section
  const groupedStudents = groupStudentsByProgramSection(csvData);

  // 5. Import students in batches
  for (const [key, students] of Object.entries(groupedStudents)) {
    const [programId, sectionId] = key.split("|");

    // Transform data
    const transformedStudents = transformCSVToAPI(
      students,
      programId,
      sectionId
    );

    // Import in batches of 100
    for (let i = 0; i < transformedStudents.length; i += 100) {
      const batch = transformedStudents.slice(i, i + 100);

      const response = await fetch("/api/college-admin/students/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          students: batch,
          createLoginAccounts: false,
        }),
      });

      const result = await response.json();
      console.log(
        `Batch ${i / 100 + 1}: ${result.data.summary.successful} successful, ${
          result.data.summary.failed
        } failed`
      );
    }
  }
}
```

---

## Testing with Postman/Thunder Client

### Request URL:

```
POST http://localhost:5000/api/college-admin/students/bulk-import
```

### Headers:

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Body (JSON):

```json
{
  "students": [
    {
      "name": "NAWALGUL",
      "rollNumber": "435",
      "fatherName": "SOHAIL AKHTAR",
      "contactNumber": "3226292112",
      "cnic": "3330379906284",
      "programId": "679e7b8c9a1234567890abcd",
      "sectionId": "679e7b8c9a1234567890abce"
    },
    {
      "name": "ALI",
      "rollNumber": "50",
      "fatherName": "AMANULLAH",
      "contactNumber": "3226292116",
      "cnic": "3226292116",
      "programId": "679e7b8c9a1234567890abcd",
      "sectionId": "679e7b8c9a1234567890abce"
    }
  ],
  "createLoginAccounts": false
}
```

---

## Summary

**Key Points:**

1. ✅ CSV column names MUST be mapped to API field names
2. ✅ "Student Name" → "name"
3. ✅ "Roll No" → "rollNumber"
4. ✅ "Father Name" → "fatherName"
5. ✅ "Student Phone" → "contactNumber"
6. ✅ "Student CNIC/FORM-B" → "cnic"
7. ✅ You must provide `programId` and `sectionId` (create them first if needed)
8. ✅ Transform the data BEFORE sending to the API

The API expects the already-transformed data format, not the raw CSV format.
