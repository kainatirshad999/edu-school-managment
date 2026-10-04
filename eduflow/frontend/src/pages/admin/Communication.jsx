import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import CommunicationPanel from "../../components/CommunicationPanel.jsx";

export default function Communication() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/teachers");
      setContacts(data.data.map((t) => ({ id: t._id, name: t.name, role: "teacher" })));
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Communication</h1>
      <CommunicationPanel contacts={contacts} />
    </div>
  );
}
