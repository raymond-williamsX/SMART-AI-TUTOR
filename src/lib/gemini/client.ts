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

    const text = response.text();

    return {
      text,
      raw: response,
    };
  } catch (error) {
    console.error("[Gemini Error]", error);

    throw new Error(
      "Failed to generate AI response."
    );
  }
}