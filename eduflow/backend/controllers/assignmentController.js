const asyncHandler = require("express-async-handler");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Student = require("../models/Student");

// @desc  Create an assignment (Teacher/Admin)
// @route POST /api/assignments
const createAssignment = asyncHandler(async (req, res) => {
  const { classId, subject, title, description, totalMarks, dueDate } = req.body;
  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const assignment = await Assignment.create({
    school: req.user.school,
    class: classId,
    subject: subject || undefined,
    teacher: req.user.id,
    title,
    description,
    attachmentUrl,
    totalMarks: totalMarks || 100,
    dueDate,
  });
  res.status(201).json({ success: true, data: assignment });
});

// @desc  List assignments (filter by class). For a student, also attaches
//        their own submission status for each assignment.
// @route GET /api/assignments
const getAssignments = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const match = { school: req.user.school };
  if (classId) match.class = classId;

  const assignments = await Assignment.find(match)
    .populate("subject", "name")
    .populate("teacher", "name")
    .populate("class", "name section")
    .sort({ dueDate: 1 });

  if (req.user.role === "student") {
    const student = await Student.findOne({ school: req.user.school, user: req.user.id });
    const submissions = await AssignmentSubmission.find({
      student: student?._id,
      assignment: { $in: assignments.map((a) => a._id) },
    });
    const withStatus = assignments.map((a) => ({
      ...a.toObject(),
      mySubmission: submissions.find((s) => String(s.assignment) === String(a._id)) || null,
    }));
    return res.json({ success: true, data: withStatus });
  }

  res.json({ success: true, data: assignments });
});

// @desc  Delete an assignment
// @route DELETE /api/assignments/:id
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, school: req.user.school });
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }
  await AssignmentSubmission.deleteMany({ assignment: assignment._id });
  res.json({ success: true, message: "Assignment deleted" });
});

// @desc  Student submits (or resubmits) their work for an assignment
// @route POST /api/assignments/:id/submit
const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOne({ _id: req.params.id, school: req.user.school });
  if (!assignment) {
    res.status(404);
    throw new Error("Assignment not found");
  }
  if (!req.file) {
    res.status(400);
    throw new Error("Please attach a file to submit");
  }

  const student = await Student.findOne({ school: req.user.school, user: req.user.id });
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const isLate = new Date() > new Date(assignment.dueDate);

  const submission = await AssignmentSubmission.findOneAndUpdate(
    { assignment: assignment._id, student: student._id },
    {
      school: req.user.school,
      fileUrl,
      note: req.body.note,
      submittedAt: new Date(),
      isLate,
      status: "submitted",
      // Resubmitting clears any previous grade - it's a new piece of work.
      marksObtained: undefined,
      feedback: undefined,
      gradedAt: undefined,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: submission });
});

// @desc  Teacher/Admin views all submissions for one assignment (to grade them)
// @route GET /api/assignments/:id/submissions
const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await AssignmentSubmission.find({ assignment: req.params.id, school: req.user.school })
    .populate({ path: "student", populate: { path: "user", select: "name" } })
    .sort({ submittedAt: -1 });
  res.json({ success: true, data: submissions });
});

// @desc  Grade one submission
// @route PUT /api/assignments/submissions/:submissionId/grade
const gradeSubmission = asyncHandler(async (req, res) => {
  const { marksObtained, feedback } = req.body;
  const submission = await AssignmentSubmission.findOneAndUpdate(
    { _id: req.params.submissionId, school: req.user.school },
    { marksObtained, feedback, status: "graded", gradedAt: new Date(), gradedBy: req.user.id },
    { new: true }
  );
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }
  res.json({ success: true, data: submission });
});

module.exports = {
  createAssignment, getAssignments, deleteAssignment, submitAssignment, getSubmissions, gradeSubmission,
};
