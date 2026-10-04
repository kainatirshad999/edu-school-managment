const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    audience: { type: String, enum: ["all", "admin", "teacher", "student", "parent"], default: "all" },
    eventDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // undefined = created by admin/school
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
