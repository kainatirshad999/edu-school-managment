const express = require("express");
const router = express.Router();
const { protect, authorize, hasPermission } = require("../middleware/auth");
const {
  createPeriod, getPeriods, updatePeriod, deletePeriod,
  setClassTimetable, getClassTimetable, getTeacherTimetable,
} = require("../controllers/timetableController");

router.use(protect, hasPermission("view_timetable"));

router.route("/periods").get(getPeriods).post(authorize("admin"), createPeriod);
router.route("/periods/:id").put(authorize("admin"), updatePeriod).delete(authorize("admin"), deletePeriod);

router
  .route("/class/:classId")
  .get(getClassTimetable)
  .put(hasPermission("edit_timetable"), setClassTimetable);

router.get("/teacher/:teacherId", getTeacherTimetable);

module.exports = router;
