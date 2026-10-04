const express = require("express");
const router = express.Router();
const { protect, authorize, hasPermission } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createAssignment, getAssignments, deleteAssignment, submitAssignment, getSubmissions, gradeSubmission,
} = require("../controllers/assignmentController");

router.use(protect);

router.route("/")
  .get(hasPermission("view_assignment"), getAssignments)
  .post(hasPermission("create_assignment"), upload.single("attachment"), createAssignment);

router.delete("/:id", hasPermission("delete_assignment"), deleteAssignment);

// Student submits their work
router.post("/:id/submit", authorize("student"), upload.single("file"), submitAssignment);

// Teacher/Admin review + grade submissions
router.get("/:id/submissions", hasPermission("grade_assignment"), getSubmissions);
router.put("/submissions/:submissionId/grade", hasPermission("grade_assignment"), gradeSubmission);

module.exports = router;
