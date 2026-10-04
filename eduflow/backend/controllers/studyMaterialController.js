const asyncHandler = require("express-async-handler");
const StudyMaterial = require("../models/StudyMaterial");

// @desc  Upload study material
// @route POST /api/study-material
const createMaterial = asyncHandler(async (req, res) => {
  const { title, type, subject, classId, section, description } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const material = await StudyMaterial.create({
    school: req.user.school,
    uploadedBy: req.user.id,
    title,
    type,
    subject: subject || undefined,
    class: classId,
    section,
    description,
    fileUrl,
  });
  res.status(201).json({ success: true, data: material });
});

// @desc  List study material (filter by class/subject/type)
// @route GET /api/study-material
const getMaterials = asyncHandler(async (req, res) => {
  const { classId, subject, type } = req.query;
  const match = { school: req.user.school };
  if (classId) match.class = classId;
  if (subject) match.subject = subject;
  if (type && type !== "All") match.type = type;

  const materials = await StudyMaterial.find(match)
    .populate("subject", "name")
    .populate("class", "name section")
    .populate("uploadedBy", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: materials });
});

// @desc  Delete study material
// @route DELETE /api/study-material/:id
const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await StudyMaterial.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!material) {
    res.status(404);
    throw new Error("Material not found");
  }
  res.json({ success: true, message: "Deleted" });
});

module.exports = { createMaterial, getMaterials, deleteMaterial };
