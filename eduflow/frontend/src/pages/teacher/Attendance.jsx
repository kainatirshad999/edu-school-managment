import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import AttendanceMark from "../shared/AttendanceMark.jsx";

export default function Attendance() {
  const [classes, setClasses] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/teachers/me/profile");
      setClasses(data.data.assignedClasses || []);
    })();
  }, []);

  if (classes === null) return <p className="text-gray-400">Loading...</p>;
  return <AttendanceMark classesOverride={classes} />;
}
