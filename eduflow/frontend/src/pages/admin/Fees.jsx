import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

const tabs = ["Fee Structure", "Collect Fee", "Concession", "Reports"];

export default function Fees() {
  const [tab, setTab] = useState(tabs[0]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/classes");
      setClasses(data.data);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Fees</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? "bg-brand-500 text-white" : "bg-white border border-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Fee Structure" && <FeeStructureTab classes={classes} />}
      {tab === "Collect Fee" && <CollectFeeTab classes={classes} />}
      {tab === "Concession" && <ConcessionTab classes={classes} />}
      {tab === "Reports" && <ReportsTab classes={classes} />}
    </div>
  );
}

function FeeStructureTab({ classes }) {
  const [classId, setClassId] = useState("");
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", frequency: "monthly", academicYear: "2026-2027", description: "" });

  const load = async (cid) => {
    const { data } = await api.get("/fees/structure", { params: cid ? { classId: cid } : {} });
    setItems(data.data);
  };
  useEffect(() => { load(classId); }, [classId]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/fees/structure", { ...form, classId });
      toast.success("Fee head created!");
      setShowForm(false);
      load(classId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this fee head?")) return;
    await api.delete(`/fees/structure/${id}`);
    load(classId);
  };

  return (
    <div>
      <div className="flex gap-3 mb-4 items-center">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All classes</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </select>
        <button disabled={!classId} onClick={() => setShowForm(true)} className="bg-brand-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm">+ Add Fee Head</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Frequency</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {items.map((f) => (
              <tr key={f._id} className="border-t border-gray-100">
                <td className="px-4 py-3">{f.title}</td>
                <td className="px-4 py-3">{f.class?.name} {f.class?.section}</td>
                <td className="px-4 py-3">{f.amount}</td>
                <td className="px-4 py-3 capitalize">{f.frequency}</td>
                <td className="px-4 py-3"><button onClick={() => remove(f._id)} className="text-red-500 text-xs">Delete</button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-8">No fee heads found</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-4">Add Fee Head</h2>
            <form onSubmit={create} className="space-y-3">
              <input required placeholder="Title (e.g. Tuition Fee)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input required type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
              <input placeholder="Academic Year" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
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

function CollectFeeTab({ classes }) {
  const [classId, setClassId] = useState("");
  const [rows, setRows] = useState([]);
  const [active, setActive] = useState(null);
  const [payAmounts, setPayAmounts] = useState({});
  const [mode, setMode] = useState("cash");
  const [remark, setRemark] = useState("");

  const load = async () => {
    if (!classId) return;
    const { data } = await api.get("/fees/dues", { params: { classId } });
    setRows(data.data);
  };
  useEffect(() => { load(); }, [classId]);

  const openCollect = (row) => {
    setActive(row);
    const initial = {};
    row.items.forEach((it) => {
      const net = it.amountDue - it.concessionAmount;
      const pending = Math.max(net - it.amountPaid, 0);
      if (pending > 0) initial[it._id] = pending;
    });
    setPayAmounts(initial);
  };

  const submitPayment = async () => {
    const items = Object.entries(payAmounts).filter(([, amt]) => Number(amt) > 0).map(([feeDueId, amount]) => ({ feeDueId, amount: Number(amount) }));
    if (items.length === 0) return toast.error("Enter at least one amount");
    try {
      await api.post("/fees/collect", { studentId: active.student._id, classId, items, mode, remark });
      toast.success("Payment collected & receipt generated!");
      setActive(null);
      setRemark("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const paidCount = rows.filter((r) => r.pending <= 0).length;
  const pendingCount = rows.filter((r) => r.pending > 0).length;
  const totalCollected = rows.reduce((s, r) => s + (r.totalPaid || 0), 0);
  const totalPending = rows.reduce((s, r) => s + (r.pending || 0), 0);

  return (
    <div>
      <div className="flex gap-3 mb-4 items-center">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Select class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </select>
        {classId && (
          <button onClick={async () => { await api.post("/fees/generate-dues", { classId, academicYear: "2026-2027" }); toast.success("Dues generated"); load(); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            Generate Dues
          </button>
        )}
      </div>

      {classId && rows.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="rounded-xl p-4 bg-gradient-to-br from-green-400 to-green-500 text-white">
            <div className="text-xs opacity-90">Paid Students</div>
            <div className="text-2xl font-bold mt-1">{paidCount} <span className="text-sm font-normal opacity-80">of {rows.length}</span></div>
          </div>
          <div className="rounded-xl p-4 bg-gradient-to-br from-orange-400 to-orange-500 text-white">
            <div className="text-xs opacity-90">Pending Students</div>
            <div className="text-2xl font-bold mt-1">{pendingCount} <span className="text-sm font-normal opacity-80">defaulters</span></div>
          </div>
          <div className="rounded-xl p-4 bg-gradient-to-br from-blue-400 to-blue-500 text-white">
            <div className="text-xs opacity-90">Total Collected</div>
            <div className="text-2xl font-bold mt-1">Rs. {totalCollected.toLocaleString()}</div>
          </div>
          <div className="rounded-xl p-4 bg-gradient-to-br from-cyan-400 to-cyan-500 text-white">
            <div className="text-xs opacity-90">Total Pending</div>
            <div className="text-2xl font-bold mt-1">Rs. {totalPending.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Total Due</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Pending</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.student._id} className="border-t border-gray-100">
                <td className="px-4 py-3">{r.student.user?.name}</td>
                <td className="px-4 py-3">Rs. {r.totalDue}</td>
                <td className="px-4 py-3 text-green-600">Rs. {r.totalPaid}</td>
                <td className="px-4 py-3 text-orange-600">{r.pending > 0 ? `Rs. ${r.pending}` : "—"}</td>
                <td className="px-4 py-3">
                  {r.pending > 0
                    ? <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Pending</span>
                    : <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Paid</span>}
                </td>
                <td className="px-4 py-3">
                  {r.pending > 0
                    ? <button onClick={() => openCollect(r)} className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg">Collect</button>
                    : <button onClick={() => openCollect(r)} className="border border-gray-200 text-xs font-medium px-3 py-1.5 rounded-lg">View</button>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-8">No records (generate dues first)</td></tr>}
          </tbody>
        </table>
      </div>

      {active && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-1">Collect Fee — {active.student.user?.name}</h2>
            <p className="text-sm text-gray-400 mb-4">Balance: {active.pending}</p>
            {active.items.map((it) => {
              const net = it.amountDue - it.concessionAmount;
              const pending = Math.max(net - it.amountPaid, 0);
              if (pending <= 0) return null;
              return (
                <div key={it._id} className="flex items-center justify-between mb-2 text-sm">
                  <span>{it.feeStructure?.title} (pending {pending})</span>
                  <input type="number" value={payAmounts[it._id] || ""} onChange={(e) => setPayAmounts({ ...payAmounts, [it._id]: e.target.value })} className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm" />
                </div>
              );
            })}
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-3">
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="dd">DD</option>
              <option value="online">Online</option>
            </select>
            <input placeholder="Remark (optional)" value={remark} onChange={(e) => setRemark(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-3" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setActive(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
              <button onClick={submitPayment} className="flex-1 bg-brand-500 text-white rounded-lg py-2 text-sm">Confirm Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConcessionTab({ classes }) {
  const [concessions, setConcessions] = useState([]);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [structures, setStructures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", feeStructureId: "", type: "percentage", value: "", description: "" });

  const load = async () => {
    const { data } = await api.get("/fees/concession");
    setConcessions(data.data);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!classId) return;
    (async () => {
      const [s, f] = await Promise.all([
        api.get("/students", { params: { classId, limit: 100 } }),
        api.get("/fees/structure", { params: { classId } }),
      ]);
      setStudents(s.data.data);
      setStructures(f.data.data);
    })();
  }, [classId]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/fees/concession", { ...form, classId });
      toast.success("Concession added!");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const remove = async (id) => {
    await api.delete(`/fees/concession/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm">+ Add Concession</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Fee Head</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {concessions.map((c) => (
              <tr key={c._id} className="border-t border-gray-100">
                <td className="px-4 py-3">{c.student?.user?.name}</td>
                <td className="px-4 py-3">{c.feeStructure?.title}</td>
                <td className="px-4 py-3 capitalize">{c.type}</td>
                <td className="px-4 py-3">{c.effectiveAmount}</td>
                <td className="px-4 py-3"><button onClick={() => remove(c._id)} className="text-red-500 text-xs">Delete</button></td>
              </tr>
            ))}
            {concessions.length === 0 && <tr><td colSpan={5} className="text-center text-gray-400 py-8">No concessions found</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-4">Add Concession</h2>
            <form onSubmit={create} className="space-y-3">
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select class</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
              </select>
              <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.user?.name}</option>)}
              </select>
              <select value={form.feeStructureId} onChange={(e) => setForm({ ...form, feeStructureId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select fee structure</option>
                {structures.map((s) => <option key={s._id} value={s._id}>{s.title} ({s.amount})</option>)}
              </select>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
              <input required type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
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

function ReportsTab({ classes }) {
  const [sub, setSub] = useState("Day Book");
  const [classId, setClassId] = useState("");
  const [data, setData] = useState(null);
  const [finance, setFinance] = useState(null);

  useEffect(() => {
    (async () => {
      if (sub === "Day Book") setData((await api.get("/fees/reports/day-book")).data);
      if (sub === "Defaulters") setData((await api.get("/fees/reports/defaulters")).data);
      if (sub === "Finance") setFinance((await api.get("/fees/reports/finance")).data.data);
    })();
  }, [sub]);

  useEffect(() => {
    if (sub === "Class Report" && classId) {
      (async () => setData((await api.get(`/fees/reports/class/${classId}`)).data))();
    }
  }, [sub, classId]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {["Day Book", "Class Report", "Defaulters", "Finance"].map((s) => (
          <button key={s} onClick={() => setSub(s)} className={`px-3 py-1.5 rounded-lg text-sm ${sub === s ? "bg-brand-100 text-brand-700" : "bg-gray-100"}`}>{s}</button>
        ))}
      </div>

      {sub === "Class Report" && (
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4">
          <option value="">Select class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </select>
      )}

      {sub === "Finance" && finance && (
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Total Collected" value={finance.totalCollected} />
          <Stat label="Total Pending" value={finance.totalPending} />
          <Stat label="Collection Rate" value={`${finance.collectionRate}%`} />
        </div>
      )}

      {sub !== "Finance" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Student</th>
                {sub === "Day Book" && <><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Mode</th></>}
                {sub === "Class Report" && <><th className="px-4 py-3">Total Due</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Status</th></>}
                {sub === "Defaulters" && <th className="px-4 py-3">Balance</th>}
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-3">{row.student?.user?.name}</td>
                  {sub === "Day Book" && <><td className="px-4 py-3">{row.totalAmount}</td><td className="px-4 py-3 capitalize">{row.mode}</td></>}
                  {sub === "Class Report" && <><td className="px-4 py-3">{row.totalDue}</td><td className="px-4 py-3">{row.balance}</td><td className="px-4 py-3 capitalize">{row.status}</td></>}
                  {sub === "Defaulters" && <td className="px-4 py-3">{row.balance}</td>}
                </tr>
              ))}
              {(!data?.data || data.data.length === 0) && <tr><td colSpan={4} className="text-center text-gray-400 py-8">No data found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
      <div className="text-2xl font-bold text-brand-600">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
