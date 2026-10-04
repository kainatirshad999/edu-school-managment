import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import CommunicationPanel from "../../components/CommunicationPanel.jsx";

export default function Communication() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/students/me/profile");
      const profile = data.data;
      const list = [{ id: profile.school, name: "School Admin", role: "admin" }];
      if (profile.class?.classTeacher) {
        list.push({ id: profile.class.classTeacher._id, name: profile.class.classTeacher.name, role: "teacher" });
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
