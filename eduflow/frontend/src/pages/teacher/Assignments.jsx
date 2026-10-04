import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Assignments from "../shared/Assignments.jsx";

export default function TeacherAssignmentsPage({ admin }) {
  const [classes, setClasses] = useState(admin ? undefined : null);

  useEffect(() => {
    if (admin) return;
    (async () => {
      const { data } = await api.get("/teachers/me/profile");
      setClasses(data.data.assignedClasses || []);
    })();
  }, [admin]);

  if (!admin && classes === null) return <p className="text-gray-400">Loading...</p>;
  return <Assignments canCreate classesOverride={admin ? undefined : classes} />;
}
