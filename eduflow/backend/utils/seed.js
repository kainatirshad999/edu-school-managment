require("dotenv").config();
const connectDB = require("../config/db");
const School = require("../models/School");

(async () => {
  await connectDB();
  const exists = await School.findOne({ email: "admin@demo-school.com" });
  if (exists) {
    console.log("Demo school already exists. Email: admin@demo-school.com / Password: Demo@123");
    process.exit(0);
  }
  await School.create({
    name: "Al-Falah Demo School",
    email: "admin@demo-school.com",
    password: "Demo@123",
    phone: "0300-0000000",
    address: "Karachi, Pakistan",
    isVerified: true,
  });
  console.log("Demo school created. Login as Admin with:");
  console.log("Email: admin@demo-school.com");
  console.log("Password: Demo@123");
  process.exit(0);
})();
