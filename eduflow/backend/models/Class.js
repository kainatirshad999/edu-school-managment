const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    name: { type: String, required: true }, // e.g. "Class 10"
    section: { type: String, required: true }, // e.g. "A"
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subjects: [
      {
        subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

classSchema.index({ school: 1, name: 1, section: 1 }, { unique: true });
classSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.section}`;
});
classSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Class", classSchema);
