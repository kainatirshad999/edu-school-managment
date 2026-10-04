import AIAssistantPanel from "../../components/AIAssistantPanel.jsx";

const tools = [
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
      { name: "eventType", label: "Event Type" },
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
      { name: "noticeType", label: "Notice Type", required: true },
      { name: "audience", label: "Audience" },
      { name: "keyPoints", label: "Key Points", type: "textarea" },
    ],
  },
];

export default function AIAssistantTeacher() {
  return <AIAssistantPanel tools={tools} />;
}
