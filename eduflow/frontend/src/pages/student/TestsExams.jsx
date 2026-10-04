import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import TestsExams from "../shared/TestsExams.jsx";

export default function StudentTestsExamsPage() {
  const [classes, setClasses] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/students/me/profile");
      setClasses(data.data.class ? [data.data.class] : []);
    })();
  }, []);
  if (classes === null) return <p className="text-gray-400">Loading...</p>;
  return <TestsExams classesOverride={classes} />;
}
