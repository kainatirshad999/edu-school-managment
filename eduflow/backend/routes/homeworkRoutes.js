const express = require("express");
const router = express.Router();
const { protect, hasPermission } = require("../middleware/auth");
const { createHomework, getHomework, updateHomework, deleteHomework } = require("../controllers/homeworkController");

router.use(protect);

router
  .route("/")
  .get(hasPermission("view_homework"), getHomework)
  .post(hasPermission("assign_homework"), createHomework);
router
  .route("/:id")
  .put(hasPermission("edit_homework"), updateHomework)
  .delete(hasPermission("delete_homework"), deleteHomework);

module.exports = router;
