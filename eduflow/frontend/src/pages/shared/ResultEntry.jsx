import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

export default function ResultEntry({ classesOverride }) {
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [classId, setClassId] = useState("");
  const [examId, setExamId] = useState("");
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // { studentId: { subjectId: { marksObtained, remark } } }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => setClasses(classesOverride || (await api.get("/classes")).data.data))();
  }, []);

  useEffect(() => {
    if (!classId) return;
    (async () => {
      setExams((await api.get("/exams", { params: { classId } })).data.data);
      setStudents((await api.get("/students", { params: { classId, limit: 100 } })).data.data);
    })();
  }, [classId]);

  useEffect(() => {
    if (!examId) return setExam(null);
    setExam(exams.find((e) => e._id === examId));
  }, [examId, exams]);

  const setMark = (studentId, subjectId, field, value) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subjectId]: { ...prev[studentId]?.[subjectId], [field]: value } },
    }));
  };

  const saveResult = async (studentId) => {
    const subjectMarks = (exam.subjects || []).map((s) => ({
      subject: s.subject._id,
      marksObtained: Number(marks[studentId]?.[s.subject._id]?.marksObtained || 0),
      totalMarks: s.totalMarks,
      remark: marks[studentId]?.[s.subject._id]?.remark || "",
    }));
    try {
      await api.post("/results", { examId, studentId, classId, subjectMarks });
      toast.success("Result saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const publishAll = async () => {
    setSaving(true);
    try {
      await api.put(`/results/publish/${examId}`);
      toast.success("Results published! Students/parents can now view them.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Publish failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Results</h1>
      <div className="flex gap-3 mb-4">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Select class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </select>
        <select value={examId} onChange={(e) => setExamId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Select exam</option>
          {exams.map((ex) => <option key={ex._id} value={ex._id}>{ex.title}</option>)}
        </select>
        {examId && <button onClick={publishAll} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Publish Results</button>}
      </div>

      {exam && students.map((s) => (
        <div key={s._id} className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
          <div className="font-semibold mb-2">{s.user?.name}</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {(exam.subjects || []).map((sub) => (
              <div key={sub.subject._id} className="flex items-center gap-2">
                <span className="text-sm w-28">{sub.subject.name}</span>
                <input
                  type="number"
                  placeholder={`/${sub.totalMarks}`}
                  value={marks[s._id]?.[sub.subject._id]?.marksObtained || ""}
                  onChange={(e) => setMark(s._id, sub.subject._id, "marksObtained", e.target.value)}
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                />
              </div>
            ))}
          </div>
          <button onClick={() => saveResult(s._id)} className="mt-3 text-brand-600 text-sm font-medium">Save Result</button>
        </div>
      ))}
      {!exam && <p className="text-gray-400 text-center py-8">Select a class and exam</p>}
    </div>
  );
}
