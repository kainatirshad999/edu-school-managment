const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    name: { type: String, required: true },
    code: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

subjectSchema.index({ school: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);
