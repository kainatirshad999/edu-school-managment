const express = require("express");
const router = express.Router();
const { protect, authorize, hasPermission } = require("../middleware/auth");
const { createExam, getExams, getExamById, updateExam, deleteExam } = require("../controllers/examController");

router.use(protect);

router.route("/")
  .get(hasPermission("view_exam"), getExams)
  .post(hasPermission("create_exam"), createExam);

router.route("/:id")
  .get(hasPermission("view_exam"), getExamById)
  .put(hasPermission("edit_exam"), updateExam)
  .delete(authorize("admin"), deleteExam);

module.exports = router;
