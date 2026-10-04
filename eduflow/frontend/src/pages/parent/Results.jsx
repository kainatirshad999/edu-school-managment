import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import ResultView from "../shared/ResultView.jsx";

export default function ParentResults() {
  const [studentId, setStudentId] = useState(null);
  useEffect(() => {
    (async () => setStudentId((await api.get("/students/me/child")).data.data._id))();
  }, []);
  if (!studentId) return <p className="text-gray-400">Loading...</p>;
  return <ResultView studentId={studentId} />;
}
