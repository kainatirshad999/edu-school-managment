import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { getSocket } from "../api/socket.js";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * contacts: [{ id, name, role }] - who the current user is allowed to message.
 * Admin passes the full teacher list; Teacher passes admin + their students;
 * Student/Parent pass their assigned teacher + admin.
 */
export default function CommunicationPanel({ contacts }) {
  const { user } = useAuth();
  const [activeContact, setActiveContact] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = getSocket();
    return () => socketRef.current?.off("new-message");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (contact) => {
    setActiveContact(contact);
    try {
      const { data } = await api.post("/communication/conversation", { otherRole: contact.role, otherId: contact.id });
      setConversationId(data.data._id);
      const history = await api.get(`/communication/messages/${data.data._id}`);
      setMessages(history.data.data);

      socketRef.current.emit("join-conversation", data.data._id);
      socketRef.current.off("new-message");
      socketRef.current.on("new-message", (msg) => {
        if (msg.conversation === data.data._id) setMessages((prev) => [...prev, msg]);
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not open conversation");
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !conversationId) return;
    try {
      const { data } = await api.post("/communication/messages", { conversationId, text });
      setMessages((prev) => [...prev, data.data]);
      setText("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send message");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
      <div className="bg-white rounded-xl border border-gray-100 p-3 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-400 px-2 mb-2">CONTACTS</h3>
        {contacts.map((c) => (
          <button
            key={`${c.role}-${c.id}`}
            onClick={() => openConversation(c)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${
              activeContact?.id === c.id ? "bg-brand-50 text-brand-700" : "hover:bg-gray-50"
            }`}
          >
            {c.name} <span className="text-xs text-gray-400 capitalize">({c.role})</span>
          </button>
        ))}
        {contacts.length === 0 && <p className="text-gray-400 text-sm px-2">No contacts available</p>}
      </div>

      <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 flex flex-col">
        {!activeContact ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a contact to start chatting</div>
        ) : (
          <>
            <div className="border-b border-gray-100 px-4 py-3 font-semibold">{activeContact.name}</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                    m.senderId === user.id ? "ml-auto bg-brand-500 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} className="border-t border-gray-100 p-3 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-lg">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
