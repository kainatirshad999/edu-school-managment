import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import TestsExams from "../shared/TestsExams.jsx";

export default function TeacherTestsExamsPage({ admin }) {
  const [classes, setClasses] = useState(admin ? undefined : null);

  useEffect(() => {
    if (admin) return;
    (async () => {
      const { data } = await api.get("/teachers/me/profile");
      setClasses(data.data.assignedClasses || []);
    })();
  }, [admin]);

  if (!admin && classes === null) return <p className="text-gray-400">Loading...</p>;
  return <TestsExams canCreate classesOverride={admin ? undefined : classes} />;
}
