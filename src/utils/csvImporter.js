import fs from "fs";
import csv from "csv-parser";
import { findOrCreateProgram } from "../dal/program.dal.js";
import { findOrCreateSubject } from "../dal/subject.dal.js";
import { findSectionByRollNumber, createSection } from "../dal/section.dal.js";
import { createStudent, findStudentByRollNumber } from "../dal/student.dal.js";

/**
 * Parse subject combination string
 * @param {String} subjectCombination - e.g., "1st Shift - Mathematics, Chemistry, Physics"
 * @returns {Object} { shift, subjects }
 */
export const parseSubjectCombination = (subjectCombination) => {
  const parts = subjectCombination.split(" - ");
  const shift = parts[0].trim();
  const subjects = parts[1] ? parts[1].split(",").map((s) => s.trim()) : [];

  return { shift, subjects };
};

/**
 * Parse program name
 * @param {String} programName - e.g., "F.Sc. (Pre-Engineering)-Mathematics, Chemistry, Physics"
 * @returns {Object} { name, code }
 */
export const parseProgramName = (programName) => {
  const cleanName = programName.split("-")[0].trim();
  const code = cleanName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 10)
    .toUpperCase();

  return { name: cleanName, code };
};

/**
 * Generate subject code from name
 * @param {String} subjectName
 * @returns {String}
 */
export const generateSubjectCode = (subjectName) => {
  return subjectName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 8)
    .toUpperCase();
};

/**
 * Import students from CSV
 * @param {String} filePath - Path to CSV file
 * @param {String} collegeId - College ID
 * @returns {Promise<Object>} Import results
 */
export const importStudentsFromCSV = async (filePath, collegeId) => {
  return new Promise((resolve, reject) => {
    const results = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
      students: [],
    };

    const students = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        students.push(row);
      })
      .on("end", async () => {
        try {
          results.total = students.length;

          for (const row of students) {
            try {
              // Parse CSV row
              const programName = row["Program"];
              const rollNumber = row["Roll No"];
              const studentName = row["Student Name"];
              const studentPhone = row["Student Phone"];
              const fatherName = row["Father Name"];
              const cnic = row["Student CNIC/FORM-B"];
              const year = row["Class"];
              const subjectCombination = row["Subject-Combination"];

              // Skip if essential data is missing
              if (!programName || !rollNumber || !studentName || !fatherName) {
                results.failed++;
                results.errors.push({
                  row: row["No #"],
                  error: "Missing required fields",
                });
                continue;
              }

              // Check if student already exists
              const existingStudent = await findStudentByRollNumber(
                collegeId,
                rollNumber
              );
              if (existingStudent) {
                results.failed++;
                results.errors.push({
                  row: row["No #"],
                  rollNumber,
                  error: "Student already exists",
                });
                continue;
              }

              // Parse program
              const { name: progName, code: progCode } =
                parseProgramName(programName);
              let program = await findOrCreateProgram(
                collegeId,
                progName,
                progCode,
                2
              );

              // Parse and create subjects
              const { shift, subjects: subjectNames } =
                parseSubjectCombination(subjectCombination);
              const subjectIds = [];

              for (const subjectName of subjectNames) {
                const subjectCode = generateSubjectCode(subjectName);
                const subject = await findOrCreateSubject(
                  collegeId,
                  subjectName,
                  subjectCode
                );
                subjectIds.push(subject._id);
              }

              // Find or create section based on roll number
              let section = await findSectionByRollNumber(
                collegeId,
                program._id,
                parseInt(rollNumber)
              );

              if (!section) {
                // Create new section with roll number range
                // Determine range based on roll number (groups of 50)
                const rollNum = parseInt(rollNumber);
                const rangeStart = Math.floor((rollNum - 1) / 50) * 50 + 1;
                const rangeEnd = rangeStart + 49;

                const sectionName = `Section ${String.fromCharCode(
                  65 + Math.floor((rollNum - 1) / 50)
                )}`;

                section = await createSection({
                  name: sectionName,
                  collegeId,
                  programId: program._id,
                  year,
                  shift,
                  rollNumberRange: {
                    start: rangeStart,
                    end: rangeEnd,
                  },
                  subjects: subjectIds,
                  capacity: 50,
                });
              }

              // Create student
              const student = await createStudent({
                name: studentName,
                rollNumber: rollNumber.toString(),
                fatherName,
                contactNumber: studentPhone || null,
                cnic: cnic || null,
                collegeId,
                programId: program._id,
                sectionId: section._id,
                status: "Active",
              });

              results.success++;
              results.students.push(student);
            } catch (error) {
              results.failed++;
              results.errors.push({
                row: row["No #"],
                error: error.message,
              });
            }
          }

          resolve(results);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
