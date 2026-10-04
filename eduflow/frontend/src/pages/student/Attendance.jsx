import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import AttendanceView from "../shared/AttendanceView.jsx";

export default function Attendance() {
  const [studentId, setStudentId] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/students/me/profile");
      setStudentId(data.data._id);
    })();
  }, []);
  if (!studentId) return <p className="text-gray-400">Loading...</p>;
  return <AttendanceView studentId={studentId} />;
}
