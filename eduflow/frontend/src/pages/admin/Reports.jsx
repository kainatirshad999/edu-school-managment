import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../../api/axios.js";

const COLORS = ["#22c55e", "#84cc16", "#f97316", "#eab308", "#3b82f6", "#ef4444"];

export default function Reports() {
  const [attendance, setAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [distribution, setDistribution] = useState({});
  const [finance, setFinance] = useState(null);

  useEffect(() => {
    (async () => {
      setAttendance((await api.get("/attendance/overview")).data.data);
      setExams((await api.get("/exams")).data.data);
      setFinance((await api.get("/fees/reports/finance")).data.data);
    })();
  }, []);

  useEffect(() => {
    if (!examId) return;
    (async () => setDistribution((await api.get("/results/reports/grade-distribution", { params: { examId } })).data.data))();
  }, [examId]);

  const pieData = Object.entries(distribution).map(([grade, count]) => ({ name: grade, value: count }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <h3 className="font-semibold mb-3">Attendance Overview (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={attendance}>
            <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="present" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {finance && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <FinanceStat label="Total Collected" value={`Rs. ${finance.totalCollected}`} color="text-green-600" />
          <FinanceStat label="Total Pending" value={`Rs. ${finance.totalPending}`} color="text-orange-600" />
          <FinanceStat label="Collection Rate" value={`${finance.collectionRate}%`} color="text-brand-600" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Exam Result — Grade Distribution</h3>
          <select value={examId} onChange={(e) => setExamId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Select exam</option>
            {exams.map((ex) => <option key={ex._id} value={ex._id}>{ex.title}</option>)}
          </select>
        </div>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">Select an exam (results must be published)</p>
        )}
      </div>
    </div>
  );
}

function FinanceStat({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
