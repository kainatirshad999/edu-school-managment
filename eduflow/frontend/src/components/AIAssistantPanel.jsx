import { useState } from "react";
import toast from "react-hot-toast";
import { Bot, Sparkles } from "lucide-react";
import api from "../api/axios.js";

export default function AIAssistantPanel({ tools }) {
  const [activeTool, setActiveTool] = useState(tools[0]?.key);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fields, setFields] = useState({});

  const tool = tools.find((t) => t.key === activeTool);

  const handleChange = (name, value) => setFields((f) => ({ ...f, [name]: value }));

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post(tool.endpoint, fields);
      setResult(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-6 w-6 text-brand-500" />
        <h1 className="text-2xl font-bold">AI Assistant</h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tools.map((t) => (
          <button
            key={t.key}
            onClick={() => { setActiveTool(t.key); setResult(null); setFields({}); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTool === t.key ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={run} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          {tool.fields.map((f) => (
            <div key={f.name}>
              <label className="text-xs font-medium text-gray-600">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  required={f.required}
                  value={fields[f.name] || ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                />
              ) : (
                <input
                  type={f.type || "text"}
                  required={f.required}
                  value={fields[f.name] || ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                />
              )}
            </div>
          ))}
          <button
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> {loading ? "Generating..." : tool.action}
          </button>
        </form>

        <div className="bg-white rounded-xl border border-gray-100 p-5 overflow-auto max-h-[70vh]">
          {!result && <p className="text-gray-400 text-sm">Result yahan show hoga.</p>}
          {result?.quiz && (
            <ol className="space-y-4 list-decimal list-inside">
              {result.quiz.map((q, i) => (
                <li key={i} className="text-sm">
                  <p className="font-medium">{q.question}</p>
                  <ul className="ml-4 mt-1 space-y-1">
                    {q.options?.map((o, j) => (
                      <li key={j} className={j === q.correctIndex ? "text-green-600 font-medium" : "text-gray-600"}>
                        {o}
                      </li>
                    ))}
                  </ul>
                  {q.explanation && <p className="text-xs text-gray-400 mt-1">{q.explanation}</p>}
                </li>
              ))}
            </ol>
          )}
          {result?.guidance && <p className="text-sm whitespace-pre-wrap">{result.guidance}</p>}
          {result?.plan && <p className="text-sm whitespace-pre-wrap">{result.plan}</p>}
          {result?.notice && <p className="text-sm whitespace-pre-wrap">{result.notice}</p>}
          {result?.reply && <p className="text-sm whitespace-pre-wrap">{result.reply}</p>}
          {result?.raw && <pre className="text-xs whitespace-pre-wrap">{result.raw}</pre>}
        </div>
      </div>
    </div>
  );
}
