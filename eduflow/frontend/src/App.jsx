import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import RegisterSchool from "./pages/RegisterSchool.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Students from "./pages/admin/Students.jsx";
import Teachers from "./pages/admin/Teachers.jsx";
import Classes from "./pages/admin/Classes.jsx";
import RolesPermissions from "./pages/admin/RolesPermissions.jsx";
import AIAssistantAdmin from "./pages/admin/AIAssistant.jsx";
import AdminFees from "./pages/admin/Fees.jsx";
import AdminReports from "./pages/admin/Reports.jsx";
import SubjectClass from "./pages/admin/SubjectClass.jsx";
import AdminAttendance from "./pages/admin/Attendance.jsx";
import AdminCommunication from "./pages/admin/Communication.jsx";
import Settings from "./pages/admin/Settings.jsx";

// Teacher
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import AIAssistantTeacher from "./pages/teacher/AIAssistant.jsx";
import TeacherAttendance from "./pages/teacher/Attendance.jsx";
import TeacherCommunication from "./pages/teacher/Communication.jsx";
import TeacherHomework from "./pages/teacher/Homework.jsx";
import TeacherAssignments from "./pages/teacher/Assignments.jsx";
import TeacherTestsExams from "./pages/teacher/TestsExams.jsx";
import TeacherResults from "./pages/teacher/Results.jsx";
import TeacherTimetable from "./pages/teacher/Timetable.jsx";
import TeacherNotices from "./pages/teacher/Notices.jsx";
import TeacherStudyMaterial from "./pages/teacher/StudyMaterial.jsx";

// Student
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import AIAssistantStudent from "./pages/student/AIAssistant.jsx";
import StudentAttendance from "./pages/student/Attendance.jsx";
import StudentCommunication from "./pages/student/Communication.jsx";
import StudentHomework from "./pages/student/Homework.jsx";
import StudentAssignments from "./pages/student/Assignments.jsx";
import StudentTestsExams from "./pages/student/TestsExams.jsx";
import StudentResults from "./pages/student/Results.jsx";
import StudentFees from "./pages/student/Fees.jsx";
import StudentTimetable from "./pages/student/Timetable.jsx";
import StudentNotices from "./pages/student/Notices.jsx";
import StudentProgress from "./pages/student/Progress.jsx";
import StudentStudyMaterial from "./pages/student/StudyMaterial.jsx";

// Parent
import ParentDashboard from "./pages/parent/ParentDashboard.jsx";
import ParentAttendance from "./pages/parent/Attendance.jsx";
import ParentCommunication from "./pages/parent/Communication.jsx";
import ParentResults from "./pages/parent/Results.jsx";
import ParentFees from "./pages/parent/Fees.jsx";
import ParentNotices from "./pages/parent/Notices.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register-school" element={<RegisterSchool />} />

      {/* ---------------- Admin ---------------- */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><DashboardLayout role="admin" /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="fees" element={<AdminFees />} />
        <Route path="homework" element={<TeacherHomework admin />} />
        <Route path="assignments" element={<TeacherAssignments admin />} />
        <Route path="timetable" element={<TeacherTimetable admin />} />
        <Route path="notices" element={<TeacherNotices admin />} />
        <Route path="communication" element={<AdminCommunication />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="ai-assistant" element={<AIAssistantAdmin />} />
        <Route path="roles" element={<RolesPermissions />} />
        <Route path="subjects" element={<SubjectClass />} />
        <Route path="exams" element={<TeacherTestsExams admin />} />
        <Route path="study-material" element={<TeacherStudyMaterial admin />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* ---------------- Teacher ---------------- */}
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><DashboardLayout role="teacher" /></ProtectedRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="homework" element={<TeacherHomework />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="exams" element={<TeacherTestsExams />} />
        <Route path="results" element={<TeacherResults />} />
        <Route path="timetable" element={<TeacherTimetable />} />
        <Route path="notices" element={<TeacherNotices />} />
        <Route path="communication" element={<TeacherCommunication />} />
        <Route path="ai-assistant" element={<AIAssistantTeacher />} />
        <Route path="study-material" element={<TeacherStudyMaterial />} />
      </Route>

      {/* ---------------- Student ---------------- */}
      <Route path="/student" element={<ProtectedRoute role="student"><DashboardLayout role="student" /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="homework" element={<StudentHomework />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="exams" element={<StudentTestsExams />} />
        <Route path="notices" element={<StudentNotices />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="fees" element={<StudentFees />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="ai-assistant" element={<AIAssistantStudent />} />
        <Route path="study-material" element={<StudentStudyMaterial />} />
      </Route>

      {/* ---------------- Parent ---------------- */}
      <Route path="/parent" element={<ProtectedRoute role="parent"><DashboardLayout role="parent" /></ProtectedRoute>}>
        <Route index element={<ParentDashboard />} />
        <Route path="attendance" element={<ParentAttendance />} />
        <Route path="results" element={<ParentResults />} />
        <Route path="fees" element={<ParentFees />} />
        <Route path="notices" element={<ParentNotices />} />
        <Route path="communication" element={<ParentCommunication />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
