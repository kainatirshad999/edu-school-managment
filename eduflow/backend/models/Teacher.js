const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    teacherId: { type: String, required: true, unique: true }, // e.g. TCH-2026-0001
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    qualification: { type: String },
    experienceYears: { type: Number, default: 0 },
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
