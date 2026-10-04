const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // Admin login = School login
    phone: { type: String },
    address: { type: String },
    logoUrl: { type: String },
    academicYear: { type: String, default: () => `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` },
    isVerified: { type: Boolean, default: false }, // becomes true after OTP verification
    settings: {
      timezone: { type: String, default: "Asia/Karachi" },
      currency: { type: String, default: "PKR" },
      notifyByEmail: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

schoolSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

schoolSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("School", schoolSchema);
