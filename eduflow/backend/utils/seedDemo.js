/**
 * Rich demo-data seeder - populates a full, realistic-looking school so the
 * dashboard and every module has something to show immediately.
 *
 * Usage:  npm run seed:demo
 * (safe to re-run - it wipes only the demo school's own data first)
 */
require("dotenv").config();
const connectDB = require("../config/db");

const School = require("../models/School");
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const FeeStructure = require("../models/FeeStructure");
const FeeDue = require("../models/FeeDue");
const FeePayment = require("../models/FeePayment");
const Attendance = require("../models/Attendance");
const Notice = require("../models/Notice");

const DEMO_EMAIL = "admin@demo-school.com";
const ACADEMIC_YEAR = "2026-2027";

const FIRST_NAMES = [
  "Ayesha", "Zara", "Ahmed", "Ali", "Fatima", "Hassan", "Hira", "Bilal", "Sana", "Usman",
  "Mariam", "Omar", "Rida", "Saad", "Noor", "Hamza", "Laiba", "Zain", "Amna", "Talha",
  "Areeba", "Fahad", "Iqra", "Danish", "Kinza", "Arsalan", "Momina", "Shaheer", "Anaya", "Rayyan",
];
const LAST_NAMES = [
  "Khan", "Malik", "Siddiqui", "Farooqi", "Raza", "Qureshi", "Ansari", "Sheikh", "Baig", "Abbasi",
  "Chaudhry", "Rathore", "Javed", "Iqbal", "Aslam",
];

const SUBJECTS = [
  { name: "Mathematics", code: "MATH" },
  { name: "English", code: "ENG" },
  { name: "Urdu", code: "URD" },
  { name: "Science", code: "SCI" },
  { name: "Social Studies", code: "SST" },
  { name: "Computer Science", code: "CS" },
  { name: "Islamic Studies", code: "ISL" },
  { name: "Art & Craft", code: "ART" },
];

const randOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randName = () => `${randOf(FIRST_NAMES)} ${randOf(LAST_NAMES)}`;
const slugEmail = (name, domain, n) =>
  `${name.toLowerCase().replace(/[^a-z]/g, ".")}${n}@${domain}`;

(async () => {
  await connectDB();
  console.log("Seeding demo data...\n");

  // ---------- School ----------
  let school = await School.findOne({ email: DEMO_EMAIL });
  if (!school) {
    school = await School.create({
      name: "Al-Falah Demo School",
      email: DEMO_EMAIL,
      password: "Demo@123",
      phone: "0300-0000000",
      address: "Karachi, Pakistan",
      isVerified: true,
      academicYear: ACADEMIC_YEAR,
    });
  }
  const schoolId = school._id;

  // Wipe this school's existing demo data so the script is safely re-runnable
  await Promise.all([
    Class.deleteMany({ school: schoolId }),
    Subject.deleteMany({ school: schoolId }),
    Teacher.deleteMany({ school: schoolId }),
    Student.deleteMany({ school: schoolId }),
    User.deleteMany({ school: schoolId }),
    FeeStructure.deleteMany({ school: schoolId }),
    FeeDue.deleteMany({ school: schoolId }),
    FeePayment.deleteMany({ school: schoolId }),
    Attendance.deleteMany({ school: schoolId }),
    Notice.deleteMany({ school: schoolId }),
  ]);

  // ---------- Subjects ----------
  const subjects = await Subject.insertMany(SUBJECTS.map((s) => ({ school: schoolId, ...s })));
  console.log(`Created ${subjects.length} subjects`);

  // ---------- Classes ----------
  const classDefs = [
    ["Class 1", "A"], ["Class 1", "B"],
    ["Class 5", "A"], ["Class 5", "B"],
    ["Class 9", "A"], ["Class 9", "B"],
    ["Class 10", "A"], ["Class 10", "B"],
  ];
  const classes = [];
  for (const [name, section] of classDefs) {
    classes.push(await Class.create({ school: schoolId, name, section }));
  }
  console.log(`Created ${classes.length} classes`);

  // ---------- Teachers ----------
  const teachers = [];
  for (let i = 0; i < 16; i++) {
    const name = randName();
    const email = slugEmail(name, "alflah.edu.in", i);
    const user = await User.create({ school: schoolId, role: "teacher", name, email, password: "Teacher@123" });
    const subject = subjects[i % subjects.length];
    const assignedClasses = [classes[i % classes.length]._id];
    const teacher = await Teacher.create({
      school: schoolId,
      user: user._id,
      teacherId: `TCH-2026-${String(i + 1).padStart(4, "0")}`,
      subject: subject._id,
      qualification: randOf(["B.Ed", "M.Ed", "MSc", "MA", "BSc"]),
      experienceYears: randInt(1, 12),
      assignedClasses,
    });
    teachers.push({ user, teacher, subject });
  }
  console.log(`Created ${teachers.length} teachers`);

  // Make one teacher the class-teacher of every class, and wire 2-3 subjects per class
  for (let i = 0; i < classes.length; i++) {
    const klass = classes[i];
    const ct = teachers[i % teachers.length];
    klass.classTeacher = ct.user._id;
    const classSubjects = [];
    for (let s = 0; s < 3; s++) {
      const subj = subjects[(i + s) % subjects.length];
      const teacherForSubj = teachers[(i + s) % teachers.length];
      classSubjects.push({ subject: subj._id, teacher: teacherForSubj.user._id });
    }
    klass.subjects = classSubjects;
    await klass.save();
  }

  // ---------- Fee structures (per class) ----------
  const feeStructuresByClass = {};
  for (const klass of classes) {
    const heads = await FeeStructure.insertMany([
      { school: schoolId, class: klass._id, title: "Tuition Fee", amount: 3500, frequency: "monthly", academicYear: ACADEMIC_YEAR },
      { school: schoolId, class: klass._id, title: "Admission/Development Fee", amount: 15000, frequency: "one-time", academicYear: ACADEMIC_YEAR },
      { school: schoolId, class: klass._id, title: "Examination Fee", amount: 2000, frequency: "quarterly", academicYear: ACADEMIC_YEAR },
    ]);
    feeStructuresByClass[klass._id] = heads;
  }
  console.log("Created fee structures for every class");

  // ---------- Students (+ some linked parents) ----------
  let studentCount = 0;
  let paymentCount = 0;

  for (const klass of classes) {
    const studentsInClass = randInt(14, 20);
    for (let r = 1; r <= studentsInClass; r++) {
      const name = randName();
      const email = slugEmail(name, "student.alflah.edu.in", studentCount);
      const studentUser = await User.create({ school: schoolId, role: "student", name, email, password: "Student@123" });

      let linkedParentUser;
      if (Math.random() > 0.3) { // most students get a linked parent account
        const parentName = `${randOf(FIRST_NAMES)} ${name.split(" ")[1]}`;
        const parentEmail = slugEmail(parentName, "parent.alflah.edu.in", studentCount);
        const parentUser = await User.create({ school: schoolId, role: "parent", name: parentName, email: parentEmail, password: "Parent@123" });
        linkedParentUser = parentUser._id;
      }

      const student = await Student.create({
        school: schoolId,
        user: studentUser._id,
        studentId: `STU-2026-${String(studentCount + 1).padStart(4, "0")}`,
        class: klass._id,
        rollNumber: String(r),
        enrollmentNumber: `ENR-${1000 + studentCount}`,
        dateOfBirth: new Date(2010 + randInt(0, 10), randInt(0, 11), randInt(1, 28)),
        gender: randOf(["male", "female"]),
        bloodGroup: randOf(["A+", "B+", "O+", "AB+", "A-", "O-"]),
        parent: linkedParentUser ? {
          name: `${randOf(FIRST_NAMES)} ${name.split(" ")[1]}`,
          phone: `03${randInt(10, 99)}-${randInt(1000000, 9999999)}`,
          email: slugEmail("parent", "alflah.edu.in", studentCount),
          linkedParentUser,
        } : undefined,
      });
      studentCount++;

      // ----- Fee dues for this student (one per fee head) -----
      const heads = feeStructuresByClass[klass._id];
      for (const head of heads) {
        const due = await FeeDue.create({
          school: schoolId,
          student: student._id,
          class: klass._id,
          feeStructure: head._id,
          academicYear: ACADEMIC_YEAR,
          amountDue: head.amount,
          amountPaid: 0,
          dueDate: new Date(2026, 8, 1),
        });

        // Randomly mark some as paid/partial to populate reports & receipts
        const roll = Math.random();
        if (roll < 0.55) {
          const paidAmount = roll < 0.4 ? head.amount : Math.round(head.amount * 0.5);
          due.amountPaid = paidAmount;
          due.recompute();
          await due.save();

          await FeePayment.create({
            school: schoolId,
            student: student._id,
            class: klass._id,
            items: [{ feeDue: due._id, title: head.title, amount: paidAmount }],
            totalAmount: paidAmount,
            mode: randOf(["cash", "cheque", "dd", "online"]),
            receiptNumber: `RCP-${Date.now()}-${studentCount}-${head.title.slice(0, 3)}`,
            date: new Date(2026, randInt(6, 8), randInt(1, 28)),
          });
          paymentCount++;
        }
      }

      // ----- Attendance for the last 14 days -----
      for (let d = 13; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        date.setHours(0, 0, 0, 0);
        if (date.getDay() === 0) continue; // skip Sundays
        const roll = Math.random();
        const status = roll < 0.85 ? "present" : roll < 0.95 ? "late" : "absent";
        try {
          await Attendance.create({ school: schoolId, class: klass._id, student: student._id, date, status });
        } catch {
          /* ignore duplicate-date races */
        }
      }
    }
  }
  console.log(`Created ${studentCount} students across ${classes.length} classes`);
  console.log(`Created ${paymentCount} fee payments`);

  // ---------- Notices ----------
  await Notice.insertMany([
    { school: schoolId, title: "Parent-Teacher Meeting", content: "PTM will be held on the last Saturday of this month. All parents are requested to attend.", audience: "all", eventDate: new Date(2026, 9, 24) },
    { school: schoolId, title: "Annual Sports Day", content: "Annual Sports Day will be celebrated next month. Practice sessions start this week.", audience: "all", eventDate: new Date(2026, 10, 5) },
    { school: schoolId, title: "Half-Yearly Examination Schedule", content: "The half-yearly examination datesheet has been uploaded. Please check the Exams section.", audience: "student" },
    { school: schoolId, title: "Fee Reminder", content: "Parents with pending dues are requested to clear fees before the 10th of this month.", audience: "parent" },
  ]);
  console.log("Created notices");

  console.log("\n================= DONE =================");
  console.log("Login as Admin: admin@demo-school.com / Demo@123");
  console.log(`${teachers.length} teachers created - password for all: Teacher@123`);
  console.log(`${studentCount} students created - password for all: Student@123`);
  console.log("Linked parents - password for all: Parent@123");
  console.log("(Open Students/Teachers in the dashboard and click a row to see each one's exact email.)");
  console.log("==========================================\n");

  process.exit(0);
})().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
