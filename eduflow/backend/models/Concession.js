const mongoose = require("mongoose");

const concessionSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    feeStructure: { type: mongoose.Schema.Types.ObjectId, ref: "FeeStructure", required: true },
    type: { type: String, enum: ["percentage", "flat"], required: true },
    value: { type: Number, required: true }, // e.g. 20 (for 20%) or 500 (flat Rs)
    effectiveAmount: { type: Number, required: true }, // computed discount amount
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Concession", concessionSchema);
