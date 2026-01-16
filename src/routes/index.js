import express from "express";
import authRoutes from "./auth.routes.js";
import districtHeadRoutes from "./districtHead.routes.js";
import regionRoutes from "./region.routes.js";
import statisticsRoutes from "./statistics.routes.js";
import collegeRoutes from "./college.routes.js";
import teacherRoutes from "./teacher.routes.js";
import studentRoutes from "./student.routes.js";
import subjectRoutes from "./subject.routes.js";
import collegeAdminStatisticsRoutes from "./college-admin-statistics.routes.js";
import collegeAdminTeacherRoutes from "./college-admin-teacher.routes.js";
import collegeAdminStudentRoutes from "./college-admin-student.routes.js";

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/district-heads", districtHeadRoutes);
router.use("/regions", regionRoutes);
router.use("/statistics", statisticsRoutes);
router.use("/colleges", collegeRoutes);
router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);
router.use("/subjects", subjectRoutes);
router.use("/college-admin/statistics", collegeAdminStatisticsRoutes);
router.use("/college-admin/teachers", collegeAdminTeacherRoutes);
router.use("/college-admin/students", collegeAdminStudentRoutes);

export default router;
