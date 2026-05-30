import { GoogleGenerativeAI } from "@google/generative-ai";

type GenerateResult = {
  text: string;
  raw: unknown;
};

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable."
    );
  }

  return apiKey;
}

export async function generateText(
  prompt: string
): Promise<GenerateResult> {
  try {
    const apiKey = getApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent(prompt);

    if (!response.response) {
      console.error("[Gemini Error] No response object returned");
      throw new Error("Gemini API returned no response");
    }

    const text = response.response.text();

    if (!text || text.trim() === "") {
      console.error("[Gemini Error] Response text is empty", {
        rawResponse: response.response,
      });
      throw new Error(
        "Gemini API returned empty response. Check API key and rate limits."
      );
    }

    return {
      text,
      raw: response.response,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Gemini Error] generateText failed", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(`Gemini API error: ${errorMessage}`);
  }
}