import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import CommunicationPanel from "../../components/CommunicationPanel.jsx";

export default function Communication() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/teachers/me/profile");
      const profile = data.data;
      const list = [{ id: profile.school, name: "School Admin", role: "admin" }];

      for (const klass of profile.assignedClasses || []) {
        const res = await api.get("/students", { params: { classId: klass._id, limit: 50 } });
        res.data.data.forEach((s) => list.push({ id: s.user._id, name: s.user.name, role: "student" }));
      }
      setContacts(list);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Communication</h1>
      <CommunicationPanel contacts={contacts} />
    </div>
  );
}
