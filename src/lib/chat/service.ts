import { generateText } from "@/lib/gemini/client";
import type { ChatMessage } from "./types";

const SYSTEM_PROMPT = `You are EduAgent, a professional AI tutor. When responding, do the following:
- Act as a knowledgeable and patient tutor.
- Explain step-by-step with clear examples when appropriate.
- Simplify complex concepts and use analogies.
- Ask one or two relevant follow-up questions to gauge understanding.
- Keep answers concise but thorough and show worked examples when helpful.

Respond in a supportive, encouraging tone suitable for learners.`;

async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const promptWithSystem = `${SYSTEM_PROMPT}\n\n${prompt}`;
    const result = await generateText(promptWithSystem);
    const text = (result?.text ?? "").toString().trim();

    if (!text) {
      console.error("[chat] Gemini returned empty payload", { raw: result?.raw });
      return "Sorry, the tutoring service did not return a response. Please try again.";
    }

    return text;
  } catch (err) {
    const errorDetails = err instanceof Error ? err.message : String(err);
    console.error("[chat] callGeminiAPI error", {
      error: errorDetails,
      timestamp: new Date().toISOString(),
    });
    return `Sorry, the tutoring service encountered an error: ${errorDetails}. Please check your API key and try again.`;
  }
}

export async function getAIResponse(messages: ChatMessage[]): Promise<ChatMessage> {
  // Keep recent context compact for predictable latency and token usage.
  const recentMessages = messages.slice(-8);
  const transcript = recentMessages
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n\n");

  const prompt = `Conversation transcript:\n${transcript}`;

  const aiText = await callGeminiAPI(prompt);

  return {
    id: `ai-${Date.now()}`,
    role: "assistant",
    content: aiText,
    timestamp: Date.now(),
  };
}
