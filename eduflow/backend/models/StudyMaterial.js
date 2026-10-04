const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["PDF", "Notes", "Past Paper", "Worksheet", "Other"], default: "Other" },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    section: { type: String },
    fileUrl: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
