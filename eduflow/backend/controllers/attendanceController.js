const asyncHandler = require("express-async-handler");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// @desc  Mark attendance for a whole class on a date (bulk upsert)
// @route POST /api/attendance/mark
// body: { classId, date, records: [{ studentId, status }] }
const markAttendance = asyncHandler(async (req, res) => {
  const { classId, date, records } = req.body;
  const school = req.user.school;

  const ops = records.map((r) => ({
    updateOne: {
      filter: { student: r.studentId, date: new Date(date) },
      update: {
        $set: {
          school,
          class: classId,
          student: r.studentId,
          date: new Date(date),
          status: r.status,
          markedBy: req.user.id,
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);
  res.json({ success: true, message: "Attendance marked" });
});

// @desc  Get attendance for a class on a specific date
// @route GET /api/attendance/class/:classId?date=2026-08-20
const getClassAttendance = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { date } = req.query;
  const school = req.user.school;

  const students = await Student.find({ school, class: classId }).populate("user", "name");
  const dateObj = new Date(date);
  const records = await Attendance.find({ school, class: classId, date: dateObj });

  const merged = students.map((s) => {
    const rec = records.find((r) => String(r.student) === String(s._id));
    return { student: s._id, name: s.user?.name, rollNumber: s.rollNumber, status: rec?.status || null };
  });

  res.json({ success: true, data: merged });
});

// @desc  Get a single student's attendance history + overview stats
// @route GET /api/attendance/student/:studentId
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // A student/parent may only ever view the attendance tied to their own account.
  if (req.user.role === "student" || req.user.role === "parent") {
    const filter = req.user.role === "student"
      ? { user: req.user.id }
      : { "parent.linkedParentUser": req.user.id };
    const owned = await Student.findOne({ ...filter, _id: studentId });
    if (!owned) {
      res.status(403);
      throw new Error("You can only view your own / your child's attendance");
    }
  }

  const records = await Attendance.find({ student: studentId }).sort({ date: -1 });

  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const total = records.length;
  const rate = total ? Number(((present / total) * 100).toFixed(1)) : 0;

  res.json({ success: true, data: { records, summary: { present, absent, late, total, rate } } });
});

// @desc  Weekly attendance overview for admin dashboard chart
// @route GET /api/attendance/overview
const getOverview = asyncHandler(async (req, res) => {
  const school = req.user.school;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const records = await Attendance.aggregate([
    { $match: { school, date: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, data: records });
});

module.exports = { markAttendance, getClassAttendance, getStudentAttendance, getOverview };
