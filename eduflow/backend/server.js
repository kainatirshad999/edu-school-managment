require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
});

// ---- Global middleware ----
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use(
  "/api",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 3000, standardHeaders: true, legacyHeaders: false })
);

// Make io accessible inside controllers via req.app.get('io')
app.set("io", io);

// ---- Routes ----
app.get("/api/health", (req, res) => res.json({ success: true, message: "EduFlow API is running" }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/fees", require("./routes/feeRoutes"));
app.use("/api/homework", require("./routes/homeworkRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/communication", require("./routes/communicationRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/tests", require("./routes/testRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/study-material", require("./routes/studyMaterialRoutes"));
app.use("/api/school", require("./routes/schoolRoutes"));

app.use("/uploads", express.static("uploads"));

app.use(notFound);
app.use(errorHandler);

// ---- Socket.IO: real-time Communication module ----
// Rooms are per-school so schools never see each other's chat traffic.
io.on("connection", (socket) => {
  socket.on("join-school", (schoolId) => {
    socket.join(`school:${schoolId}`);
  });

  socket.on("join-conversation", (conversationId) => {
    socket.join(`conv:${conversationId}`);
  });

  socket.on("send-message", (payload) => {
    // payload: { conversationId, senderId, senderRole, text, schoolId }
    io.to(`conv:${payload.conversationId}`).emit("new-message", payload);
    io.to(`school:${payload.schoolId}`).emit("notification", {
      type: "message",
      from: payload.senderId,
    });
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`EduFlow server running on port ${PORT}`));
