import { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function ResultView({ studentId }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!studentId) return;
    (async () => setResults((await api.get(`/results/student/${studentId}`)).data.data))();
  }, [studentId]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Results</h1>
      <div className="grid gap-4">
        {results.map((r) => (
          <div key={r._id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{r.exam?.title}</div>
              <span className={`text-xs px-2 py-1 rounded-full ${r.passStatus === "pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {r.passStatus === "pass" ? "Pass" : "Fail"} · Grade {r.grade}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead className="text-gray-400 text-left"><tr><th className="py-1">Subject</th><th className="py-1">Marks</th></tr></thead>
              <tbody>
                {r.subjectMarks.map((m, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="py-1">{m.subject?.name}</td>
                    <td className="py-1">{m.marksObtained} / {m.totalMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2">Total: {r.totalObtained} / {r.totalMax} ({r.percentage}%)</p>
          </div>
        ))}
        {results.length === 0 && <p className="text-gray-400 text-center py-8">No published results yet</p>}
      </div>
    </div>
  );
}
