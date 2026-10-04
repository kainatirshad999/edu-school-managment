import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import AttendanceView from "../shared/AttendanceView.jsx";

export default function ParentAttendance() {
  const [studentId, setStudentId] = useState(null);
  useEffect(() => {
    (async () => setStudentId((await api.get("/students/me/child")).data.data._id))();
  }, []);
  if (!studentId) return <p className="text-gray-400">Loading...</p>;
  return <AttendanceView studentId={studentId} />;
}
