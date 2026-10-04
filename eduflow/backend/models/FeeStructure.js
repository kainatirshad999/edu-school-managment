const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    title: { type: String, required: true }, // e.g. "Tuition Fee"
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ["monthly", "quarterly", "yearly", "one-time"], default: "monthly" },
    academicYear: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
