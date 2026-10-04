const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    title: { type: String, required: true },
    testDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    description: { type: String },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);
