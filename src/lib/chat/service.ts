import { ChatMessage } from "./types";
import { env } from "@/lib/env";

const SYSTEM_PROMPT = `You are EduAgent, a professional AI tutor. When responding, do the following:
- Act as a knowledgeable and patient tutor.
- Explain step-by-step with clear examples when appropriate.
- Simplify complex concepts and use analogies.
- Ask one or two relevant follow-up questions to gauge understanding.
- Keep answers concise but thorough and show worked examples when helpful.

Respond in a supportive, encouraging tone suitable for learners.`;

async function callGeminiAPI(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY ?? env.NEXT_PUBLIC_GEMINI_API_KEY;

  // Placeholder: if API key is not configured, return a deterministic mock response.
  if (!geminiKey) {
    return [
      "I can help with that.",
      "",
      "1) Let us define the core concept first.",
      "2) Then we break it into smaller steps.",
      "3) Finally we apply it with one practical example.",
      "",
      "Quick check: which part would you like to go deeper on?",
    ].join("\n");
  }

  // Server-side Gemini HTTP call.
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 800,
        },
      }),
      }
    );

    if (!res.ok) {
      return "I could not reach the tutoring model right now. Please try again in a moment.";
    }

    const data = await res.json();

    const content =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text ?? "")
        .join("\n")
        .trim() ?? "";

    if (!content) {
      return "I was not able to generate a response for that prompt. Could you rephrase your question?";
    }

    return String(content);
  } catch {
    return "Sorry, the tutoring service is temporarily unavailable. Please retry.";
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
