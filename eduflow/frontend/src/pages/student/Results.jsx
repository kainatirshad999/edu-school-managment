import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import ResultView from "../shared/ResultView.jsx";

export default function StudentResultsPage() {
  const [studentId, setStudentId] = useState(null);
  useEffect(() => {
    (async () => setStudentId((await api.get("/students/me/profile")).data.data._id))();
  }, []);
  if (!studentId) return <p className="text-gray-400">Loading...</p>;
  return <ResultView studentId={studentId} />;
}
