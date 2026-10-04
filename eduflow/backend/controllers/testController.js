const asyncHandler = require("express-async-handler");
const Test = require("../models/Test");

const createTest = asyncHandler(async (req, res) => {
  const { classId, subjectId, title, testDate, totalMarks, description } = req.body;
  const test = await Test.create({
    school: req.user.school, class: classId, subject: subjectId, title, testDate, totalMarks, description,
    createdBy: req.user.id,
  });
  res.status(201).json({ success: true, data: test });
});

const getTests = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const match = { school: req.user.school };
  if (classId) match.class = classId;
  const tests = await Test.find(match).populate("subject", "name").populate("class", "name section").sort({ testDate: -1 });
  res.json({ success: true, data: tests });
});

const updateTest = asyncHandler(async (req, res) => {
  const test = await Test.findOneAndUpdate({ _id: req.params.id, school: req.user.school }, req.body, { new: true });
  if (!test) {
    res.status(404);
    throw new Error("Test not found");
  }
  res.json({ success: true, data: test });
});

const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!test) {
    res.status(404);
    throw new Error("Test not found");
  }
  res.json({ success: true, message: "Test deleted" });
});

module.exports = { createTest, getTests, updateTest, deleteTest };
