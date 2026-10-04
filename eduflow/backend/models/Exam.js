const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    title: { type: String, required: true }, // "Half Yearly Examination"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String },
    subjects: [
      {
        subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
        totalMarks: { type: Number, required: true },
        passingMarks: { type: Number, required: true },
        examDate: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
