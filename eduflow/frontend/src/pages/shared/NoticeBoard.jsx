import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Megaphone } from "lucide-react";
import api from "../../api/axios.js";

export default function NoticeBoard({ canCreate = false }) {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", audience: "all", eventDate: "" });

  const load = async () => {
    const { data } = await api.get("/notices");
    setNotices(data.data);
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/notices", form);
      toast.success("Notice created!");
      setShowForm(false);
      setForm({ title: "", content: "", audience: "all", eventDate: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const remove = async (id) => {
    await api.delete(`/notices/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notice Board</h1>
        {canCreate && (
          <button onClick={() => setShowForm(true)} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> New Notice
          </button>
        )}
      </div>

      <div className="grid gap-3">
        {notices.map((n) => (
          <div key={n._id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
            <div className="bg-brand-50 text-brand-600 p-2 rounded-lg h-fit"><Megaphone className="h-4 w-4" /></div>
            <div className="flex-1">
              <div className="font-semibold">{n.title}</div>
              <p className="text-sm text-gray-500 mt-1">{n.content}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toDateString()} {n.eventDate && `· Event: ${new Date(n.eventDate).toDateString()}`}</p>
            </div>
            {canCreate && <button onClick={() => remove(n._id)} className="text-red-500 h-fit"><Trash2 className="h-4 w-4" /></button>}
          </div>
        ))}
        {notices.length === 0 && <p className="text-gray-400 text-center py-8">No notices</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">New Notice</h2>
            <form onSubmit={create} className="space-y-3">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <textarea required placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-24" />
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="all">Everyone</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
              </select>
              <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
                <button className="flex-1 bg-brand-500 text-white rounded-lg py-2 text-sm">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
