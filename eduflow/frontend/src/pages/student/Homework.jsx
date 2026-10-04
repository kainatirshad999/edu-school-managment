import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Homework from "../shared/Homework.jsx";

export default function StudentHomeworkPage() {
  const [classId, setClassId] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/students/me/profile");
      setClassId(data.data.class?._id);
    })();
  }, []);
  if (!classId) return <p className="text-gray-400">Loading...</p>;
  return <Homework classIdFixed={classId} />;
}
