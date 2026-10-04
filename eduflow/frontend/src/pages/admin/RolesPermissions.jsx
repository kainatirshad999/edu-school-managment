import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

export default function RolesPermissions() {
  const [teachers, setTeachers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [all, setAll] = useState([]);
  const [active, setActive] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/teachers");
      setTeachers(data.data);
    })();
  }, []);

  const openTeacher = async (t) => {
    setSelected(t);
    const teacherProfileId = t.teacherProfile?._id;
    if (!teacherProfileId) return;
    const { data } = await api.get(`/teachers/${teacherProfileId}/permissions`);
    setAll(data.all);
    setActive(data.active);
  };

  const toggle = (perm) => {
    setActive((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/teachers/${selected.teacherProfile._id}/permissions`, { permissions: active });
      toast.success("Permissions updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Roles & Permissions</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold mb-3 text-sm text-gray-500">TEACHERS</h3>
          <div className="space-y-1">
            {teachers.map((t) => (
              <button
                key={t._id}
                onClick={() => openTeacher(t)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selected?._id === t._id ? "bg-brand-50 text-brand-700" : "hover:bg-gray-50"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-4">
          {!selected ? (
            <p className="text-gray-400">Select a teacher from the list</p>
          ) : (
            <>
              <h3 className="font-semibold mb-1">{selected.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{active.length} active permissions</p>
              <div className="grid grid-cols-2 gap-2">
                {all.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={active.includes(perm)} onChange={() => toggle(perm)} />
                    {perm.replace(/_/g, " ")}
                  </label>
                ))}
              </div>
              <button
                onClick={save}
                disabled={saving}
                className="mt-6 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                {saving ? "Saving..." : "Save Permissions"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
