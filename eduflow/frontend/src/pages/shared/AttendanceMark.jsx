import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

export default function AttendanceMark({ classesOverride }) {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (classesOverride) {
        setClasses(classesOverride);
      } else {
        const { data } = await api.get("/classes");
        setClasses(data.data);
      }
    })();
  }, [classesOverride]);

  const loadAttendance = async () => {
    if (!classId) return;
    const { data } = await api.get(`/attendance/class/${classId}`, { params: { date } });
    setRows(data.data);
  };

  useEffect(() => { loadAttendance(); }, [classId, date]);

  const setStatus = (studentId, status) => {
    setRows((prev) => prev.map((r) => (r.student === studentId ? { ...r, status } : r)));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/attendance/mark", {
        classId,
        date,
        records: rows.filter((r) => r.status).map((r) => ({ studentId: r.student, status: r.status })),
      });
      toast.success("Attendance saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>
      <div className="flex gap-3 mb-4">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Select class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name} {c.section}</option>
          ))}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>

      {classId && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Roll</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student} className="border-t border-gray-100">
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.rollNumber || "—"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {["present", "absent", "late"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(r.student, s)}
                        className={`px-3 py-1 rounded-full text-xs capitalize ${
                          r.status === s
                            ? s === "present" ? "bg-green-500 text-white" : s === "absent" ? "bg-red-500 text-white" : "bg-yellow-500 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={3} className="text-center text-gray-400 py-8">No students found</td></tr>}
            </tbody>
          </table>
          {rows.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <button onClick={save} disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium">
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
