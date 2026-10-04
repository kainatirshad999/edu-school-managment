const express = require("express");
const router = express.Router();
const { protect, hasPermission } = require("../middleware/auth");
const { createNotice, getNotices, updateNotice, deleteNotice } = require("../controllers/noticeController");

router.use(protect);

router.route("/").get(getNotices).post(hasPermission("create_notice"), createNotice);
router
  .route("/:id")
  .put(hasPermission("create_notice"), updateNotice)
  .delete(hasPermission("create_notice"), deleteNotice);

module.exports = router;
