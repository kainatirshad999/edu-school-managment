import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Search } from "lucide-react";
import api from "../../api/axios.js";

const emptyForm = {
  name: "", email: "", phone: "", classId: "", rollNumber: "", enrollmentNumber: "",
  dateOfBirth: "", parentName: "", parentPhone: "", parentEmail: "", parentAddress: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadClasses = async () => {
    try {
      const { data } = await api.get("/classes");
      setClasses(data.data);
    } catch {
      /* ignore */
    }
  };

  const loadStudents = async () => {
    try {
      const { data } = await api.get("/students", { params: { page, search } });
      setStudents(data.data);
      setPages(data.pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load students");
    }
  };

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadStudents(); }, [page, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/students", form);
      toast.success("Student added!");
      setShowForm(false);
      setForm(emptyForm);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success("Student deleted");
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Students</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          placeholder="Search students..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Roll No.</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-t border-gray-100">
                <td className="px-4 py-3">{s.user?.name}</td>
                <td className="px-4 py-3">{s.class ? `${s.class.name} ${s.class.section}` : "—"}</td>
                <td className="px-4 py-3">{s.rollNumber || "—"}</td>
                <td className="px-4 py-3">{s.studentId}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-400 py-8">No students found mila</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex gap-2 mt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded-lg text-sm ${p === page ? "bg-brand-500 text-white" : "bg-gray-100"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Add Student</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              <div>
                <label className="text-xs font-medium text-gray-600">Class</label>
                <select
                  required
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                >
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                  ))}
                </select>
              </div>
              <Field label="Roll Number" value={form.rollNumber} onChange={(v) => setForm({ ...form, rollNumber: v })} />
              <Field label="Enrollment No." value={form.enrollmentNumber} onChange={(v) => setForm({ ...form, enrollmentNumber: v })} />
              <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => setForm({ ...form, dateOfBirth: v })} />
              <Field label="Parent Name" value={form.parentName} onChange={(v) => setForm({ ...form, parentName: v })} />
              <Field label="Parent Phone" value={form.parentPhone} onChange={(v) => setForm({ ...form, parentPhone: v })} />
              <Field label="Parent Email" type="email" value={form.parentEmail} onChange={(v) => setForm({ ...form, parentEmail: v })} />
              <Field label="Parent Address" value={form.parentAddress} onChange={(v) => setForm({ ...form, parentAddress: v })} />

              <div className="col-span-2 flex gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">
                  Cancel
                </button>
                <button disabled={saving} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-2 text-sm">
                  {saving ? "Saving..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
      />
    </div>
  );
}
