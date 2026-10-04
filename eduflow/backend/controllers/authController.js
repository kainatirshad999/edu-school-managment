const asyncHandler = require("express-async-handler");
const School = require("../models/School");
const User = require("../models/User");
const Otp = require("../models/Otp");
const generateToken = require("../utils/generateToken");
const { sendEmail, generateOtp, otpEmailTemplate } = require("../utils/email");

// @desc  Step 1: Start school registration -> send OTP to school email
// @route POST /api/auth/school/register/start
const startSchoolRegistration = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const existing = await School.findOne({ email: email.toLowerCase() });
  if (existing && existing.isVerified) {
    res.status(400);
    throw new Error("A school is already registered with this email");
  }

  // Upsert an unverified school record holding the pending data
  const school =
    existing ||
    (await School.create({ name, email, password, phone, address, isVerified: false }));

  if (existing) {
    existing.name = name;
    existing.password = password; // will be re-hashed by pre-save hook
    existing.phone = phone;
    existing.address = address;
    await existing.save();
  }

  const code = generateOtp();
  console.log(`\n========== OTP for ${email}: ${code} ==========\n`);
  await Otp.create({
    email: email.toLowerCase(),
    code,
    purpose: "school-registration",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: email,
    subject: "EduFlow - Verify your school email",
    html: otpEmailTemplate(code),
  });

  res.status(200).json({
    success: true,
    message: "OTP sent (if SMTP is configured). Also check the terminal log.",
    schoolId: school._id,
  });
});

// @desc  Step 2: Verify OTP -> mark school verified & log admin in
// @route POST /api/auth/school/register/verify
const verifySchoolRegistration = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const record = await Otp.findOne({ email: email.toLowerCase(), code, purpose: "school-registration" });
  if (!record) {
    res.status(400);
    throw new Error("Invalid ya expired OTP");
  }

  const school = await School.findOneAndUpdate(
    { email: email.toLowerCase() },
    { isVerified: true },
    { new: true }
  );
  if (!school) {
    res.status(404);
    throw new Error("School record not found");
  }

  await Otp.deleteMany({ email: email.toLowerCase(), purpose: "school-registration" });

  const token = generateToken({ id: school._id, role: "admin", school: school._id });
  res.status(201).json({
    success: true,
    token,
    user: { id: school._id, name: school.name, email: school.email, role: "admin" },
  });
});

// @desc  Unified login for Admin / Teacher / Student / Parent
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    res.status(400);
    throw new Error("Email, password and role are required");
  }

  if (role === "admin") {
    const school = await School.findOne({ email: email.toLowerCase() }).select("+password");
    if (!school || !school.isVerified || !(await school.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid credentials");
    }
    const token = generateToken({ id: school._id, role: "admin", school: school._id });
    return res.json({
      success: true,
      token,
      user: { id: school._id, name: school.name, email: school.email, role: "admin" },
    });
  }

  if (!["teacher", "student", "parent"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findOne({ email: email.toLowerCase(), role }).select("+password");
  if (!user || !user.isActive || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = generateToken({ id: user._id, role: user.role, school: user.school });
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
  });
});

// @desc  Get currently logged-in profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @desc  Logout (client just discards token; endpoint kept for cookie-based flows)
// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out" });
});

module.exports = {
  startSchoolRegistration,
  verifySchoolRegistration,
  login,
  getMe,
  logout,
};
