const express = require("express");
const router = express.Router();
const { protect, authorize, hasPermission } = require("../middleware/auth");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMyStudentProfile,
  getMyChildProfile,
} = require("../controllers/studentController");

router.use(protect);

router.get("/me/profile", authorize("student"), getMyStudentProfile);
router.get("/me/child", authorize("parent"), getMyChildProfile);

router
  .route("/")
  .get(hasPermission("view_students"), getStudents)
  .post(authorize("admin"), createStudent);

router
  .route("/:id")
  .get(hasPermission("view_students"), getStudentById)
  .put(authorize("admin"), updateStudent)
  .delete(authorize("admin"), deleteStudent);

module.exports = router;
