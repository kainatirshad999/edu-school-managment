import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Timetable from "../shared/Timetable.jsx";

export default function StudentTimetablePage() {
  const [classId, setClassId] = useState(null);
  useEffect(() => {
    (async () => setClassId((await api.get("/students/me/profile")).data.data.class?._id))();
  }, []);
  if (!classId) return <p className="text-gray-400">Loading...</p>;
  return <Timetable classIdFixed={classId} />;
}
