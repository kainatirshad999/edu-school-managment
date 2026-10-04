const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    fileUrl: { type: String, required: true },
    note: { type: String }, // optional note from the student
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },

    status: { type: String, enum: ["submitted", "graded"], default: "submitted" },
    marksObtained: { type: Number },
    feedback: { type: String },
    gradedAt: { type: Date },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// One submission per student per assignment - resubmitting overwrites it (handled in controller)
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("AssignmentSubmission", submissionSchema);
