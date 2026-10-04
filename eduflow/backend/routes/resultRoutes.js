const express = require("express");
const router = express.Router();
const { protect, hasPermission, authorize } = require("../middleware/auth");
const {
  upsertResult, publishResults, getClassResults, getStudentResults, gradeDistribution,
} = require("../controllers/resultController");

router.use(protect);

router.post("/", hasPermission("add_result"), upsertResult);
router.put("/publish/:examId", hasPermission("publish_result"), publishResults);
router.get("/class/:classId/exam/:examId", hasPermission("view_result"), getClassResults);
router.get("/student/:studentId", hasPermission("view_result"), getStudentResults);
router.get("/reports/grade-distribution", authorize("admin"), gradeDistribution);

module.exports = router;
