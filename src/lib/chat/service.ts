import { generateText } from "@/lib/gemini/client";
import type { ChatMessage } from "./types";
import { formatRagContext, retrieveMaterialContext } from "@/lib/materials/retrieval";

const SYSTEM_PROMPT = `You are EduAgent AI, a professional AI tutor. When responding, do the following:
- Act as a knowledgeable and patient tutor.
- Explain step-by-step with clear examples when appropriate.
- Simplify complex concepts and use analogies.
- Ask one or two relevant follow-up questions to gauge understanding.
- Keep answers concise but thorough and show worked examples when helpful.
- Use uploaded materials whenever relevant.
- If the answer exists in uploaded documents, prioritize those sources.
- If uploaded materials are not relevant or unavailable, use general educational knowledge.

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

export async function getAIResponse(
  messages: ChatMessage[],
  options?: {
    userId?: string;
    sessionId?: string;
  }
): Promise<ChatMessage> {
  // Keep recent context compact for predictable latency and token usage.
  const recentMessages = messages.slice(-8);
  const transcript = recentMessages
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n\n");
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user" && message.content.trim());
  let materialContext = "No uploaded-material context was retrieved for this question.";
  let sources: ChatMessage["sources"] = [];

  if (options?.userId && options.sessionId && latestUserMessage?.content) {
    try {
      const ragContext = await retrieveMaterialContext({
        userId: options.userId,
        sessionId: options.sessionId,
        query: latestUserMessage.content,
      });
      materialContext = formatRagContext(ragContext.chunks);
      sources = ragContext.sources;
    } catch (error) {
      console.error("[chat] RAG retrieval failed; continuing with general tutor mode", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const prompt = `Uploaded material context:
${materialContext}

Conversation transcript:
${transcript}

Answer the student's latest question. If you used uploaded material context, make the answer faithful to that context. If not, answer as a general tutor.`;

  const aiText = await callGeminiAPI(prompt);

  return {
    id: `ai-${Date.now()}`,
    role: "assistant",
    content: aiText,
    timestamp: Date.now(),
    sources,
  };
}
