import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import api from "../../api/axios.js";

export default function Homework({ canCreate = false, classesOverride, classIdFixed }) {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classId, setClassId] = useState(classIdFixed || "");
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subjectId: "", title: "", description: "", dueDate: "" });

  useEffect(() => {
    (async () => {
      if (classesOverride) setClasses(classesOverride);
      else if (!classIdFixed) setClasses((await api.get("/classes")).data.data);
      setSubjects((await api.get("/subjects")).data.data);
    })();
  }, []);

  const load = async () => {
    const { data } = await api.get("/homework", { params: classId ? { classId } : {} });
    setItems(data.data);
  };
  useEffect(() => { load(); }, [classId]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/homework", { ...form, classId });
      toast.success("Homework assigned!");
      setShowForm(false);
      setForm({ subjectId: "", title: "", description: "", dueDate: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const remove = async (id) => {
    await api.delete(`/homework/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Homework</h1>
        {canCreate && classId && (
          <button onClick={() => setShowForm(true)} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Assign Homework
          </button>
        )}
      </div>

      {!classIdFixed && (
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4">
          <option value="">{canCreate ? "Select class" : "All classes"}</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </select>
      )}

      <div className="grid gap-3">
        {items.map((hw) => (
          <div key={hw._id} className="bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-start">
            <div>
              <div className="font-semibold">{hw.title} <span className="text-xs text-gray-400 font-normal">— {hw.subject?.name}</span></div>
              <p className="text-sm text-gray-500 mt-1">{hw.description}</p>
              <p className="text-xs text-gray-400 mt-2">Class: {hw.class?.name} {hw.class?.section} · Due: {hw.dueDate ? new Date(hw.dueDate).toDateString() : "—"}</p>
            </div>
            {canCreate && <button onClick={() => remove(hw._id)} className="text-red-500"><Trash2 className="h-4 w-4" /></button>}
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400 text-center py-8">No homework assigned</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">Assign Homework</h2>
            <form onSubmit={create} className="space-y-3">
              <select required value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-20" />
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
                <button className="flex-1 bg-brand-500 text-white rounded-lg py-2 text-sm">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
