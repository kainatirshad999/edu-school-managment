import AIAssistantPanel from "../../components/AIAssistantPanel.jsx";

const tools = [
  {
    key: "homework",
    label: "Homework Helper",
    action: "Get Help",
    endpoint: "/ai/homework-help",
    fields: [
      { name: "subject", label: "Subject", required: true },
      { name: "question", label: "Aapka sawal", type: "textarea", required: true },
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
];

export default function AIAssistantStudent() {
  return <AIAssistantPanel tools={tools} />;
}
