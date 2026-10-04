const asyncHandler = require("express-async-handler");
const School = require("../models/School");

// @desc  Get current school's profile/settings
// @route GET /api/school/me
const getSchool = asyncHandler(async (req, res) => {
  const school = await School.findById(req.user.school);
  res.json({ success: true, data: school });
});

// @desc  Update school profile + settings
// @route PUT /api/school/me
const updateSchool = asyncHandler(async (req, res) => {
  const { name, phone, address, academicYear, settings } = req.body;
  const school = await School.findByIdAndUpdate(
    req.user.school,
    { ...(name && { name }), ...(phone && { phone }), ...(address && { address }), ...(academicYear && { academicYear }), ...(settings && { settings }) },
    { new: true }
  );
  res.json({ success: true, data: school });
});

module.exports = { getSchool, updateSchool };
