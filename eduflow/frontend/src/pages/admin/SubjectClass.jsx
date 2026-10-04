import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, X } from "lucide-react";
import api from "../../api/axios.js";

export default function SubjectClass() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [activeClass, setActiveClass] = useState(null);
  const [assignSubject, setAssignSubject] = useState("");
  const [assignTeacher, setAssignTeacher] = useState("");

  const loadAll = async () => {
    const [s, c, t] = await Promise.all([api.get("/subjects"), api.get("/classes"), api.get("/teachers")]);
    setSubjects(s.data.data);
    setClasses(c.data.data);
    setTeachers(t.data.data);
  };
  useEffect(() => { loadAll(); }, []);

  const createSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post("/subjects", form);
      toast.success("Subject created!");
      setShowForm(false);
      setForm({ name: "", code: "", description: "" });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const deleteSubject = async (id) => {
    if (!confirm("Delete this subject?")) return;
    await api.delete(`/subjects/${id}`);
    toast.success("Deleted");
    loadAll();
  };

  const openClass = (klass) => {
    setActiveClass(klass);
    setAssignSubject("");
    setAssignTeacher("");
  };

  const addSubjectToClass = async () => {
    if (!assignSubject) return;
    const updated = [...(activeClass.subjects || []), { subject: assignSubject, teacher: assignTeacher || undefined }];
    const { data } = await api.put(`/classes/${activeClass._id}/subjects`, { subjects: updated });
    setActiveClass(data.data);
    setAssignSubject("");
    setAssignTeacher("");
    loadAll();
    toast.success("Subject assigned!");
  };

  const releaseSubject = async (subjectId) => {
    const updated = (activeClass.subjects || []).filter((s) => (s.subject?._id || s.subject) !== subjectId);
    const { data } = await api.put(`/classes/${activeClass._id}/subjects`, { subjects: updated });
    setActiveClass(data.data);
    loadAll();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Subject & Class Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subjects */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Subjects</h3>
            <button onClick={() => setShowForm(true)} className="text-brand-600 flex items-center gap-1 text-sm">
              <Plus className="h-4 w-4" /> Add Subject
            </button>
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {subjects.map((s) => (
              <div key={s._id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-gray-400">{s.code}</div>
                </div>
                <button onClick={() => deleteSubject(s._id)} className="text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {subjects.length === 0 && <p className="text-gray-400 text-sm">No subjects found</p>}
          </div>
        </div>

        {/* Classes -> assign subjects */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold mb-3">Classes</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {classes.map((c) => (
              <button
                key={c._id}
                onClick={() => openClass(c)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${activeClass?._id === c._id ? "bg-brand-50 border-brand-400 text-brand-700" : "border-gray-200"}`}
              >
                {c.name} {c.section}
              </button>
            ))}
          </div>

          {activeClass && (
            <div>
              <div className="flex gap-2 mb-3">
                <select value={assignSubject} onChange={(e) => setAssignSubject(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
                  <option value="">Select subject</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <select value={assignTeacher} onChange={(e) => setAssignTeacher(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
                  <option value="">Teacher (optional)</option>
                  {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <button onClick={addSubjectToClass} className="bg-brand-500 text-white px-3 rounded-lg text-sm">Add</button>
              </div>
              <div className="space-y-1">
                {(activeClass.subjects || []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm">
                    <span>{s.subject?.name} {s.teacher?.name && `— ${s.teacher.name}`}</span>
                    <button onClick={() => releaseSubject(s.subject?._id || s.subject)} className="text-red-500"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                {(activeClass.subjects || []).length === 0 && <p className="text-gray-400 text-sm">No subjects assigned</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-4">Add Subject</h2>
            <form onSubmit={createSubject} className="space-y-3">
              <input required placeholder="Name (e.g. Art & Craft)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
                <button className="flex-1 bg-brand-500 text-white rounded-lg py-2 text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
