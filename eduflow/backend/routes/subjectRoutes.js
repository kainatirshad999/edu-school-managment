const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createSubject, getSubjects, updateSubject, deleteSubject, subjectOverview,
} = require("../controllers/subjectController");

router.use(protect);

router.get("/overview", subjectOverview);
router.route("/").get(getSubjects).post(authorize("admin"), createSubject);
router.route("/:id").put(authorize("admin"), updateSubject).delete(authorize("admin"), deleteSubject);

module.exports = router;
