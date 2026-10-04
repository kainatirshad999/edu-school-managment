import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

export default function Settings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/school/me");
      setForm(data.data);
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/school/me", form);
      toast.success("Settings saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">School Settings</h1>
      <form onSubmit={save} className="bg-white rounded-xl border border-gray-100 p-6 max-w-lg space-y-4">
        <Field label="School Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Field label="Academic Year" value={form.academicYear} onChange={(v) => setForm({ ...form, academicYear: v })} />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.settings?.notifyByEmail ?? true}
            onChange={(e) => setForm({ ...form, settings: { ...form.settings, notifyByEmail: e.target.checked } })}
          />
          Email notifications enabled
        </label>

        <button disabled={saving} className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" />
    </div>
  );
}
