const asyncHandler = require("express-async-handler");
const { askClaude, parseJsonSafely } = require("../utils/aiService");
const Student = require("../models/Student");
const User = require("../models/User");
const Class = require("../models/Class");

// @desc  Generate an MCQ quiz for a subject/topic
// @route POST /api/ai/quiz
const generateQuiz = asyncHandler(async (req, res) => {
  const { subject, topic, numQuestions = 5, gradeLevel } = req.body;

  const system =
    "You are an expert school teacher who creates MCQ quizzes. Always return only valid JSON, no extra text.";
  const prompt = `Subject: ${subject}
Topic: ${topic}
Grade level: ${gradeLevel || "school student"}
Total questions: ${numQuestions}

Reply in exactly this JSON shape (no markdown fence, raw JSON only):
{
  "quiz": [
    { "question": "...", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "..." }
  ]
}`;

  const text = await askClaude(system, prompt, 2000);
  let data;
  try {
    data = parseJsonSafely(text);
  } catch {
    data = { raw: text };
  }
  res.json({ success: true, data });
});

// @desc  Step-by-step help for a homework question
// @route POST /api/ai/homework-help
const homeworkHelp = asyncHandler(async (req, res) => {
  const { subject, question, gradeLevel } = req.body;
  const system =
    "You are a friendly, patient tutor who guides students step-by-step instead of giving them the direct answer.";
  const prompt = `Subject: ${subject}
Grade level: ${gradeLevel || "school student"}
Student's question: ${question}

Give step-by-step guidance in simple language so the student can understand and solve it themselves.`;

  const text = await askClaude(system, prompt, 1200);
  res.json({ success: true, data: { guidance: text } });
});

// @desc  Generate a school event plan
// @route POST /api/ai/event-plan
const eventPlan = asyncHandler(async (req, res) => {
  const { eventName, eventType, eventDate, expectedParticipants, estimatedBudget } = req.body;
  const system = "You are an experienced school event coordinator.";
  const prompt = `Event name: ${eventName}
Type: ${eventType}
Date: ${eventDate}
Expected participants: ${expectedParticipants}
Estimated budget: ${estimatedBudget}

Write a complete, practical event plan with a timeline, required tasks, responsibilities, and a budget breakdown. Use clear headings.`;

  const text = await askClaude(system, prompt, 1800);
  res.json({ success: true, data: { plan: text } });
});

// @desc  Generate a notice for students/parents/teachers
// @route POST /api/ai/notice
const generateNotice = asyncHandler(async (req, res) => {
  const { noticeType, audience, keyPoints } = req.body;
  const system = "You write official school notices in a professional, clear tone.";
  const prompt = `Notice type: ${noticeType}
Audience: ${audience}
Key points: ${keyPoints}

Write a professional, concise school notice (with a title).`;

  const text = await askClaude(system, prompt, 800);
  res.json({ success: true, data: { notice: text } });
});

// @desc  Admin-side conversational assistant that can answer questions about
//        the school's live data (student/teacher counts, class counts, etc.)
// @route POST /api/ai/ask
const askAboutSchool = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const school = req.user.school;

  // Give the model live counts as context so it can answer factually.
  const [studentCount, teacherCount, classes] = await Promise.all([
    Student.countDocuments({ school }),
    User.countDocuments({ school, role: "teacher" }),
    Class.find({ school }).select("name section"),
  ]);

  // Per-class counts (kept lightweight - only computed on demand for larger schools you'd cache this)
  const classCounts = await Promise.all(
    classes.map(async (c) => ({
      className: `${c.name} ${c.section}`,
      count: await Student.countDocuments({ school, class: c._id }),
    }))
  );

  const system = `You are a helpful admin assistant inside the EduFlow School Management System.
You are given the school's live data - answer questions based on it. If the data doesn't contain the answer, say clearly that the information isn't available.`;

  const context = `Live school data:
- Total students: ${studentCount}
- Total teachers: ${teacherCount}
- Class-wise student counts: ${JSON.stringify(classCounts)}`;

  const text = await askClaude(system, `${context}\n\nAdmin's question: ${message}`, 800);
  res.json({ success: true, data: { reply: text } });
});

module.exports = { generateQuiz, homeworkHelp, eventPlan, generateNotice, askAboutSchool };
