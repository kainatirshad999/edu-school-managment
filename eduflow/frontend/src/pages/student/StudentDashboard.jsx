import { useEffect, useState } from "react";
import { BookOpen, CalendarCheck, FileText, DollarSign } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [homework, setHomework] = useState([]);
  const [exams, setExams] = useState([]);
  const [fees, setFees] = useState(null);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/students/me/profile");
      setProfile(data.data);

      const att = await api.get(`/attendance/student/${data.data._id}`);
      setAttendance(att.data.data.summary);

      const hw = await api.get("/homework", { params: { classId: data.data.class?._id } });
      setHomework(hw.data.data.slice(0, 5));

      const ex = await api.get("/exams", { params: { classId: data.data.class?._id } });
      setExams(ex.data.data.slice(0, 3));

      const feeData = await api.get("/fees/my-dues");
      const pending = feeData.data.data.dues.reduce((s, d) => s + Math.max(d.amountDue - d.concessionAmount - d.amountPaid, 0), 0);
      setFees({ pending });

      const n = await api.get("/notices");
      setNotices(n.data.data.slice(0, 5));
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-gray-500 mb-6">
        {profile?.class ? `Class ${profile.class.name} ${profile.class.section}` : "Loading class info..."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarCheck} label="Attendance Rate" value={attendance ? `${attendance.rate}%` : "—"} color="from-green-300 to-green-400" />
        <StatCard icon={BookOpen} label="Pending Homework" value={homework.length} color="from-blue-300 to-blue-400" />
        <StatCard icon={FileText} label="Upcoming Exams" value={exams.length} color="from-purple-300 to-purple-400" />
        <StatCard icon={DollarSign} label="Pending Fee" value={fees ? `Rs. ${fees.pending}` : "—"} color="from-orange-300 to-orange-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold mb-3">Homework</h3>
          {homework.map((h) => (
            <div key={h._id} className="text-sm border-b border-gray-50 pb-2 mb-2">
              <span className="font-medium">{h.title}</span> <span className="text-xs text-gray-400">— {h.subject?.name}</span>
            </div>
          ))}
          {homework.length === 0 && <p className="text-gray-400 text-sm">No homework assigned</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold mb-3">School Notices</h3>
          {notices.map((n) => (
            <div key={n._id} className="text-sm border-b border-gray-50 pb-2 mb-2">{n.title}</div>
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
