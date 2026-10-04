const asyncHandler = require("express-async-handler");
const FeeDue = require("../models/FeeDue");
const FeeStructure = require("../models/FeeStructure");
const FeePayment = require("../models/FeePayment");
const Student = require("../models/Student");
const Concession = require("../models/Concession");

const genReceiptNumber = () => `RCPT-${Date.now().toString().slice(-8)}`;

// @desc  Generate FeeDue records for every student in a class for the fee heads defined
// @route POST /api/fees/generate-dues
// body: { classId, academicYear, period }
const generateDues = asyncHandler(async (req, res) => {
  const { classId, academicYear, period } = req.body;
  const school = req.user.school;

  const structures = await FeeStructure.find({ school, class: classId, academicYear });
  const students = await Student.find({ school, class: classId });
  const concessions = await Concession.find({ school, class: classId });

  const ops = [];
  for (const student of students) {
    for (const structure of structures) {
      const concession = concessions.find(
        (c) => String(c.student) === String(student._id) && String(c.feeStructure) === String(structure._id)
      );
      ops.push({
        updateOne: {
          filter: { student: student._id, feeStructure: structure._id, period: period || academicYear },
          update: {
            $setOnInsert: {
              school,
              student: student._id,
              class: classId,
              feeStructure: structure._id,
              academicYear,
              period: period || academicYear,
              amountDue: structure.amount,
              concessionAmount: concession?.effectiveAmount || 0,
              status: "pending",
            },
          },
          upsert: true,
        },
      });
    }
  }
  if (ops.length) await FeeDue.bulkWrite(ops);
  res.json({ success: true, message: `${ops.length} fee due records ensured` });
});

// @desc  List all pending/partial/overdue dues for a class (Collect Fee screen)
// @route GET /api/fees/dues?classId=...
const getDuesByClass = asyncHandler(async (req, res) => {
  const { classId, status } = req.query;
  const school = req.user.school;
  const match = { school };
  if (classId) match.class = classId;
  if (status) match.status = status;

  const dues = await FeeDue.find(match)
    .populate({ path: "student", populate: { path: "user", select: "name" } })
    .populate("feeStructure", "title amount frequency")
    .sort({ createdAt: -1 });

  // Group by student for a summary row
  const byStudent = {};
  for (const d of dues) {
    const sid = String(d.student._id);
    if (!byStudent[sid]) {
      byStudent[sid] = {
        student: d.student,
        totalDue: 0,
        totalPaid: 0,
        pending: 0,
        items: [],
      };
    }
    const net = d.amountDue - d.concessionAmount;
    byStudent[sid].totalDue += d.amountDue;
    byStudent[sid].totalPaid += d.amountPaid;
    byStudent[sid].pending += Math.max(net - d.amountPaid, 0);
    byStudent[sid].items.push(d);
  }

  res.json({ success: true, data: Object.values(byStudent) });
});

// @desc  Collect a payment against one or more fee-due items
// @route POST /api/fees/collect
// body: { studentId, classId, items: [{ feeDueId, amount }], mode, remark }
const collectPayment = asyncHandler(async (req, res) => {
  const { studentId, classId, items, mode, remark } = req.body;
  const school = req.user.school;

  const receiptItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const due = await FeeDue.findOne({ _id: item.feeDueId, school });
    if (!due) continue;
    due.amountPaid += Number(item.amount);
    due.recompute();
    await due.save();

    const structureTitle = due.feeStructure ? undefined : undefined;
    receiptItems.push({ feeDue: due._id, title: item.title || "Fee", amount: Number(item.amount) });
    totalAmount += Number(item.amount);
  }

  const payment = await FeePayment.create({
    school,
    student: studentId,
    class: classId,
    items: receiptItems,
    totalAmount,
    mode,
    remark,
    receiptNumber: genReceiptNumber(),
    collectedBy: req.user.id,
  });

  res.status(201).json({ success: true, data: payment });
});

// @desc  Get one receipt by id (for printing)
// @route GET /api/fees/receipt/:id
const getReceipt = asyncHandler(async (req, res) => {
  const payment = await FeePayment.findOne({ _id: req.params.id, school: req.user.school })
    .populate({ path: "student", populate: { path: "user", select: "name" } })
    .populate("class", "name section");
  if (!payment) {
    res.status(404);
    throw new Error("Receipt not found");
  }
  res.json({ success: true, data: payment });
});

// @desc  Logged-in student's own fee dues + payment history
// @route GET /api/fees/my-dues
const getMyDues = asyncHandler(async (req, res) => {
  const school = req.user.school;
  const student = await Student.findOne({ school, user: req.user.id });
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }
  const [dues, payments] = await Promise.all([
    FeeDue.find({ school, student: student._id }).populate("feeStructure", "title amount frequency"),
    FeePayment.find({ school, student: student._id }).sort({ date: -1 }),
  ]);
  res.json({ success: true, data: { dues, payments } });
});

// @desc  Logged-in parent's linked child's fee dues + payment history
// @route GET /api/fees/child-dues
const getChildDues = asyncHandler(async (req, res) => {
  const school = req.user.school;
  const student = await Student.findOne({ school, "parent.linkedParentUser": req.user.id });
  if (!student) {
    res.status(404);
    throw new Error("No child is linked to this parent account");
  }
  const [dues, payments] = await Promise.all([
    FeeDue.find({ school, student: student._id }).populate("feeStructure", "title amount frequency"),
    FeePayment.find({ school, student: student._id }).sort({ date: -1 }),
  ]);
  res.json({ success: true, data: { dues, payments } });
});

// @desc  Student pays their own pending fee online (Student "Pay Now" button)
// @route POST /api/fees/pay-self
// body: { items: [{ feeDueId, amount }], mode, remark }
const payOwnFee = asyncHandler(async (req, res) => {
  const school = req.user.school;
  const student = await Student.findOne({ school, user: req.user.id });
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }

  const { items, mode, remark } = req.body;
  const receiptItems = [];
  let totalAmount = 0;

  for (const item of items) {
    // Ownership check: the due must belong to this student.
    const due = await FeeDue.findOne({ _id: item.feeDueId, school, student: student._id });
    if (!due) continue;
    due.amountPaid += Number(item.amount);
    due.recompute();
    await due.save();
    receiptItems.push({ feeDue: due._id, title: item.title || "Fee", amount: Number(item.amount) });
    totalAmount += Number(item.amount);
  }

  const payment = await FeePayment.create({
    school,
    student: student._id,
    class: student.class,
    items: receiptItems,
    totalAmount,
    mode: mode || "online",
    remark,
    receiptNumber: genReceiptNumber(),
    collectedBy: req.user.id,
  });

  res.status(201).json({ success: true, data: payment });
});

module.exports = {
  generateDues, getDuesByClass, collectPayment, getReceipt, payOwnFee, getMyDues, getChildDues,
};
