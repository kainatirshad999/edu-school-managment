import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import StudyMaterial from "../shared/StudyMaterial.jsx";

export default function StudentStudyMaterialPage() {
  const [classId, setClassId] = useState(null);
  useEffect(() => {
    (async () => setClassId((await api.get("/students/me/profile")).data.data.class?._id))();
  }, []);
  if (!classId) return <p className="text-gray-400">Loading...</p>;
  return <StudyMaterial classIdFixed={classId} />;
}
