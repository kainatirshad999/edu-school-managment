import AIAssistantPanel from "../../components/AIAssistantPanel.jsx";

const tools = [
  {
    key: "ask",
    label: "Ask Assistant",
    action: "Ask",
    endpoint: "/ai/ask",
    fields: [
      { name: "message", label: 'e.g. "How many students in our school?"', type: "textarea", required: true },
    ],
  },
  {
    key: "quiz",
    label: "Quiz Generator",
    action: "Generate Quiz",
    endpoint: "/ai/quiz",
    fields: [
      { name: "subject", label: "Subject", required: true },
      { name: "topic", label: "Topic", required: true },
      { name: "numQuestions", label: "Number of Questions", type: "number" },
    ],
  },
  {
    key: "homework",
    label: "Homework Helper",
    action: "Get Help",
    endpoint: "/ai/homework-help",
    fields: [
      { name: "subject", label: "Subject", required: true },
      { name: "question", label: "Question", type: "textarea", required: true },
    ],
  },
  {
    key: "event",
    label: "Event Planner",
    action: "Generate Event Plan",
    endpoint: "/ai/event-plan",
    fields: [
      { name: "eventName", label: "Event Name", required: true },
      { name: "eventType", label: "Event Type (e.g. Annual Day, Sports Day)" },
      { name: "eventDate", label: "Event Date", type: "date" },
      { name: "expectedParticipants", label: "Expected Participants", type: "number" },
      { name: "estimatedBudget", label: "Estimated Budget", type: "number" },
    ],
  },
  {
    key: "notice",
    label: "Notice Generator",
    action: "Generate Notice",
    endpoint: "/ai/notice",
    fields: [
      { name: "noticeType", label: "Notice Type (e.g. Fee Reminder, General)", required: true },
      { name: "audience", label: "Audience (e.g. Students, Parents)" },
      { name: "keyPoints", label: "Key Points", type: "textarea", required: true },
    ],
  },
];

export default function AIAssistantAdmin() {
  return <AIAssistantPanel tools={tools} />;
}
