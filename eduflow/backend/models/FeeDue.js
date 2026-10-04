const mongoose = require("mongoose");

const feeDueSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    feeStructure: { type: mongoose.Schema.Types.ObjectId, ref: "FeeStructure", required: true },
    academicYear: { type: String, required: true },
    period: { type: String }, // e.g. "2026-08" for monthly, "Q1" for quarterly
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    concessionAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "partial", "paid", "overdue"], default: "pending" },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

feeDueSchema.methods.recompute = function () {
  const net = this.amountDue - this.concessionAmount;
  if (this.amountPaid <= 0) this.status = this.dueDate && this.dueDate < new Date() ? "overdue" : "pending";
  else if (this.amountPaid >= net) this.status = "paid";
  else this.status = "partial";
};

module.exports = mongoose.model("FeeDue", feeDueSchema);
