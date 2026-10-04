import { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function AttendanceView({ studentId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    (async () => {
      const { data } = await api.get(`/attendance/student/${studentId}`);
      setData(data.data);
    })();
  }, [studentId]);

  if (!data) return <p className="text-gray-400">Loading...</p>;

  const { summary, records } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Stat label="Present" value={summary.present} color="text-green-600" />
        <Stat label="Absent" value={summary.absent} color="text-red-600" />
        <Stat label="Late" value={summary.late} color="text-yellow-600" />
        <Stat label="Overall Rate" value={`${summary.rate}%`} color="text-brand-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-t border-gray-100">
                <td className="px-4 py-3">{new Date(r.date).toDateString()}</td>
                <td className="px-4 py-3 capitalize">{r.status}</td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={2} className="text-center text-gray-400 py-8">No records found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
