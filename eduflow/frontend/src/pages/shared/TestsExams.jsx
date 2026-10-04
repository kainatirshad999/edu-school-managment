import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

export default function TestsExams({ canCreate = false, classesOverride }) {
  const [tab, setTab] = useState("Tests");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classId, setClassId] = useState("");
  const [tests, setTests] = useState([]);
  const [exams, setExams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [testForm, setTestForm] = useState({ subjectId: "", title: "", testDate: "", totalMarks: "", description: "" });
  const [examForm, setExamForm] = useState({ title: "", startDate: "", endDate: "", description: "", subjectIds: [] });

  useEffect(() => {
    (async () => {
      setClasses(classesOverride || (await api.get("/classes")).data.data);
      setSubjects((await api.get("/subjects")).data.data);
    })();
  }, []);

  const loadTests = async () => setTests((await api.get("/tests", { params: classId ? { classId } : {} })).data.data);
  const loadExams = async () => setExams((await api.get("/exams", { params: classId ? { classId } : {} })).data.data);

  useEffect(() => { if (tab === "Tests") loadTests(); else loadExams(); }, [tab, classId]);

  const createTest = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tests", { ...testForm, classId });
      toast.success("Test created!");
      setShowForm(false);
      loadTests();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const createExam = async (e) => {
    e.preventDefault();
    try {
      const subjects = examForm.subjectIds.map((id) => ({ subject: id, totalMarks: 100, passingMarks: 33 }));
      await api.post("/exams", { ...examForm, classId, subjects });
      toast.success("Exam created!");
      setShowForm(false);
      loadExams();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tests & Exams</h1>
      <div className="flex gap-2 mb-4">
        {["Tests", "Exams"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm ${tab === t ? "bg-brand-500 text-white" : "bg-white border border-gray-200"}`}>{t}</button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">{canCreate ? "Select class" : "All classes"}</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </select>
        {canCreate && classId && <button onClick={() => setShowForm(true)} className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm">+ Create {tab === "Tests" ? "Test" : "Exam"}</button>}
      </div>

      {tab === "Tests" ? (
        <div className="grid gap-3">
          {tests.map((t) => (
            <div key={t._id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="font-semibold">{t.title} <span className="text-xs text-gray-400 font-normal">— {t.subject?.name}</span></div>
              <p className="text-xs text-gray-400 mt-1">Date: {t.testDate ? new Date(t.testDate).toDateString() : "—"} · Total Marks: {t.totalMarks}</p>
              {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}
            </div>
          ))}
          {tests.length === 0 && <p className="text-gray-400 text-center py-8">No tests found</p>}
        </div>
      ) : (
        <div className="grid gap-3">
          {exams.map((ex) => (
            <div key={ex._id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="font-semibold">{ex.title}</div>
              <p className="text-xs text-gray-400 mt-1">{ex.startDate && new Date(ex.startDate).toDateString()} – {ex.endDate && new Date(ex.endDate).toDateString()}</p>
              <p className="text-sm text-gray-500 mt-1">{(ex.subjects || []).map((s) => s.subject?.name).join(", ")}</p>
            </div>
          ))}
          {exams.length === 0 && <p className="text-gray-400 text-center py-8">No exams found</p>}
        </div>
      )}

      {showForm && tab === "Tests" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-4">Create Test</h2>
            <form onSubmit={createTest} className="space-y-3">
              <select required value={testForm.subjectId} onChange={(e) => setTestForm({ ...testForm, subjectId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input required placeholder="Title" value={testForm.title} onChange={(e) => setTestForm({ ...testForm, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input required type="date" value={testForm.testDate} onChange={(e) => setTestForm({ ...testForm, testDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input required type="number" placeholder="Total Marks" value={testForm.totalMarks} onChange={(e) => setTestForm({ ...testForm, totalMarks: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="Description" value={testForm.description} onChange={(e) => setTestForm({ ...testForm, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button><button className="flex-1 bg-brand-500 text-white rounded-lg py-2 text-sm">Create</button></div>
            </form>
          </div>
        </div>
      )}

      {showForm && tab === "Exams" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold mb-4">Create Exam</h2>
            <form onSubmit={createExam} className="space-y-3">
              <input required placeholder="Title (e.g. Half Yearly Exam)" value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input required type="date" value={examForm.startDate} onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input required type="date" value={examForm.endDate} onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto">
                {subjects.map((s) => (
                  <label key={s._id} className="flex items-center gap-2 text-sm py-1">
                    <input
                      type="checkbox"
                      checked={examForm.subjectIds.includes(s._id)}
                      onChange={(e) => setExamForm({ ...examForm, subjectIds: e.target.checked ? [...examForm.subjectIds, s._id] : examForm.subjectIds.filter((id) => id !== s._id) })}
                    /> {s.name}
                  </label>
                ))}
              </div>
              <textarea placeholder="Description" value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button><button className="flex-1 bg-brand-500 text-white rounded-lg py-2 text-sm">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
