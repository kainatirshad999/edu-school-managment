// Master list of all permissions available in the system.
// Roles & Permissions module (Admin side) toggles these per-user (mostly for Teacher role).
const ALL_PERMISSIONS = [
  // Students
  "view_students", "create_student", "edit_student", "delete_student",
  // Attendance
  "view_attendance", "mark_attendance",
  // Homework
  "view_homework", "assign_homework", "edit_homework", "delete_homework",
  // Assignments (with student upload + teacher grading)
  "view_assignment", "create_assignment", "delete_assignment", "grade_assignment",
  // Tests & Exams
  "view_test", "create_test", "edit_test", "delete_test",
  "view_exam", "create_exam", "edit_exam", "delete_exam",
  // Results
  "view_result", "add_result", "publish_result",
  // Timetable
  "view_timetable", "edit_timetable",
  // Notices
  "view_notice", "create_notice",
  // Communication
  "use_communication",
  // Fees (admin-only by default but toggle-able)
  "view_fees", "collect_fees", "edit_fee_structure",
  // Study material
  "view_study_material", "upload_study_material",
  // AI Assistant
  "use_ai_assistant",
];

// Sensible defaults granted to a newly created Teacher.
const DEFAULT_TEACHER_PERMISSIONS = [
  "view_students",
  "view_attendance", "mark_attendance",
  "view_homework", "assign_homework", "edit_homework",
  "view_assignment", "create_assignment", "delete_assignment", "grade_assignment",
  "view_test", "create_test", "edit_test",
  "view_exam",
  "view_result", "add_result",
  "view_timetable",
  "view_notice",
  "use_communication",
  "view_study_material", "upload_study_material",
  "use_ai_assistant",
];

// Admin always has everything - not stored per-user, checked via role === 'admin'.
module.exports = { ALL_PERMISSIONS, DEFAULT_TEACHER_PERMISSIONS };
