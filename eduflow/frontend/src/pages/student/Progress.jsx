import { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function Progress() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      const student = (await api.get("/students/me/profile")).data.data;
      const res = await api.get(`/results/student/${student._id}`);
      setResults(res.data.data);
    })();
  }, []);

  const avgPct = results.length
    ? (results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length).toFixed(1)
    : 0;

  const subjectMap = {};
  results.forEach((r) => {
    (r.subjectMarks || []).forEach((m) => {
      const name = m.subject?.name || "Subject";
      if (!subjectMap[name]) subjectMap[name] = { total: 0, max: 0 };
      subjectMap[name].total += m.marksObtained;
      subjectMap[name].max += m.totalMarks;
    });
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Progress</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Average Score" value={`${avgPct}%`} />
        <Stat label="Exams Taken" value={results.length} />
        <Stat label="Subjects Tracked" value={Object.keys(subjectMap).length} />
      </div>

      <h3 className="font-semibold text-sm text-gray-500 mb-2">SUBJECT-WISE PERFORMANCE</h3>
      <div className="grid gap-2">
        {Object.entries(subjectMap).map(([name, s]) => {
          const pct = s.max ? Math.round((s.total / s.max) * 100) : 0;
          return (
            <div key={name} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className="flex justify-between text-sm mb-1"><span>{name}</span><span>{pct}%</span></div>
              <div className="w-full h-2 bg-gray-100 rounded-full"><div className="h-2 bg-brand-500 rounded-full" style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
        {Object.keys(subjectMap).length === 0 && <p className="text-gray-400">No published results yet</p>}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
      <div className="text-2xl font-bold text-brand-600">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
