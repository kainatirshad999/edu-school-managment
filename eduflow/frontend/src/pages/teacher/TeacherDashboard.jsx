import { useEffect, useState } from "react";
import { Users, BookOpen, CalendarCheck, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [homeworkCount, setHomeworkCount] = useState(0);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/teachers/me/profile");
      setProfile(data.data);

      let total = 0;
      for (const klass of data.data.assignedClasses || []) {
        const res = await api.get("/students", { params: { classId: klass._id, limit: 1 } });
        total += res.data.total || 0;
      }
      setStudentCount(total);

      if (data.data.assignedClasses?.[0]) {
        const hw = await api.get("/homework", { params: { classId: data.data.assignedClasses[0]._id } });
        setHomeworkCount(hw.data.data.length);
      }

      const n = await api.get("/notices");
      setNotices(n.data.data.slice(0, 5));
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-gray-500 mb-6">
        {profile?.assignedClasses?.length
          ? `Assigned: ${profile.assignedClasses.map((c) => `${c.name} ${c.section}`).join(", ")}`
          : "No class assigned yet"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Students" value={studentCount} color="from-orange-300 to-orange-400" />
        <StatCard icon={BookOpen} label="Homework Assigned" value={homeworkCount} color="from-blue-300 to-blue-400" />
        <StatCard icon={CalendarCheck} label="Assigned Classes" value={profile?.assignedClasses?.length || 0} color="from-cyan-300 to-cyan-400" />
        <StatCard icon={FileText} label="Subject" value={profile?.subject?.name || "—"} color="from-purple-300 to-purple-400" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold mb-3">Recent Notices</h3>
        <div className="space-y-2">
          {notices.map((n) => (
            <div key={n._id} className="text-sm border-b border-gray-50 pb-2">
              <span className="font-medium">{n.title}</span>
              <p className="text-gray-400 text-xs">{n.content?.slice(0, 80)}</p>
            </div>
          ))}
          {notices.length === 0 && <p className="text-gray-400 text-sm">No notices</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`rounded-xl p-5 text-white bg-gradient-to-br ${color}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm opacity-90">{label}</span>
        <Icon className="h-5 w-5 opacity-80" />
      </div>
      <div className="text-2xl font-bold mt-3">{value}</div>
    </div>
  );
}
