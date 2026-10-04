const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  assignSubjects,
  deleteClass,
} = require("../controllers/classController");

router.use(protect);

router.route("/").get(getClasses).post(authorize("admin"), createClass);
router
  .route("/:id")
  .get(getClassById)
  .put(authorize("admin"), updateClass)
  .delete(authorize("admin"), deleteClass);
router.put("/:id/subjects", authorize("admin"), assignSubjects);

module.exports = router;
