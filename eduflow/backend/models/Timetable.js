const mongoose = require("mongoose");

const periodSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    label: { type: String, required: true }, // "Period 1", "Short Break"
    startTime: { type: String, required: true }, // "08:00"
    endTime: { type: String, required: true }, // "08:40"
    isBreak: { type: Boolean, default: false },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

const timetableEntrySchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    day: { type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], required: true },
    period: { type: mongoose.Schema.Types.ObjectId, ref: "Period", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

timetableEntrySchema.index({ class: 1, day: 1, period: 1 }, { unique: true });

module.exports = {
  Period: mongoose.model("Period", periodSchema),
  TimetableEntry: mongoose.model("TimetableEntry", timetableEntrySchema),
};
