import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Mail, Phone, GraduationCap, Search } from "lucide-react";
import api from "../../api/axios.js";

const emptyForm = { name: "", email: "", phone: "", qualification: "", experienceYears: "" };
const colors = ["bg-orange-100 text-orange-700", "bg-blue-100 text-blue-700", "bg-purple-100 text-purple-700", "bg-green-100 text-green-700", "bg-pink-100 text-pink-700", "bg-cyan-100 text-cyan-700"];
const initials = (name = "") => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/teachers", { params: { search, limit: 100 } });
      setTeachers(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load teachers");
    }
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, phone: t.phone || "", qualification: t.teacherProfile?.qualification || "", experienceYears: t.teacherProfile?.experienceYears || "" });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/teachers/${editing.teacherProfile?._id}`, form);
        toast.success("Teacher updated!");
      } else {
        await api.post("/teachers", form);
        toast.success("Teacher added!");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this teacher?")) return;
    await api.delete(`/teachers/${id}`);
    toast.success("Teacher deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <button onClick={openCreate} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus className="h-4 w-4" /> Add Teacher
        </button>
      </div>
      <p className="text-gray-400 text-sm mb-4">{teachers.length} teaching staff members.</p>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((t, i) => (
          <div key={t._id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm ${colors[i % colors.length]}`}>
                  {initials(t.name)}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                    {t.teacherProfile?.subject?.name || "—"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-brand-600"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(t.teacherProfile?._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {t.email}</div>
              {t.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {t.phone}</div>}
              {t.teacherProfile?.qualification && (
                <div className="flex items-center gap-2"><GraduationCap className="h-3.5 w-3.5" /> {t.teacherProfile.qualification} · {t.teacherProfile.experienceYears || 0} yrs exp</div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-50">
              <p className="text-[11px] text-gray-400 mb-1.5">Assigned Classes</p>
              <div className="flex flex-wrap gap-1.5">
                {(t.teacherProfile?.assignedClasses || []).map((c) => (
                  <span key={c._id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.name} {c.section}</span>
                ))}
                {(!t.teacherProfile?.assignedClasses || t.teacherProfile.assignedClasses.length === 0) && (
                  <span className="text-xs text-gray-300">No class assigned yet</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {teachers.length === 0 && <p className="text-gray-400 col-span-full text-center py-10">No teachers found</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">{editing ? "Edit Teacher" : "Add Teacher"}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required disabled={!!editing} />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Qualification" value={form.qualification} onChange={(v) => setForm({ ...form, qualification: v })} />
              <Field label="Experience (years)" type="number" value={form.experienceYears} onChange={(v) => setForm({ ...form, experienceYears: v })} />
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
                <button disabled={saving} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-2 text-sm">
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, disabled }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input type={type} required={required} disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 disabled:bg-gray-50" />
    </div>
  );
}
