const asyncHandler = require("express-async-handler");
const Concession = require("../models/Concession");
const FeeStructure = require("../models/FeeStructure");

// @route POST /api/fees/concession
const createConcession = asyncHandler(async (req, res) => {
  const { studentId, classId, feeStructureId, type, value, description } = req.body;
  const school = req.user.school;

  const structure = await FeeStructure.findOne({ _id: feeStructureId, school });
  if (!structure) {
    res.status(404);
    throw new Error("Fee structure not found");
  }

  const effectiveAmount = type === "percentage" ? (structure.amount * value) / 100 : Number(value);

  const concession = await Concession.create({
    school,
    student: studentId,
    class: classId,
    feeStructure: feeStructureId,
    type,
    value,
    effectiveAmount,
    description,
  });
  res.status(201).json({ success: true, data: concession });
});

// @route GET /api/fees/concession
const getConcessions = asyncHandler(async (req, res) => {
  const concessions = await Concession.find({ school: req.user.school })
    .populate({ path: "student", populate: { path: "user", select: "name" } })
    .populate("class", "name section")
    .populate("feeStructure", "title amount")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: concessions });
});

// @route PUT /api/fees/concession/:id
const updateConcession = asyncHandler(async (req, res) => {
  const { type, value } = req.body;
  const concession = await Concession.findOne({ _id: req.params.id, school: req.user.school }).populate("feeStructure");
  if (!concession) {
    res.status(404);
    throw new Error("Concession not found");
  }
  concession.type = type ?? concession.type;
  concession.value = value ?? concession.value;
  concession.effectiveAmount =
    concession.type === "percentage"
      ? (concession.feeStructure.amount * concession.value) / 100
      : Number(concession.value);
  await concession.save();
  res.json({ success: true, data: concession });
});

// @route DELETE /api/fees/concession/:id
const deleteConcession = asyncHandler(async (req, res) => {
  const concession = await Concession.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!concession) {
    res.status(404);
    throw new Error("Concession not found");
  }
  res.json({ success: true, message: "Concession deleted" });
});

module.exports = { createConcession, getConcessions, updateConcession, deleteConcession };
