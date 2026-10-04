const asyncHandler = require("express-async-handler");
const Exam = require("../models/Exam");

const createExam = asyncHandler(async (req, res) => {
  const { classId, title, startDate, endDate, description, subjects } = req.body;
  const exam = await Exam.create({
    school: req.user.school, class: classId, title, startDate, endDate, description, subjects,
  });
  res.status(201).json({ success: true, data: exam });
});

const getExams = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const match = { school: req.user.school };
  if (classId) match.class = classId;
  const exams = await Exam.find(match).populate("class", "name section").populate("subjects.subject", "name").sort({ startDate: -1 });
  res.json({ success: true, data: exams });
});

const getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, school: req.user.school })
    .populate("class", "name section").populate("subjects.subject", "name");
  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }
  res.json({ success: true, data: exam });
});

const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOneAndUpdate({ _id: req.params.id, school: req.user.school }, req.body, { new: true });
  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }
  res.json({ success: true, data: exam });
});

const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!exam) {
    res.status(404);
    throw new Error("Exam not found");
  }
  res.json({ success: true, message: "Exam deleted" });
});

module.exports = { createExam, getExams, getExamById, updateExam, deleteExam };
