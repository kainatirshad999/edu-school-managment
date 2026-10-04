const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Student = require("../models/Student");
const { sendEmail, credentialsEmailTemplate } = require("../utils/email");

const genTempPassword = () => Math.random().toString(36).slice(-8);

// @desc  Create student (+ auto create parent login if parent email given)
// @route POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    classId,
    rollNumber,
    enrollmentNumber,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
    parentName,
    parentPhone,
    parentEmail,
    parentAddress,
  } = req.body;
  const school = req.user.school;

  const studentPassword = genTempPassword();
  const studentUser = await User.create({
    school,
    role: "student",
    name,
    email,
    password: studentPassword,
    phone,
  });

  let linkedParentUser;
  if (parentEmail) {
    let parentUser = await User.findOne({ school, role: "parent", email: parentEmail.toLowerCase() });
    let parentPassword;
    if (!parentUser) {
      parentPassword = genTempPassword();
      parentUser = await User.create({
        school,
        role: "parent",
        name: parentName || `${name}'s Parent`,
        email: parentEmail,
        password: parentPassword,
        phone: parentPhone,
      });
      await sendEmail({
        to: parentEmail,
        subject: "EduFlow - Your Parent Account",
        html: credentialsEmailTemplate({
          name: parentUser.name,
          id: parentUser._id.toString().slice(-6).toUpperCase(),
          email: parentEmail,
          password: parentPassword,
          role: "Parent",
        }),
      });
    }
    linkedParentUser = parentUser._id;
  }

  const studentId = `STU-${new Date().getFullYear()}-${uuidv4().slice(0, 6).toUpperCase()}`;
  const student = await Student.create({
    school,
    user: studentUser._id,
    studentId,
    class: classId,
    rollNumber,
    enrollmentNumber,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
    parent: {
      name: parentName,
      phone: parentPhone,
      email: parentEmail,
      address: parentAddress,
      linkedParentUser,
    },
  });

  await sendEmail({
    to: email,
    subject: "EduFlow - Your Student Account",
    html: credentialsEmailTemplate({ name, id: studentId, email, password: studentPassword, role: "Student" }),
  });

  res.status(201).json({ success: true, data: student, tempPassword: studentPassword });
});

// @desc  List students (paginated, filter by class, search by name)
// @route GET /api/students
const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, classId, search = "" } = req.query;
  const school = req.user.school;

  const match = { school };
  if (classId) match.class = classId;

  let query = Student.find(match).populate("class", "name section").populate("user", "name email phone avatarUrl");

  if (search) {
    // Search by populated user's name requires a two-step approach
    const matchingUsers = await User.find({ school, role: "student", name: { $regex: search, $options: "i" } }).select("_id");
    query = query.where("user").in(matchingUsers.map((u) => u._id));
  }

  const total = await Student.countDocuments(match);
  const students = await query
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.json({ success: true, data: students, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @desc  Single student full profile
// @route GET /api/students/:id
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, school: req.user.school })
    .populate("class", "name section")
    .populate("user", "-password");
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.json({ success: true, data: student });
});

// @desc  Update student
// @route PUT /api/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, school: req.user.school });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  const { name, phone, classId, rollNumber, bloodGroup, address, ...rest } = req.body;

  if (name || phone) {
    await User.findByIdAndUpdate(student.user, { ...(name && { name }), ...(phone && { phone }) });
  }
  if (classId) student.class = classId;
  if (rollNumber) student.rollNumber = rollNumber;
  if (bloodGroup) student.bloodGroup = bloodGroup;
  if (address) student.address = address;
  Object.assign(student, rest);
  await student.save();

  res.json({ success: true, data: student });
});

// @desc  Delete student
// @route DELETE /api/students/:id
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, school: req.user.school });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  await User.findByIdAndDelete(student.user);
  await student.deleteOne();
  res.json({ success: true, message: "Student deleted" });
});

// @desc  Logged-in student's own profile (for Student dashboard/self-service pages)
// @route GET /api/students/me/profile
const getMyStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id })
    .populate({ path: "class", populate: { path: "classTeacher", select: "name" } })
    .populate("user", "-password");
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }
  res.json({ success: true, data: student });
});

// @desc  Logged-in parent's linked child profile
// @route GET /api/students/me/child
const getMyChildProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ "parent.linkedParentUser": req.user.id })
    .populate({ path: "class", populate: { path: "classTeacher", select: "name" } })
    .populate("user", "-password");
  if (!student) {
    res.status(404);
    throw new Error("No child is linked to this parent account");
  }
  res.json({ success: true, data: student });
});

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMyStudentProfile,
  getMyChildProfile,
};
