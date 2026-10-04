import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, FileText, Trash2 } from "lucide-react";
import api from "../../api/axios.js";

const TYPES = ["All", "PDF", "Notes", "Past Paper", "Worksheet", "Other"];

export default function StudyMaterial({ canUpload = false, classesOverride, classIdFixed }) {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [type, setType] = useState("All");
  const [classId, setClassId] = useState(classIdFixed || "");
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "PDF", subject: "", section: "", description: "", file: null });

  useEffect(() => {
    (async () => {
      setClasses(classesOverride || (await api.get("/classes")).data.data);
      setSubjects((await api.get("/subjects")).data.data);
    })();
  }, []);

  const load = async () => {
    const { data } = await api.get("/study-material", { params: { classId: classId || undefined, type } });
    setItems(data.data);
  };
  useEffect(() => { load(); }, [classId, type]);

  const upload = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries({ ...form, classId }).forEach(([k, v]) => v && fd.append(k, v));
    try {
      await api.post("/study-material", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Uploaded!");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  const remove = async (id) => { await api.delete(`/study-material/${id}`); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Study Material</h1>
        {canUpload && classId && <button onClick={() => setShowForm(true)} className="bg-brand-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><Plus className="h-4 w-4" /> Upload</button>}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {!classIdFixed && (
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">All classes</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
          </select>
        )}
        <select value={type} onChange={(e) => setType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((m) => (
          <div key={m._id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <FileText className="h-5 w-5 text-brand-500" />
              {canUpload && <button onClick={() => remove(m._id)} className="text-red-500"><Trash2 className="h-4 w-4" /></button>}
            </div>
            <div className="font-medium mt-2">{m.title}</div>
            <p className="text-xs text-gray-400">{m.type} · {m.subject?.name}</p>
            {m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noreferrer" className="text-brand-600 text-xs font-medium mt-2 inline-block">View File</a>}
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400 col-span-full text-center py-8">No materials found</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-4">Upload Study Material</h2>
            <form onSubmit={upload} className="space-y-3">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {TYPES.filter((t) => t !== "All").map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Subject (optional)</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input type="file" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} className="w-full text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button><button className="flex-1 bg-brand-500 text-white rounded-lg py-2 text-sm">Upload</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
