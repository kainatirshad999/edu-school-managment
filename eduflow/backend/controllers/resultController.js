const asyncHandler = require("express-async-handler");
const Result = require("../models/Result");
const Student = require("../models/Student");

const assertOwnStudent = async (req, studentId) => {
  if (!["student", "parent"].includes(req.user.role)) return;
  const filter = req.user.role === "student"
    ? { user: req.user.id }
    : { "parent.linkedParentUser": req.user.id };
  const owned = await Student.findOne({ ...filter, _id: studentId });
  if (!owned) {
    const err = new Error("You can only view your own / your child's results");
    err.statusCode = 403;
    throw err;
  }
};

// @desc  Add or update a student's result for an exam
// @route POST /api/results
const upsertResult = asyncHandler(async (req, res) => {
  const { examId, studentId, classId, subjectMarks } = req.body;
  const school = req.user.school;

  let result = await Result.findOne({ exam: examId, student: studentId });
  if (result) {
    result.subjectMarks = subjectMarks;
    await result.save();
  } else {
    result = await Result.create({ school, exam: examId, student: studentId, class: classId, subjectMarks });
  }
  res.status(201).json({ success: true, data: result });
});

// @desc  Publish results for an exam (bulk) - students/parents can then view
// @route PUT /api/results/publish/:examId
const publishResults = asyncHandler(async (req, res) => {
  await Result.updateMany({ exam: req.params.examId, school: req.user.school }, { isPublished: true });
  res.json({ success: true, message: "Results published" });
});

// @desc  Get results for a class + exam (admin/teacher grading view)
// @route GET /api/results/class/:classId/exam/:examId
const getClassResults = asyncHandler(async (req, res) => {
  const results = await Result.find({
    school: req.user.school,
    class: req.params.classId,
    exam: req.params.examId,
  }).populate({ path: "student", populate: { path: "user", select: "name" } });
  res.json({ success: true, data: results });
});

// @desc  Get a single student's published results (student/parent view)
// @route GET /api/results/student/:studentId
const getStudentResults = asyncHandler(async (req, res) => {
  await assertOwnStudent(req, req.params.studentId);
  const filter = { school: req.user.school, student: req.params.studentId };
  // Students/parents only ever see published results; admin/teacher can see drafts too.
  if (!["admin", "teacher"].includes(req.user.role)) filter.isPublished = true;

  const results = await Result.find(filter)
    .populate("exam", "title startDate endDate")
    .populate("subjectMarks.subject", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: results });
});

// @desc  Grade distribution report (Reports > Exam Result)
// @route GET /api/results/reports/grade-distribution
const gradeDistribution = asyncHandler(async (req, res) => {
  const { examId, classId } = req.query;
  const filter = { school: req.user.school, isPublished: true };
  if (examId) filter.exam = examId;
  if (classId) filter.class = classId;

  const results = await Result.find(filter).select("grade");
  const distribution = results.reduce((acc, r) => {
    acc[r.grade] = (acc[r.grade] || 0) + 1;
    return acc;
  }, {});
  res.json({ success: true, data: distribution, total: results.length });
});

module.exports = { upsertResult, publishResults, getClassResults, getStudentResults, gradeDistribution };
