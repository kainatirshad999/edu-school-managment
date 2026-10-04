import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Timetable({ canEdit = false, classIdFixed }) {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [classId, setClassId] = useState(classIdFixed || "");
  const [entries, setEntries] = useState([]);
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [periodForm, setPeriodForm] = useState({ label: "", startTime: "", endTime: "", isBreak: false, order: periods.length + 1 });

  const loadStatic = async () => {
    const [p, s, t] = await Promise.all([api.get("/timetable/periods"), api.get("/subjects"), api.get("/teachers")]);
    setPeriods(p.data.data);
    setSubjects(s.data.data);
    setTeachers(t.data.data);
    if (!classIdFixed) setClasses((await api.get("/classes")).data.data);
  };
  useEffect(() => { loadStatic(); }, []);

  const loadEntries = async () => {
    if (!classId) return;
    const { data } = await api.get(`/timetable/class/${classId}`);
    setEntries(data.data);
  };
  useEffect(() => { loadEntries(); }, [classId]);

  const getEntry = (day, periodId) => entries.find((e) => e.day === day && e.period?._id === periodId);

  const updateCell = async (day, periodId, field, value) => {
    const existing = getEntry(day, periodId);
    const payload = {
      day,
      periodId,
      subjectId: field === "subjectId" ? value : existing?.subject?._id,
      teacherId: field === "teacherId" ? value : existing?.teacher?._id,
    };
    await api.put(`/timetable/class/${classId}`, { entries: [payload] });
    loadEntries();
  };

  const addPeriod = async (e) => {
    e.preventDefault();
    await api.post("/timetable/periods", { ...periodForm, order: periods.length + 1 });
    toast.success("Period added!");
    setShowPeriodForm(false);
    loadStatic();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Timetable</h1>
        {canEdit && <button onClick={() => setShowPeriodForm(true)} className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm">Manage Periods</button>}
      </div>

      {!classIdFixed && (
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4">
          <option value="">Select class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </select>
      )}

      {classId && periods.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">Period</th>
                {DAYS.map((d) => <th key={d} className="px-3 py-2">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p._id} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{p.label}<div className="text-xs text-gray-400">{p.startTime}-{p.endTime}</div></td>
                  {DAYS.map((day) => {
                    if (p.isBreak) return <td key={day} className="px-3 py-2 text-center text-gray-300 text-xs">Break</td>;
                    const entry = getEntry(day, p._id);
                    return (
                      <td key={day} className="px-2 py-2">
                        {canEdit ? (
                          <div className="space-y-1">
                            <select value={entry?.subject?._id || ""} onChange={(e) => updateCell(day, p._id, "subjectId", e.target.value)} className="w-full text-xs border border-gray-200 rounded px-1 py-1">
                              <option value="">Subject</option>
                              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                            <select value={entry?.teacher?._id || ""} onChange={(e) => updateCell(day, p._id, "teacherId", e.target.value)} className="w-full text-xs border border-gray-200 rounded px-1 py-1">
                              <option value="">Teacher</option>
                              {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                          </div>
                        ) : (
                          <div className="text-center text-xs">
                            <div className="font-medium">{entry?.subject?.name || "—"}</div>
                            <div className="text-gray-400">{entry?.teacher?.name}</div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {classId && periods.length === 0 && <p className="text-gray-400">Add periods first ("Manage Periods")</p>}

      {showPeriodForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-4">Add Period</h2>
            <form onSubmit={addPeriod} className="space-y-3">
              <input required placeholder="Label (e.g. Period 1 / Lunch Break)" value={periodForm.label} onChange={(e) => setPeriodForm({ ...periodForm, label: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input required type="time" value={periodForm.startTime} onChange={(e) => setPeriodForm({ ...periodForm, startTime: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input required type="time" value={periodForm.endTime} onChange={(e) => setPeriodForm({ ...periodForm, endTime: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={periodForm.isBreak} onChange={(e) => setPeriodForm({ ...periodForm, isBreak: e.target.checked })} /> This is a break
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPeriodForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
                <button className="flex-1 bg-brand-500 text-white rounded-lg py-2 text-sm">Add</button>
              </div>
            </form>
            {periods.length > 0 && (
              <div className="mt-4 border-t pt-3 max-h-40 overflow-y-auto">
                {periods.map((p) => (
                  <div key={p._id} className="flex justify-between text-sm py-1">
                    <span>{p.label} ({p.startTime}-{p.endTime}){p.isBreak && " · break"}</span>
                    <button onClick={async () => { await api.delete(`/timetable/periods/${p._id}`); loadStatic(); }} className="text-red-500 text-xs">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
