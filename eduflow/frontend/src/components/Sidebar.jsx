import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, School, CalendarCheck, DollarSign,
  BookOpen, CalendarClock, Megaphone, MessageSquare, BarChart3, Bot,
  ShieldCheck, Link2, FileText, Award, TrendingUp, Settings as SettingsIcon,
} from "lucide-react";

const menus = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/teachers", label: "Teachers", icon: GraduationCap },
    { to: "/admin/classes", label: "Classes", icon: School },
    { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/admin/fees", label: "Fees", icon: DollarSign },
    { to: "/admin/homework", label: "Homework", icon: BookOpen },
    { to: "/admin/assignments", label: "Assignments", icon: FileText },
    { to: "/admin/timetable", label: "Timetable", icon: CalendarClock },
    { to: "/admin/notices", label: "Notice Board", icon: Megaphone },
    { to: "/admin/communication", label: "Communication", icon: MessageSquare },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/ai-assistant", label: "AI Assistant", icon: Bot },
    { to: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck },
    { to: "/admin/subjects", label: "Subject & Class", icon: Link2 },
    { to: "/admin/exams", label: "Tests & Exams", icon: FileText },
    { to: "/admin/study-material", label: "Study Materials", icon: BookOpen },
    { to: "/admin/settings", label: "School Settings", icon: SettingsIcon },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/teacher/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/teacher/homework", label: "Homework", icon: BookOpen },
    { to: "/teacher/assignments", label: "Assignments", icon: FileText },
    { to: "/teacher/exams", label: "Tests & Exams", icon: FileText },
    { to: "/teacher/results", label: "Results", icon: Award },
    { to: "/teacher/timetable", label: "Timetable", icon: CalendarClock },
    { to: "/teacher/notices", label: "Notices", icon: Megaphone },
    { to: "/teacher/communication", label: "Communication", icon: MessageSquare },
    { to: "/teacher/ai-assistant", label: "AI Assistant", icon: Bot },
    { to: "/teacher/study-material", label: "Study Material", icon: BookOpen },
  ],
  student: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/student/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/student/homework", label: "Homework", icon: BookOpen },
    { to: "/student/assignments", label: "Assignments", icon: FileText },
    { to: "/student/exams", label: "Tests & Exams", icon: FileText },
    { to: "/student/notices", label: "Notices", icon: Megaphone },
    { to: "/student/timetable", label: "Timetable", icon: CalendarClock },
    { to: "/student/results", label: "Results", icon: Award },
    { to: "/student/fees", label: "Fees", icon: DollarSign },
    { to: "/student/progress", label: "Progress", icon: TrendingUp },
    { to: "/student/ai-assistant", label: "AI Assistant", icon: Bot },
    { to: "/student/study-material", label: "Study Material", icon: BookOpen },
  ],
  parent: [
    { to: "/parent", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/parent/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/parent/results", label: "Results", icon: Award },
    { to: "/parent/fees", label: "Fees", icon: DollarSign },
    { to: "/parent/notices", label: "Notices", icon: Megaphone },
    { to: "/parent/communication", label: "Communication", icon: MessageSquare },
  ],
};

export default function Sidebar({ role }) {
  const items = menus[role] || [];
  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center gap-2 px-5 py-5 font-bold text-lg">
        <span className="bg-brand-500 text-white rounded-lg p-1.5">🎓</span> EduFlow
      </div>
      <nav className="px-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-600" : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Icon className="h-4 w-4" /> {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
