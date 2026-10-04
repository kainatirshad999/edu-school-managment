const mongoose = require("mongoose");

const gradeFor = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 33) return "D";
  return "F";
};

const resultSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    subjectMarks: [
      {
        subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
        marksObtained: { type: Number, required: true },
        totalMarks: { type: Number, required: true },
        remark: { type: String },
      },
    ],
    totalObtained: { type: Number },
    totalMax: { type: Number },
    percentage: { type: Number },
    grade: { type: String },
    passStatus: { type: String, enum: ["pass", "fail"] },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

resultSchema.pre("save", function (next) {
  this.totalObtained = this.subjectMarks.reduce((sum, s) => sum + s.marksObtained, 0);
  this.totalMax = this.subjectMarks.reduce((sum, s) => sum + s.totalMarks, 0);
  this.percentage = this.totalMax ? Number(((this.totalObtained / this.totalMax) * 100).toFixed(2)) : 0;
  this.grade = gradeFor(this.percentage);
  this.passStatus = this.subjectMarks.every((s) => s.marksObtained / s.totalMarks >= 0.33) ? "pass" : "fail";
  next();
});

resultSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);
