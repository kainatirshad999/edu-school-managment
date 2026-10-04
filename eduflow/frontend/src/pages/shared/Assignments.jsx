import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Upload, FileText, Trash2 } from "lucide-react";
import api from "../../api/axios.js";

/**
 * canCreate: true for Teacher/Admin - shows "New Assignment" + lets them open
 *            the grading view for each assignment.
 * classIdFixed / classesOverride: same convention as the other shared modules.
 * isStudent: true for Student role - shows "Submit" instead of "View Submissions".
 */
export default function Assignments({ canCreate, classIdFixed, classesOverride, isStudent }) {
  const [classes, setClasses] = useState(classesOverride || (classIdFixed ? null : []));
  const [classId, setClassId] = useState(classIdFixed || "");
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [grading, setGrading] = useState(null); // assignment being graded
  const [submitting, setSubmitting] = useState(null); // assignment being submitted to

  useEffect(() => {
    if (classIdFixed || classesOverride) return;
    (async () => {
      const { data } = await api.get("/classes");
      setClasses(data.data);
    })();
  }, []);

  const load = async () => {
    const { data } = await api.get("/assignments", { params: classId ? { classId } : {} });
    setAssignments(data.data);
  };
  useEffect(() => { load(); }, [classId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Assignments</h1>
        {canCreate && (
          <button onClick={() => setShowForm(true)} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> New Assignment
          </button>
        )}
      </div>

      {!classIdFixed && (
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4">
          <option value="">All classes</option>
          {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </select>
      )}

      <div className="grid gap-3">
        {assignments.map((a) => (
          <div key={a._id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {a.class?.name} {a.class?.section} · {a.subject?.name || "General"} · Due {new Date(a.dueDate).toLocaleDateString()} · {a.totalMarks} marks
                </div>
                {a.description && <p className="text-sm text-gray-600 mt-2">{a.description}</p>}
                {a.attachmentUrl && (
                  <a href={a.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 inline-flex items-center gap-1 mt-2">
                    <FileText className="h-3 w-3" /> Reference file
                  </a>
                )}
              </div>

              {canCreate && (
                <button onClick={() => setGrading(a)} className="text-brand-600 text-sm font-medium whitespace-nowrap">
                  View Submissions
                </button>
              )}

              {isStudent && (
                a.mySubmission ? (
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${a.mySubmission.status === "graded" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {a.mySubmission.status === "graded" ? `Graded: ${a.mySubmission.marksObtained}/${a.totalMarks}` : "Submitted"}
                    </span>
                    {a.mySubmission.status === "graded" && a.mySubmission.feedback && (
                      <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{a.mySubmission.feedback}</p>
                    )}
                    <button onClick={() => setSubmitting(a)} className="block text-xs text-brand-600 mt-1">Resubmit</button>
                  </div>
                ) : (
                  <button onClick={() => setSubmitting(a)} className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 whitespace-nowrap">
                    <Upload className="h-3 w-3" /> Submit
                  </button>
                )
              )}
            </div>
          </div>
        ))}
        {assignments.length === 0 && <p className="text-gray-400 text-center py-8">No assignments found</p>}
      </div>

      {showForm && <CreateForm classes={classes} classIdFixed={classId} onClose={() => setShowForm(false)} onDone={() => { setShowForm(false); load(); }} />}
      {grading && <GradingPanel assignment={grading} onClose={() => setGrading(null)} />}
      {submitting && <SubmitForm assignment={submitting} onClose={() => setSubmitting(null)} onDone={() => { setSubmitting(null); load(); }} />}
    </div>
  );
}

function CreateForm({ classes, classIdFixed, onClose, onDone }) {
  const [form, setForm] = useState({ classId: classIdFixed || "", title: "", description: "", totalMarks: 100, dueDate: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("attachment", file);
      await api.post("/assignments", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Assignment created!");
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create assignment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-lg font-bold mb-4">New Assignment</h2>
        <form onSubmit={submit} className="space-y-3">
          <select required value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" disabled={!!classIdFixed}>
            <option value="">Select class</option>
            {(classes || []).map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
          </select>
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-20" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" placeholder="Total Marks" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Reference file (optional)</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm mt-1" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
            <button disabled={saving} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-2 text-sm">{saving ? "Saving..." : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GradingPanel({ assignment, onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState({});

  const load = async () => {
    const { data } = await api.get(`/assignments/${assignment._id}/submissions`);
    setSubmissions(data.data);
  };
  useEffect(() => { load(); }, []);

  const grade = async (submissionId) => {
    try {
      await api.put(`/assignments/submissions/${submissionId}/grade`, {
        marksObtained: marks[submissionId], feedback: feedback[submissionId],
      });
      toast.success("Graded!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save grade");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-1">{assignment.title} — Submissions</h2>
        <p className="text-xs text-gray-400 mb-4">{submissions.length} submission(s)</p>

        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s._id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{s.student?.user?.name}</span>
                <div className="flex items-center gap-2">
                  {s.isLate && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Late</span>}
                  <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 flex items-center gap-1"><FileText className="h-3 w-3" /> View file</a>
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr_auto] gap-2 items-center">
                <input
                  type="number" placeholder={`/ ${assignment.totalMarks}`}
                  defaultValue={s.marksObtained}
                  onChange={(e) => setMarks({ ...marks, [s._id]: e.target.value })}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Feedback (optional)" defaultValue={s.feedback}
                  onChange={(e) => setFeedback({ ...feedback, [s._id]: e.target.value })}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                />
                <button onClick={() => grade(s._id)} className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                  {s.status === "graded" ? "Update" : "Grade"}
                </button>
              </div>
            </div>
          ))}
          {submissions.length === 0 && <p className="text-gray-400 text-center py-6">No submissions yet</p>}
        </div>

        <button onClick={onClose} className="mt-6 border border-gray-200 px-4 py-2 rounded-lg text-sm">Close</button>
      </div>
    </div>
  );
}

function SubmitForm({ assignment, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please attach a file");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("note", note);
      await api.post(`/assignments/${assignment._id}/submit`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Submitted!");
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-sm w-full p-6">
        <h2 className="text-lg font-bold mb-1">Submit: {assignment.title}</h2>
        <p className="text-xs text-gray-400 mb-4">Due {new Date(assignment.dueDate).toLocaleDateString()}</p>
        <form onSubmit={submit} className="space-y-3">
          <input required type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm" />
          <textarea placeholder="Note to teacher (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-16" />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancel</button>
            <button disabled={saving} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-2 text-sm">{saving ? "Uploading..." : "Submit"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
