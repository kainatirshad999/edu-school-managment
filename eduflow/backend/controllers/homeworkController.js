const asyncHandler = require("express-async-handler");
const Homework = require("../models/Homework");

const createHomework = asyncHandler(async (req, res) => {
  const { classId, subjectId, title, description, dueDate, attachmentUrl } = req.body;
  const homework = await Homework.create({
    school: req.user.school,
    class: classId,
    subject: subjectId,
    title,
    description,
    dueDate,
    attachmentUrl,
    createdBy: req.user.id,
  });
  res.status(201).json({ success: true, data: homework });
});

const getHomework = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const match = { school: req.user.school };
  if (classId) match.class = classId;
  const items = await Homework.find(match).populate("subject", "name").populate("class", "name section").sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

const updateHomework = asyncHandler(async (req, res) => {
  const item = await Homework.findOneAndUpdate({ _id: req.params.id, school: req.user.school }, req.body, { new: true });
  if (!item) {
    res.status(404);
    throw new Error("Homework not found");
  }
  res.json({ success: true, data: item });
});

const deleteHomework = asyncHandler(async (req, res) => {
  const item = await Homework.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!item) {
    res.status(404);
    throw new Error("Homework not found");
  }
  res.json({ success: true, message: "Homework deleted" });
});

module.exports = { createHomework, getHomework, updateHomework, deleteHomework };
