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

const genAI = new GoogleGenerativeAI(getApiKey());

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export async function generateText(
  prompt: string
): Promise<GenerateResult> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Validate response before extracting text
    if (!response) {
      console.error("[Gemini Error] Response is null or undefined");
      throw new Error("Gemini returned no response object");
    }

    // Check if text() method exists and is callable
    if (typeof response.text !== "function") {
      console.error("[Gemini Error] response.text is not a function", {
        responseKeys: Object.keys(response),
        responseType: typeof response,
      });
      throw new Error("Invalid response structure from Gemini API");
    }

    let text: string;
    try {
      text = response.text();
    } catch (textError) {
      console.error("[Gemini Error] Failed to extract text from response", {
        error: textError,
        responseStatus: (response as any)?.promptFeedback?.blockReason,
      });
      throw new Error(`Failed to extract text: ${String(textError)}`);
    }

    if (!text || text.trim() === "") {
      console.error("[Gemini Error] Response text is empty", {
        rawResponse: response,
        promptFeedback: (response as any)?.promptFeedback,
      });
      throw new Error("Gemini API returned empty response. Check API key and rate limits.");
    }

    return {
      text,
      raw: response,
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