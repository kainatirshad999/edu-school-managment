import { useEffect, useState } from "react";
import { Users, GraduationCap, CalendarCheck, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../api/axios.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0 });
  const [finance, setFinance] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [notices, setNotices] = useState([]);
  const [defaulters, setDefaulters] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [studentsRes, teachersRes, classesRes, financeRes, attRes, noticesRes, defRes] = await Promise.all([
          api.get("/students?limit=1"),
          api.get("/teachers?limit=1"),
          api.get("/classes"),
          api.get("/fees/reports/finance"),
          api.get("/attendance/overview"),
          api.get("/notices"),
          api.get("/fees/reports/defaulters"),
        ]);
        setStats({
          students: studentsRes.data.total || 0,
          teachers: teachersRes.data.total || 0,
          classes: classesRes.data.data?.length || 0,
        });
        setFinance(financeRes.data.data);
        setAttendance(attRes.data.data.map((d) => ({ date: d._id.slice(5), rate: d.total ? Math.round((d.present / d.total) * 100) : 0 })));
        setNotices(noticesRes.data.data.slice(0, 5));
        setDefaulters(defRes.data.total);
      } catch {
        // silently ignore - dashboard still renders with zeros
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Total Students", value: stats.students, icon: Users, color: "from-orange-300 to-orange-400" },
    { label: "Total Teachers", value: stats.teachers, icon: GraduationCap, color: "from-blue-300 to-blue-400" },
    { label: "Total Classes", value: stats.classes, icon: CalendarCheck, color: "from-cyan-300 to-cyan-400" },
    { label: "Fee Collected", value: finance ? `Rs. ${finance.totalCollected}` : "—", icon: DollarSign, color: "from-orange-400 to-red-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-500 mb-6">Welcome back! Here's what's happening today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`rounded-xl p-5 text-white bg-gradient-to-br ${c.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">{c.label}</span>
                <Icon className="h-6 w-6 opacity-80" />
              </div>
              <div className="text-3xl font-bold mt-3">{loading ? "…" : c.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold mb-3">Attendance Overview (Last 7 Days)</h3>
          {attendance.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={attendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm">No attendance records yet</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold mb-3">Finance Summary</h3>
          {finance ? (
            <div className="space-y-3">
              <Row label="Total Collected" value={`Rs. ${finance.totalCollected}`} />
              <Row label="Total Pending" value={`Rs. ${finance.totalPending}`} />
              <Row label="Collection Rate" value={`${finance.collectionRate}%`} />
              <Row label="Total Defaulters" value={defaulters ?? "—"} />
            </div>
          ) : <p className="text-gray-400 text-sm">Loading...</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold mb-3">Recent Notices</h3>
        <div className="space-y-2">
          {notices.map((n) => (
            <div key={n._id} className="text-sm border-b border-gray-50 pb-2">
              <span className="font-medium">{n.title}</span>
              <p className="text-gray-400 text-xs">{n.content?.slice(0, 100)}</p>
            </div>
          ))}
          {notices.length === 0 && <p className="text-gray-400 text-sm">No notices</p>}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
