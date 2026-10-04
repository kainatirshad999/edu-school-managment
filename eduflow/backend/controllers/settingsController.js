const asyncHandler = require("express-async-handler");
const School = require("../models/School");

// @desc  Get school profile/settings
// @route GET /api/school/settings
const getSettings = asyncHandler(async (req, res) => {
  const school = await School.findById(req.user.school);
  res.json({ success: true, data: school });
});

// @desc  Update school profile/settings (Admin only)
// @route PUT /api/school/settings
const updateSettings = asyncHandler(async (req, res) => {
  const { name, phone, address, academicYear, settings } = req.body;
  const school = await School.findByIdAndUpdate(
    req.user.school,
    { ...(name && { name }), ...(phone && { phone }), ...(address && { address }), ...(academicYear && { academicYear }), ...(settings && { settings }) },
    { new: true }
  );
  res.json({ success: true, data: school });
});

module.exports = { getSettings, updateSettings };
