const asyncHandler = require("express-async-handler");
const Subject = require("../models/Subject");
const Class = require("../models/Class");

// @desc Create subject
// @route POST /api/subjects
const createSubject = asyncHandler(async (req, res) => {
  const { name, code, description } = req.body;
  const subject = await Subject.create({ school: req.user.school, name, code, description });
  res.status(201).json({ success: true, data: subject });
});

// @desc List subjects
// @route GET /api/subjects
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({ school: req.user.school }).sort({ name: 1 });
  res.json({ success: true, data: subjects });
});

// @desc Update subject
// @route PUT /api/subjects/:id
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOneAndUpdate(
    { _id: req.params.id, school: req.user.school },
    req.body,
    { new: true }
  );
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }
  res.json({ success: true, data: subject });
});

// @desc Delete subject
// @route DELETE /api/subjects/:id
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!subject) {
    res.status(404);
    throw new Error("Subject not found");
  }
  res.json({ success: true, message: "Subject deleted" });
});

// @desc  Class-wise subject assignment summary/overview (for graphical view)
// @route GET /api/subjects/overview
const subjectOverview = asyncHandler(async (req, res) => {
  const classes = await Class.find({ school: req.user.school })
    .populate("subjects.subject", "name")
    .select("name section subjects");

  const overview = classes.map((c) => ({
    className: `${c.name} ${c.section}`,
    subjectCount: c.subjects.length,
    subjects: c.subjects.map((s) => s.subject?.name).filter(Boolean),
  }));

  res.json({ success: true, data: overview });
});

module.exports = { createSubject, getSubjects, updateSubject, deleteSubject, subjectOverview };
