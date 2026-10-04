const asyncHandler = require("express-async-handler");
const FeeStructure = require("../models/FeeStructure");

// @route POST /api/fees/structure
const createFeeStructure = asyncHandler(async (req, res) => {
  const { classId, title, amount, frequency, academicYear, description } = req.body;
  const fee = await FeeStructure.create({
    school: req.user.school,
    class: classId,
    title,
    amount,
    frequency,
    academicYear,
    description,
  });
  res.status(201).json({ success: true, data: fee });
});

// @route GET /api/fees/structure?classId=...
const getFeeStructures = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const match = { school: req.user.school };
  if (classId) match.class = classId;
  const fees = await FeeStructure.find(match).populate("class", "name section").sort({ createdAt: -1 });
  res.json({ success: true, data: fees });
});

// @route PUT /api/fees/structure/:id
const updateFeeStructure = asyncHandler(async (req, res) => {
  const fee = await FeeStructure.findOneAndUpdate(
    { _id: req.params.id, school: req.user.school },
    req.body,
    { new: true }
  );
  if (!fee) {
    res.status(404);
    throw new Error("Fee head not found");
  }
  res.json({ success: true, data: fee });
});

// @route DELETE /api/fees/structure/:id
const deleteFeeStructure = asyncHandler(async (req, res) => {
  const fee = await FeeStructure.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!fee) {
    res.status(404);
    throw new Error("Fee head not found");
  }
  res.json({ success: true, message: "Fee head deleted" });
});

module.exports = { createFeeStructure, getFeeStructures, updateFeeStructure, deleteFeeStructure };
