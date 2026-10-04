const asyncHandler = require("express-async-handler");
const Class = require("../models/Class");
const Student = require("../models/Student");

// @desc  Create class
// @route POST /api/classes
const createClass = asyncHandler(async (req, res) => {
  const { name, section, classTeacher } = req.body;
  const klass = await Class.create({ school: req.user.school, name, section, classTeacher });
  res.status(201).json({ success: true, data: klass });
});

// @desc  List classes
// @route GET /api/classes
const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ school: req.user.school })
    .populate("classTeacher", "name")
    .populate("subjects.subject", "name")
    .populate("subjects.teacher", "name")
    .sort({ name: 1, section: 1 });
  res.json({ success: true, data: classes });
});

// @desc  Single class + student count
// @route GET /api/classes/:id
const getClassById = asyncHandler(async (req, res) => {
  const klass = await Class.findOne({ _id: req.params.id, school: req.user.school })
    .populate("classTeacher", "name")
    .populate("subjects.subject")
    .populate("subjects.teacher", "name");
  if (!klass) {
    res.status(404);
    throw new Error("Class not found");
  }
  const studentCount = await Student.countDocuments({ class: klass._id });
  res.json({ success: true, data: { ...klass.toObject(), studentCount } });
});

// @desc  Update class
// @route PUT /api/classes/:id
const updateClass = asyncHandler(async (req, res) => {
  const klass = await Class.findOneAndUpdate(
    { _id: req.params.id, school: req.user.school },
    req.body,
    { new: true, runValidators: true }
  );
  if (!klass) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json({ success: true, data: klass });
});

// @desc  Assign / release a subject+teacher for a class
// @route PUT /api/classes/:id/subjects
const assignSubjects = asyncHandler(async (req, res) => {
  const { subjects } = req.body; // [{ subject, teacher }]
  const klass = await Class.findOneAndUpdate(
    { _id: req.params.id, school: req.user.school },
    { subjects },
    { new: true }
  ).populate("subjects.subject subjects.teacher");
  if (!klass) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json({ success: true, data: klass });
});

// @desc  Delete class
// @route DELETE /api/classes/:id
const deleteClass = asyncHandler(async (req, res) => {
  const klass = await Class.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!klass) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json({ success: true, message: "Class deleted" });
});

module.exports = { createClass, getClasses, getClassById, updateClass, assignSubjects, deleteClass };
