const express = require("express");
const router = express.Router();
const { protect, hasPermission } = require("../middleware/auth");
const { createTest, getTests, updateTest, deleteTest } = require("../controllers/testController");

router.use(protect);

router.route("/")
  .get(hasPermission("view_test"), getTests)
  .post(hasPermission("create_test"), createTest);

router.route("/:id")
  .put(hasPermission("edit_test"), updateTest)
  .delete(hasPermission("delete_test"), deleteTest);

module.exports = router;
