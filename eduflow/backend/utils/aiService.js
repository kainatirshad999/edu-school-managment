const Anthropic = require("@anthropic-ai/sdk");

let client = null;
const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
};

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

/**
 * Sends a prompt to Claude and returns plain text.
 * Throws a descriptive error if no API key is configured, so the controller
 * can surface a clean message instead of a generic crash.
 */
const askClaude = async (systemPrompt, userPrompt, maxTokens = 1500) => {
  const anthropic = getClient();
  if (!anthropic) {
    const err = new Error(
      "AI Assistant is not configured. Add ANTHROPIC_API_KEY to the backend .env file."
    );
    err.statusCode = 503;
    throw err;
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
};

/** Strips ```json fences if the model wraps its JSON answer in markdown */
const parseJsonSafely = (text) => {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
};

module.exports = { askClaude, parseJsonSafely, MODEL };
