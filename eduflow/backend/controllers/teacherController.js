const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const { sendEmail, credentialsEmailTemplate } = require("../utils/email");
const { ALL_PERMISSIONS, DEFAULT_TEACHER_PERMISSIONS } = require("../config/permissions");

const genTempPassword = () => Math.random().toString(36).slice(-8);

// @desc  Create teacher (Admin only)
// @route POST /api/teachers
const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, qualification, experienceYears, assignedClasses } = req.body;
  const school = req.user.school;

  const password = genTempPassword();
  const user = await User.create({ school, role: "teacher", name, email, password, phone });

  const teacherId = `TCH-${new Date().getFullYear()}-${uuidv4().slice(0, 6).toUpperCase()}`;
  const teacher = await Teacher.create({
    school,
    user: user._id,
    teacherId,
    subject: subject || undefined,
    qualification,
    experienceYears,
    assignedClasses: assignedClasses || [],
  });

  await sendEmail({
    to: email,
    subject: "EduFlow - Your Teacher Account",
    html: credentialsEmailTemplate({ name, id: teacherId, email, password, role: "Teacher" }),
  });

  res.status(201).json({ success: true, teacher, tempPassword: password });
});

// @desc  List teachers (paginated, searchable)
// @route GET /api/teachers
const getTeachers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const school = req.user.school;

  const userMatch = { school, role: "teacher" };
  if (search) userMatch.name = { $regex: search, $options: "i" };

  const users = await User.find(userMatch)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(userMatch);

  const teacherProfiles = await Teacher.find({ user: { $in: users.map((u) => u._id) } })
    .populate("subject", "name")
    .populate("assignedClasses", "name section");

  const merged = users.map((u) => {
    const profile = teacherProfiles.find((t) => String(t.user) === String(u._id));
    return { ...u.toObject(), teacherProfile: profile };
  });

  res.json({ success: true, data: merged, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @desc  Get single teacher
// @route GET /api/teachers/:id
const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ _id: req.params.id, school: req.user.school })
    .populate("user", "-password")
    .populate("subject")
    .populate("assignedClasses");
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }
  res.json({ success: true, data: teacher });
});

// @desc  Update teacher
// @route PUT /api/teachers/:id
const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ _id: req.params.id, school: req.user.school });
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }
  const { name, phone, subject, qualification, experienceYears, assignedClasses } = req.body;

  if (name || phone) {
    await User.findByIdAndUpdate(teacher.user, { ...(name && { name }), ...(phone && { phone }) });
  }
  teacher.subject = subject ?? teacher.subject;
  teacher.qualification = qualification ?? teacher.qualification;
  teacher.experienceYears = experienceYears ?? teacher.experienceYears;
  teacher.assignedClasses = assignedClasses ?? teacher.assignedClasses;
  await teacher.save();

  res.json({ success: true, data: teacher });
});

// @desc  Delete teacher
// @route DELETE /api/teachers/:id
const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ _id: req.params.id, school: req.user.school });
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }
  await User.findByIdAndDelete(teacher.user);
  await teacher.deleteOne();
  res.json({ success: true, message: "Teacher deleted" });
});

// @desc  Get permissions of one teacher (Roles & Permissions module)
// @route GET /api/teachers/:id/permissions
const getTeacherPermissions = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ _id: req.params.id, school: req.user.school }).populate("user");
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }
  res.json({
    success: true,
    all: ALL_PERMISSIONS,
    active: teacher.user.permissions || DEFAULT_TEACHER_PERMISSIONS,
  });
});

// @desc  Update permissions of one teacher
// @route PUT /api/teachers/:id/permissions
const updateTeacherPermissions = asyncHandler(async (req, res) => {
  const { permissions } = req.body; // array of permission strings
  const teacher = await Teacher.findOne({ _id: req.params.id, school: req.user.school });
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }
  const valid = (permissions || []).filter((p) => ALL_PERMISSIONS.includes(p));
  await User.findByIdAndUpdate(teacher.user, { permissions: valid });
  res.json({ success: true, permissions: valid });
});

// @desc  Logged-in teacher's own profile (assigned classes, subject etc.)
// @route GET /api/teachers/me/profile
const getMyTeacherProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user.id })
    .populate("user", "-password")
    .populate("subject", "name")
    .populate("assignedClasses", "name section");
  if (!teacher) {
    res.status(404);
    throw new Error("Teacher profile not found");
  }
  res.json({ success: true, data: teacher });
});

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeacherPermissions,
  updateTeacherPermissions,
  getMyTeacherProfile,
};
