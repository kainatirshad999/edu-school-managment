const express = require("express");
const router = express.Router();
const { protect, hasPermission } = require("../middleware/auth");
const {
  generateQuiz,
  homeworkHelp,
  eventPlan,
  generateNotice,
  askAboutSchool,
} = require("../controllers/aiController");

router.use(protect, hasPermission("use_ai_assistant"));

router.post("/quiz", generateQuiz);
router.post("/homework-help", homeworkHelp);
router.post("/event-plan", eventPlan);
router.post("/notice", generateNotice);
router.post("/ask", askAboutSchool);

module.exports = router;
