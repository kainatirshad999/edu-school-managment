const express = require("express");
const router = express.Router();
const {
  startSchoolRegistration,
  verifySchoolRegistration,
  login,
  getMe,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/school/register/start", startSchoolRegistration);
router.post("/school/register/verify", verifySchoolRegistration);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
