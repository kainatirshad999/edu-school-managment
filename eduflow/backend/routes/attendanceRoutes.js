const express = require("express");
const router = express.Router();
const { protect, hasPermission } = require("../middleware/auth");
const {
  markAttendance,
  getClassAttendance,
  getStudentAttendance,
  getOverview,
} = require("../controllers/attendanceController");

router.use(protect);

router.post("/mark", hasPermission("mark_attendance"), markAttendance);
router.get("/class/:classId", hasPermission("view_attendance"), getClassAttendance);
router.get("/student/:studentId", hasPermission("view_attendance"), getStudentAttendance);
router.get("/overview", getOverview);

module.exports = router;
