const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getSchool, updateSchool } = require("../controllers/schoolController");

router.use(protect, authorize("admin"));
router.get("/me", getSchool);
router.put("/me", updateSchool);

module.exports = router;
