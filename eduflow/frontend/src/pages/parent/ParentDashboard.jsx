import { useEffect, useState } from "react";
import { CalendarCheck, Award, DollarSign, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [child, setChild] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState(null);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/students/me/child");
      setChild(data.data);

      const att = await api.get(`/attendance/student/${data.data._id}`);
      setAttendance(att.data.data.summary);

      const res = await api.get(`/results/student/${data.data._id}`);
      setResults(res.data.data.slice(0, 5));

      const feeData = await api.get("/fees/child-dues");
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
        {child ? `${child.user?.name} — Class ${child.class?.name} ${child.class?.section}` : "Loading..."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarCheck} label="Attendance" value={attendance ? `${attendance.rate}%` : "—"} color="from-green-300 to-green-400" />
        <StatCard icon={Award} label="Exams Recorded" value={results.length} color="from-purple-300 to-purple-400" />
        <StatCard icon={DollarSign} label="Pending Fee" value={fees ? `Rs. ${fees.pending}` : "—"} color="from-orange-300 to-orange-400" />
        <StatCard icon={BookOpen} label="Notices" value={notices.length} color="from-blue-300 to-blue-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold mb-3">Recent Results</h3>
          {results.map((r) => (
            <div key={r._id} className="text-sm border-b border-gray-50 pb-2 mb-2 flex justify-between">
              <span>{r.exam?.title}</span>
              <span className={r.passStatus === "pass" ? "text-green-600" : "text-red-600"}>{r.grade} ({r.percentage}%)</span>
            </div>
          ))}
          {results.length === 0 && <p className="text-gray-400 text-sm">No published results yet</p>}
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
