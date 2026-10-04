import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import api from "../../api/axios.js";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", section: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get("/classes");
    setClasses(data.data);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/classes", form);
      toast.success("Class created!");
      setShowForm(false);
      setForm({ name: "", section: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Classes</h1>
        <button onClick={() => setShowForm(true)} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus className="h-4 w-4" /> Add Class
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {classes.map((c) => (
          <div key={c._id} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="font-semibold">{c.name} {c.section}</div>
            <div className="text-xs text-gray-400 mt-1">{c.subjects?.length || 0} subjects assigned</div>
          </div>
        ))}
        {classes.length === 0 && <p className="text-gray-400 col-span-full">No classes created yet</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-4">Add Class</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Class Name (e.g. Class 10)</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Section (e.g. A)</label>
                <input required value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
                <button disabled={saving} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-2 text-sm">
                  {saving ? "Saving..." : "Add Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
