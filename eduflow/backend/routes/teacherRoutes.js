const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeacherPermissions,
  updateTeacherPermissions,
  getMyTeacherProfile,
} = require("../controllers/teacherController");

router.use(protect);

router.get("/me/profile", authorize("teacher"), getMyTeacherProfile);

router.route("/").get(getTeachers).post(authorize("admin"), createTeacher);
router
  .route("/:id")
  .get(getTeacherById)
  .put(authorize("admin"), updateTeacher)
  .delete(authorize("admin"), deleteTeacher);

router
  .route("/:id/permissions")
  .get(authorize("admin"), getTeacherPermissions)
  .put(authorize("admin"), updateTeacherPermissions);

module.exports = router;
