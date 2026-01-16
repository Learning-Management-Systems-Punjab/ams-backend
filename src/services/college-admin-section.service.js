import {
  createSection,
  findSectionById,
  findSectionsByCollegeId,
  findSectionsByProgramAndYear,
  countSectionsByCollegeId,
  updateSection,
  deleteSection,
  isRollRangeOverlapping,
  getStudentsCountInSection,
  bulkUpdateStudentSection,
  incrementSectionStrength,
  decrementSectionStrength,
} from "../dal/section.dal.js";
import { findCollegeById } from "../dal/college.dal.js";
import { findProgramById } from "../dal/program.dal.js";
import {
  findStudentsBySection,
  findStudentById as findStudentByIdDAL,
  updateStudent,
} from "../dal/student.dal.js";

/**
 * Create new section (college-scoped)
 * @param {Object} sectionData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const createSectionService = async (sectionData, collegeId) => {
  // Validate college exists
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  // Validate program exists and belongs to college
  const program = await findProgramById(sectionData.programId);
  if (!program) {
    throw new Error("Program not found");
  }
  if (program.collegeId.toString() !== collegeId.toString()) {
    throw new Error("Program does not belong to your college");
  }

  // If roll number range provided, check for overlaps
  if (sectionData.rollNumberRange) {
    const { start, end } = sectionData.rollNumberRange;

    if (start > end) {
      throw new Error("Roll number range start cannot be greater than end");
    }

    const isOverlapping = await isRollRangeOverlapping(
      collegeId,
      sectionData.programId,
      sectionData.year,
      start,
      end
    );

    if (isOverlapping) {
      throw new Error(
        `Roll number range ${start}-${end} overlaps with existing section`
      );
    }
  }

  const section = await createSection({
    ...sectionData,
    collegeId,
    currentStrength: 0,
  });

  return await findSectionById(section._id);
};

/**
 * Get all sections for college with pagination
 * @param {String} collegeId
 * @param {Number} page
 * @param {Number} limit
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
export const getAllSectionsService = async (
  collegeId,
  page = 1,
  limit = 50,
  filters = {}
) => {
  const skip = (page - 1) * limit;

  let sections;
  let total;

  if (filters.programId && filters.year) {
    sections = await findSectionsByProgramAndYear(
      collegeId,
      filters.programId,
      filters.year
    );
    total = sections.length;
    sections = sections.slice(skip, skip + limit);
  } else {
    [sections, total] = await Promise.all([
      findSectionsByCollegeId(collegeId, { skip, limit }),
      countSectionsByCollegeId(collegeId),
    ]);
  }

  return {
    sections,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get section by ID (college-scoped)
 * @param {String} sectionId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const getSectionByIdService = async (sectionId, collegeId) => {
  const section = await findSectionById(sectionId);

  if (!section) {
    throw new Error("Section not found");
  }

  if (section.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  // Get current student count
  const studentCount = await getStudentsCountInSection(sectionId);

  return {
    ...section.toObject(),
    currentStrength: studentCount,
  };
};

/**
 * Update section (college-scoped)
 * @param {String} sectionId
 * @param {Object} updateData
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const updateSectionService = async (
  sectionId,
  updateData,
  collegeId
) => {
  const section = await findSectionById(sectionId);

  if (!section) {
    throw new Error("Section not found");
  }

  if (section.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  // If updating roll number range, check for overlaps
  if (updateData.rollNumberRange) {
    const { start, end } = updateData.rollNumberRange;

    if (start > end) {
      throw new Error("Roll number range start cannot be greater than end");
    }

    const isOverlapping = await isRollRangeOverlapping(
      collegeId,
      section.programId._id.toString(),
      section.year,
      start,
      end,
      sectionId // Exclude current section from overlap check
    );

    if (isOverlapping) {
      throw new Error(
        `Roll number range ${start}-${end} overlaps with existing section`
      );
    }
  }

  // Prevent updating collegeId and programId
  delete updateData.collegeId;
  delete updateData.programId;

  const updatedSection = await updateSection(sectionId, updateData);
  return updatedSection;
};

/**
 * Delete section (soft delete, college-scoped)
 * @param {String} sectionId
 * @param {String} collegeId
 * @returns {Promise<Object>}
 */
export const deleteSectionService = async (sectionId, collegeId) => {
  const section = await findSectionById(sectionId);

  if (!section) {
    throw new Error("Section not found");
  }

  if (section.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  // Check if section has students
  const studentCount = await getStudentsCountInSection(sectionId);
  if (studentCount > 0) {
    throw new Error(
      `Cannot delete section with ${studentCount} students. Please reassign students first.`
    );
  }

  await deleteSection(sectionId);

  return {
    message: "Section deleted successfully",
    sectionId,
  };
};

/**
 * Split section by roll number ranges
 * Creates multiple sections and distributes students based on their roll numbers
 * @param {String} collegeId
 * @param {String} programId
 * @param {String} year
 * @param {Array} sectionRanges - Array of { name, start, end, shift, capacity }
 * @returns {Promise<Object>}
 */
export const splitSectionByRollRangesService = async (
  collegeId,
  programId,
  year,
  sectionRanges
) => {
  // Validate college
  const college = await findCollegeById(collegeId);
  if (!college) {
    throw new Error("College not found");
  }

  // Validate program
  const program = await findProgramById(programId);
  if (!program) {
    throw new Error("Program not found");
  }
  if (program.collegeId.toString() !== collegeId.toString()) {
    throw new Error("Program does not belong to your college");
  }

  // Validate ranges don't overlap
  for (let i = 0; i < sectionRanges.length; i++) {
    for (let j = i + 1; j < sectionRanges.length; j++) {
      const range1 = sectionRanges[i];
      const range2 = sectionRanges[j];

      if (
        (range1.start <= range2.end && range1.end >= range2.start) ||
        (range2.start <= range1.end && range2.end >= range1.start)
      ) {
        throw new Error(
          `Roll number ranges overlap: ${range1.name} (${range1.start}-${range1.end}) and ${range2.name} (${range2.start}-${range2.end})`
        );
      }
    }
  }

  // Check for overlaps with existing sections
  for (const range of sectionRanges) {
    const isOverlapping = await isRollRangeOverlapping(
      collegeId,
      programId,
      year,
      range.start,
      range.end
    );

    if (isOverlapping) {
      throw new Error(
        `Roll number range ${range.start}-${range.end} overlaps with existing section`
      );
    }
  }

  const createdSections = [];
  const studentAssignments = [];

  // Create sections
  for (const range of sectionRanges) {
    const section = await createSection({
      name: range.name,
      collegeId,
      programId,
      year,
      shift: range.shift || "1st Shift",
      rollNumberRange: {
        start: range.start,
        end: range.end,
      },
      subjects: range.subjects || [],
      capacity: range.capacity || 100,
      currentStrength: 0,
    });

    createdSections.push(section);
  }

  // Get all students for this program and year
  const Student = (await import("../models/student.js")).default;
  const students = await Student.find({
    collegeId,
    programId,
    isActive: true,
  }).select("_id rollNumber name sectionId");

  // Assign students to sections based on roll numbers
  for (const student of students) {
    const rollNum = parseInt(student.rollNumber);
    if (isNaN(rollNum)) continue;

    for (const section of createdSections) {
      if (
        rollNum >= section.rollNumberRange.start &&
        rollNum <= section.rollNumberRange.end
      ) {
        // Update student's section
        await updateStudent(student._id, { sectionId: section._id });

        studentAssignments.push({
          studentId: student._id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          oldSectionId: student.sectionId,
          newSectionId: section._id,
          sectionName: section.name,
        });

        // Increment section strength
        await incrementSectionStrength(section._id);

        break;
      }
    }
  }

  return {
    message: "Sections created and students assigned successfully",
    sectionsCreated: createdSections.length,
    studentsReassigned: studentAssignments.length,
    sections: createdSections,
    assignments: studentAssignments,
  };
};

/**
 * Manually assign student to a section
 * @param {String} collegeId
 * @param {String} studentId
 * @param {String} newSectionId
 * @returns {Promise<Object>}
 */
export const assignStudentToSectionService = async (
  collegeId,
  studentId,
  newSectionId
) => {
  // Validate student
  const student = await findStudentByIdDAL(studentId);
  if (!student) {
    throw new Error("Student not found");
  }

  if (student.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Student does not belong to your college");
  }

  // Validate new section
  const newSection = await findSectionById(newSectionId);
  if (!newSection) {
    throw new Error("Section not found");
  }

  if (newSection.collegeId._id.toString() !== collegeId.toString()) {
    throw new Error("Section does not belong to your college");
  }

  // Check if programs match
  if (
    student.programId._id.toString() !== newSection.programId._id.toString()
  ) {
    throw new Error("Student program does not match section program");
  }

  const oldSectionId = student.sectionId?._id;

  // Update student's section
  await updateStudent(studentId, { sectionId: newSectionId });

  // Update section strengths
  if (oldSectionId) {
    await decrementSectionStrength(oldSectionId);
  }
  await incrementSectionStrength(newSectionId);

  return {
    message: "Student assigned to section successfully",
    studentId,
    studentName: student.name,
    rollNumber: student.rollNumber,
    oldSection: oldSectionId ? student.sectionId.name : null,
    newSection: newSection.name,
  };
};

/**
 * Bulk assign students to sections
 * @param {String} collegeId
 * @param {Array} assignments - Array of { studentId, sectionId }
 * @returns {Promise<Object>}
 */
export const bulkAssignStudentsToSectionsService = async (
  collegeId,
  assignments
) => {
  const results = {
    successful: [],
    failed: [],
  };

  for (const assignment of assignments) {
    try {
      const result = await assignStudentToSectionService(
        collegeId,
        assignment.studentId,
        assignment.sectionId
      );
      results.successful.push(result);
    } catch (error) {
      results.failed.push({
        studentId: assignment.studentId,
        sectionId: assignment.sectionId,
        error: error.message,
      });
    }
  }

  return {
    summary: {
      total: assignments.length,
      successful: results.successful.length,
      failed: results.failed.length,
    },
    results,
  };
};
