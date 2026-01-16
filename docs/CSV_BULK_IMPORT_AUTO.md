# CSV Bulk Import API - Auto-Create Programs & Sections

## New Endpoint for Raw CSV Import

### Endpoint

**POST** `/api/college-admin/students/bulk-import-csv`

This endpoint accepts the raw CSV data format and automatically:

1. ✅ Parses program information from CSV
2. ✅ Creates or finds programs automatically
3. ✅ Creates or finds sections automatically
4. ✅ Imports students with all relationships set up

---

## CSV Format Expected

The API expects data in the **exact format** as your CSV file:

```json
{
  "students": [
    {
      "No #": "1",
      "Program": "F.Sc. (Pre-Engineering)-Mathematics, Chemistry, Physics",
      "Roll No": "435",
      "Student Name": "NAWALGUL",
      "Student Phone": "3226292112",
      "Father Name": "SOHAIL AKHTAR",
      "Student CNIC/FORM-B": "3330379906284",
      "Class": "1st Year",
      "Subject-Combination": "1st Shift - Mathematics, Chemistry, Physics"
    },
    {
      "No #": "2",
      "Program": "F.Sc. (Pre-Engineering)-Mathematics, Chemistry, Physics",
      "Roll No": "50",
      "Student Name": "ALI",
      "Student Phone": "3226292116",
      "Father Name": "AMANULLAH",
      "Student CNIC/FORM-B": "3226292116",
      "Class": "1st Year",
      "Subject-Combination": "1st Shift - Mathematics, Chemistry, Physics"
    }
  ],
  "createLoginAccounts": false
}
```

---

## Required CSV Fields

| Field Name     | Required | Description                               |
| -------------- | -------- | ----------------------------------------- |
| `Student Name` | ✅ Yes   | Full name of student                      |
| `Roll No`      | ✅ Yes   | Roll number (unique per college)          |
| `Father Name`  | ✅ Yes   | Father's full name                        |
| `Program`      | ✅ Yes   | Full program string (will be auto-parsed) |

## Optional CSV Fields

| Field Name            | Required | Description                                         |
| --------------------- | -------- | --------------------------------------------------- |
| `Student Phone`       | ❌ No    | Contact number                                      |
| `Student CNIC/FORM-B` | ❌ No    | CNIC or Form-B number                               |
| `Class`               | ❌ No    | Year (e.g., "1st Year") - used for section creation |
| `Subject-Combination` | ❌ No    | Shift info - used for section creation              |
| `No #`                | ❌ No    | Row number (ignored)                                |

---

## How It Works

### 1. Program Auto-Creation

**Input:** `"F.Sc. (Pre-Engineering)-Mathematics, Chemistry, Physics"`

**Parsed To:**

- **Name:** `F.Sc. (Pre-Engineering)`
- **Code:** `FSC-PR-EN` (auto-generated from name)
- **Subjects:** `["Mathematics", "Chemistry", "Physics"]`
- **Duration:** `2` (default for F.Sc)

The API will:

1. Check if a program with this name exists in your college
2. If exists → use it
3. If not → create it automatically

### 2. Section Auto-Creation

**Input:**

- `Class`: `"1st Year"`
- `Subject-Combination`: `"1st Shift - Mathematics, Chemistry, Physics"`

**Parsed To:**

- **Name:** `1st Year - 1st Shift`
- **Year:** `1st Year`
- **Shift:** `1st Shift`
- **Capacity:** `100` (default)

The API will:

1. Check if this section exists (same program, year, shift)
2. If exists → use it
3. If not → create it automatically

### 3. Student Import

Once program and section are ready, the student is created with:

- All required fields from CSV
- Auto-linked to program and section
- Optional login account creation

---

## Success Response

```json
{
  "success": true,
  "message": "CSV import completed",
  "data": {
    "summary": {
      "total": 52,
      "successful": 50,
      "failed": 2,
      "programsCreated": 1,
      "sectionsCreated": 1
    },
    "programs": [
      {
        "_id": "679e8a1234567890abcdef01",
        "name": "F.Sc. (Pre-Engineering)",
        "code": "FSC-PR-EN"
      }
    ],
    "sections": [
      {
        "_id": "679e8a1234567890abcdef02",
        "name": "1st Year - 1st Shift",
        "year": "1st Year",
        "shift": "1st Shift"
      }
    ],
    "results": {
      "successful": [
        {
          "row": 1,
          "studentId": "679e8a1234567890abcdef03",
          "name": "NAWALGUL",
          "rollNumber": "435",
          "program": "F.Sc. (Pre-Engineering)",
          "section": "1st Year - 1st Shift"
        },
        {
          "row": 2,
          "studentId": "679e8a1234567890abcdef04",
          "name": "ALI",
          "rollNumber": "50",
          "program": "F.Sc. (Pre-Engineering)",
          "section": "1st Year - 1st Shift"
        }
      ],
      "failed": [
        {
          "row": 25,
          "data": {
            "name": "DUPLICATE STUDENT",
            "rollNumber": "435",
            "program": "F.Sc. (Pre-Engineering)"
          },
          "error": "Roll number 435 already exists"
        }
      ]
    }
  }
}
```

---

## Testing with Postman/Thunder Client

### Request

**Method:** `POST`

**URL:** `http://localhost:5000/api/college-admin/students/bulk-import-csv`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**

```json
{
  "students": [
    {
      "Program": "F.Sc. (Pre-Engineering)-Mathematics, Chemistry, Physics",
      "Roll No": "435",
      "Student Name": "NAWALGUL",
      "Student Phone": "3226292112",
      "Father Name": "SOHAIL AKHTAR",
      "Student CNIC/FORM-B": "3330379906284",
      "Class": "1st Year",
      "Subject-Combination": "1st Shift - Mathematics, Chemistry, Physics"
    },
    {
      "Program": "F.Sc. (Pre-Engineering)-Mathematics, Chemistry, Physics",
      "Roll No": "50",
      "Student Name": "ALI",
      "Student Phone": "3226292116",
      "Father Name": "AMANULLAH",
      "Student CNIC/FORM-B": "3226292116",
      "Class": "1st Year",
      "Subject-Combination": "1st Shift - Mathematics, Chemistry, Physics"
    }
  ],
  "createLoginAccounts": false
}
```

---

## Frontend Integration Examples

### JavaScript/React Example

```javascript
async function importCSVData(csvFile) {
  // Parse CSV file
  const Papa = require("papaparse");

  Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: async function (results) {
      const students = results.data;

      // Send to API as-is (no transformation needed!)
      const response = await fetch(
        "http://localhost:5000/api/college-admin/students/bulk-import-csv",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            students: students,
            createLoginAccounts: false,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log(`Imported ${result.data.summary.successful} students`);
        console.log(`Created ${result.data.summary.programsCreated} programs`);
        console.log(`Created ${result.data.summary.sectionsCreated} sections`);

        if (result.data.summary.failed > 0) {
          console.log("Failed rows:", result.data.results.failed);
        }
      }
    },
  });
}
```

### Python Example

```python
import pandas as pd
import requests

def import_csv_to_api(csv_path, token):
    # Read CSV (preserves column names exactly)
    df = pd.read_csv(csv_path)

    # Convert to list of dicts (keeps original column names)
    students = df.to_dict('records')

    # Send to API
    response = requests.post(
        'http://localhost:5000/api/college-admin/students/bulk-import-csv',
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        },
        json={
            'students': students,
            'createLoginAccounts': False
        }
    )

    result = response.json()

    if result['success']:
        summary = result['data']['summary']
        print(f"Total: {summary['total']}")
        print(f"Successful: {summary['successful']}")
        print(f"Failed: {summary['failed']}")
        print(f"Programs Created: {summary['programsCreated']}")
        print(f"Sections Created: {summary['sectionsCreated']}")

        # Show failed rows
        if result['data']['results']['failed']:
            print("\nFailed Rows:")
            for fail in result['data']['results']['failed']:
                print(f"  Row {fail['row']}: {fail['error']}")

    return result

# Usage
result = import_csv_to_api('Context/Student Data.csv', 'YOUR_TOKEN')
```

---

## Key Advantages

### ✅ No Pre-Processing Required

- Send CSV data directly as parsed
- No need to create programs or sections first
- No field name transformation needed

### ✅ Automatic Resource Creation

- Programs are created automatically from CSV
- Sections are created automatically from Class + Shift
- Handles duplicates gracefully (uses existing if found)

### ✅ Intelligent Caching

- Programs and sections are cached during import
- Avoids repeated database queries
- Fast bulk imports

### ✅ Detailed Results

- Shows exactly which programs and sections were created
- Lists all successful imports with details
- Lists all failed imports with reasons
- Easy to retry failed rows

---

## Comparison with Old Endpoint

### Old Endpoint: `/bulk-import`

- ❌ Requires `programId` and `sectionId`
- ❌ Must create programs/sections manually first
- ❌ Must transform CSV field names
- ❌ More complex frontend logic

### New Endpoint: `/bulk-import-csv`

- ✅ No pre-created programs/sections needed
- ✅ Creates programs/sections automatically
- ✅ Accepts raw CSV column names
- ✅ Simple frontend integration

---

## Error Handling

### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "students[0]['Student Name']",
      "message": "Student Name is required in CSV format"
    }
  ]
}
```

### Import Errors

Individual row failures are captured in the response:

```json
{
  "data": {
    "results": {
      "failed": [
        {
          "row": 5,
          "data": { "name": "...", "rollNumber": "123" },
          "error": "Roll number 123 already exists"
        }
      ]
    }
  }
}
```

---

## Best Practices

### 1. Import in Batches

For large CSVs (>500 rows), split into batches:

```javascript
const batchSize = 500;
for (let i = 0; i < allStudents.length; i += batchSize) {
  const batch = allStudents.slice(i, i + batchSize);
  await importBatch(batch);
}
```

### 2. Handle Failed Rows

Collect failed rows and allow retry:

```javascript
const failedRows = result.data.results.failed.map((f) => ({
  row: f.row,
  data: f.data,
  error: f.error,
}));

// Allow user to fix and retry
retryImport(failedRows);
```

### 3. Show Progress

For large imports, show progress to user:

```javascript
console.log(`Programs created: ${programsCreated}`);
console.log(`Sections created: ${sectionsCreated}`);
console.log(`Students imported: ${successful}/${total}`);
```

---

## Summary

**Use this endpoint when:**

- ✅ Importing from CSV with raw column names
- ✅ Programs don't exist yet (will be created)
- ✅ Sections don't exist yet (will be created)
- ✅ You want automatic resource management

**Use the old endpoint when:**

- Programs and sections already exist
- You have programId and sectionId ready
- You need more control over the import process

---

## Complete cURL Example

```bash
curl -X POST http://localhost:5000/api/college-admin/students/bulk-import-csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "students": [
      {
        "Program": "F.Sc. (Pre-Engineering)-Mathematics, Chemistry, Physics",
        "Roll No": "435",
        "Student Name": "NAWALGUL",
        "Student Phone": "3226292112",
        "Father Name": "SOHAIL AKHTAR",
        "Student CNIC/FORM-B": "3330379906284",
        "Class": "1st Year",
        "Subject-Combination": "1st Shift - Mathematics, Chemistry, Physics"
      }
    ],
    "createLoginAccounts": false
  }'
```

🎉 **Your CSV data is now ready to be imported with zero preprocessing!**
