import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Assignments from "../shared/Assignments.jsx";

export default function StudentAssignmentsPage() {
  const [classId, setClassId] = useState(null);
  useEffect(() => {
    (async () => setClassId((await api.get("/students/me/profile")).data.data.class?._id))();
  }, []);
  if (!classId) return <p className="text-gray-400">Loading...</p>;
  return <Assignments classIdFixed={classId} isStudent />;
}
