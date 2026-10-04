const asyncHandler = require("express-async-handler");
const FeePayment = require("../models/FeePayment");
const FeeDue = require("../models/FeeDue");

// @desc  Day Book - all payments collected on a given date
// @route GET /api/fees/reports/day-book?date=2026-08-20
const dayBook = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const school = req.user.school;
  const day = date ? new Date(date) : new Date();
  const start = new Date(day.setHours(0, 0, 0, 0));
  const end = new Date(day.setHours(23, 59, 59, 999));

  const payments = await FeePayment.find({ school, date: { $gte: start, $lte: end } })
    .populate({ path: "student", populate: { path: "user", select: "name" } })
    .populate("class", "name section")
    .sort({ date: -1 });

  const total = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  res.json({ success: true, data: payments, total });
});

// @desc  Class Report - every student in a class + their balance
// @route GET /api/fees/reports/class/:classId
const classReport = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const school = req.user.school;

  const dues = await FeeDue.find({ school, class: classId }).populate({
    path: "student",
    populate: { path: "user", select: "name" },
  });

  const byStudent = {};
  for (const d of dues) {
    const sid = String(d.student._id);
    if (!byStudent[sid]) byStudent[sid] = { student: d.student, totalDue: 0, totalPaid: 0, balance: 0 };
    const net = d.amountDue - d.concessionAmount;
    byStudent[sid].totalDue += net;
    byStudent[sid].totalPaid += d.amountPaid;
    byStudent[sid].balance += Math.max(net - d.amountPaid, 0);
  }
  const rows = Object.values(byStudent).map((r) => ({
    ...r,
    status: r.balance <= 0 ? "clear" : "pending",
  }));

  res.json({ success: true, data: rows });
});

// @desc  Defaulters - students with any pending/overdue balance, school-wide or by class
// @route GET /api/fees/reports/defaulters
const defaulters = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const school = req.user.school;
  const match = { school, status: { $in: ["pending", "partial", "overdue"] } };
  if (classId) match.class = classId;

  const dues = await FeeDue.find(match)
    .populate({ path: "student", populate: { path: "user", select: "name" } })
    .populate("class", "name section")
    .populate("feeStructure", "title");

  const byStudent = {};
  for (const d of dues) {
    const sid = String(d.student._id);
    const net = d.amountDue - d.concessionAmount;
    const balance = Math.max(net - d.amountPaid, 0);
    if (balance <= 0) continue;
    if (!byStudent[sid]) byStudent[sid] = { student: d.student, class: d.class, balance: 0 };
    byStudent[sid].balance += balance;
  }

  const rows = Object.values(byStudent);
  res.json({ success: true, data: rows, total: rows.length });
});

// @desc  Student ledger - complete fee history for one student
// @route GET /api/fees/reports/ledger/:studentId
const studentLedger = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const school = req.user.school;

  const [dues, payments] = await Promise.all([
    FeeDue.find({ school, student: studentId }).populate("feeStructure", "title amount"),
    FeePayment.find({ school, student: studentId }).sort({ date: -1 }),
  ]);

  res.json({ success: true, data: { dues, payments } });
});

// @desc  Finance overview for Reports > Finance
// @route GET /api/fees/reports/finance
const financeOverview = asyncHandler(async (req, res) => {
  const school = req.user.school;
  const dues = await FeeDue.find({ school });

  let totalCollected = 0;
  let totalPending = 0;
  for (const d of dues) {
    const net = d.amountDue - d.concessionAmount;
    totalCollected += d.amountPaid;
    totalPending += Math.max(net - d.amountPaid, 0);
  }
  const collectionRate = totalCollected + totalPending > 0
    ? Number(((totalCollected / (totalCollected + totalPending)) * 100).toFixed(1))
    : 0;

  res.json({ success: true, data: { totalCollected, totalPending, collectionRate } });
});

module.exports = { dayBook, classReport, defaulters, studentLedger, financeOverview };
