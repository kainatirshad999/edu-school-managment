const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    studentId: { type: String, required: true, unique: true }, // e.g. STU-2026-0001
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    rollNumber: { type: String },
    enrollmentNumber: { type: String },
    dateOfBirth: { type: Date },
    bloodGroup: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    address: { type: String },

    parent: {
      name: { type: String },
      phone: { type: String },
      email: { type: String, lowercase: true },
      address: { type: String },
      linkedParentUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    points: { type: Number, default: 0 }, // gamification points shown on profile
    documents: [
      {
        title: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
