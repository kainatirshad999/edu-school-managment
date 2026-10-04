const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { DEFAULT_TEACHER_PERMISSIONS } = require("../config/permissions");

const userSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    role: { type: String, enum: ["teacher", "student", "parent"], required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },

    // Teacher-only
    permissions: { type: [String], default: undefined }, // set on create if role === 'teacher'

    // Student-only convenience link (also see Student profile doc)
    // Parent-only convenience link (also see Parent profile doc)
  },
  { timestamps: true }
);

userSchema.index({ school: 1, email: 1 }, { unique: true });

userSchema.pre("save", async function (next) {
  if (this.isNew && this.role === "teacher" && !this.permissions) {
    this.permissions = DEFAULT_TEACHER_PERMISSIONS;
  }
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
