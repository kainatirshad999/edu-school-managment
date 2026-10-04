const asyncHandler = require("express-async-handler");
const { Period, TimetableEntry } = require("../models/Timetable");

// ---- Periods ----
const createPeriod = asyncHandler(async (req, res) => {
  const { label, startTime, endTime, isBreak, order } = req.body;
  const period = await Period.create({ school: req.user.school, label, startTime, endTime, isBreak, order });
  res.status(201).json({ success: true, data: period });
});

const getPeriods = asyncHandler(async (req, res) => {
  const periods = await Period.find({ school: req.user.school }).sort({ order: 1 });
  res.json({ success: true, data: periods });
});

const updatePeriod = asyncHandler(async (req, res) => {
  const period = await Period.findOneAndUpdate({ _id: req.params.id, school: req.user.school }, req.body, { new: true });
  if (!period) {
    res.status(404);
    throw new Error("Period not found");
  }
  res.json({ success: true, data: period });
});

const deletePeriod = asyncHandler(async (req, res) => {
  const period = await Period.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!period) {
    res.status(404);
    throw new Error("Period not found");
  }
  res.json({ success: true, message: "Period deleted" });
});

// ---- Timetable entries ----
// @route PUT /api/timetable/class/:classId  body: { entries: [{ day, periodId, subjectId, teacherId }] }
const setClassTimetable = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { entries } = req.body;
  const school = req.user.school;

  const ops = entries.map((e) => ({
    updateOne: {
      filter: { school, class: classId, day: e.day, period: e.periodId },
      update: { $set: { subject: e.subjectId, teacher: e.teacherId } },
      upsert: true,
    },
  }));
  if (ops.length) await TimetableEntry.bulkWrite(ops);
  res.json({ success: true, message: "Timetable updated" });
});

const getClassTimetable = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const entries = await TimetableEntry.find({ school: req.user.school, class: classId })
    .populate("period")
    .populate("subject", "name")
    .populate("teacher", "name");
  res.json({ success: true, data: entries });
});

const getTeacherTimetable = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const entries = await TimetableEntry.find({ school: req.user.school, teacher: teacherId })
    .populate("period")
    .populate("subject", "name")
    .populate("class", "name section");
  res.json({ success: true, data: entries });
});

module.exports = {
  createPeriod, getPeriods, updatePeriod, deletePeriod,
  setClassTimetable, getClassTimetable, getTeacherTimetable,
};
