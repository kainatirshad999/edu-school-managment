const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    items: [
      {
        feeDue: { type: mongoose.Schema.Types.ObjectId, ref: "FeeDue" },
        title: String,
        amount: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    mode: { type: String, enum: ["cash", "cheque", "dd", "online"], required: true },
    remark: { type: String },
    receiptNumber: { type: String, required: true, unique: true },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeePayment", feePaymentSchema);
