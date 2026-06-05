import { GoogleGenAI } from "@google/genai";

type GenerateResult = {
  text: string;
  raw: unknown;
};

export type EmbeddingTaskType =
  | "RETRIEVAL_DOCUMENT"
  | "RETRIEVAL_QUERY";

const GENERATIVE_MODEL = "gemini-2.5-flash";
const EMBEDDING_MODEL = "gemini-embedding-001";

export const EMBEDDING_DIMENSIONS = 768;

let aiClient: GoogleGenAI | null = null;

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable."
    );
  }

  return apiKey;
}

function getClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: getApiKey(),
    });
  }

  return aiClient;
}

export async function generateText(
  prompt: string
): Promise<GenerateResult> {
  try {
    const response = await getClient().models.generateContent({
      model: GENERATIVE_MODEL,
      contents: prompt,
    });

    const text = response.text;

    if (!text || text.trim() === "") {
      console.error("[Gemini Error] Response text is empty", {
        rawResponse: response,
      });

      throw new Error(
        "Gemini API returned empty response. Check API key and rate limits."
      );
    }

    return {
      text,
      raw: response,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[Gemini Error] generateText failed", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(`Gemini API error: ${errorMessage}`);
  }
}

export async function generateEmbedding(
  text: string,
  taskType: EmbeddingTaskType = "RETRIEVAL_DOCUMENT"
): Promise<number[]> {
  try {
    const response = await getClient().models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: {
        taskType,
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding || embedding.length === 0) {
      throw new Error("Empty embedding returned by Gemini.");
    }

    return embedding;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[Gemini Error] generateEmbedding failed", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(`Gemini Embedding error: ${errorMessage}`);
  }
}

export async function extractImageText(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  try {
    const base64Data = buffer.toString("base64");
    const response = await getClient().models.generateContent({
      model: GENERATIVE_MODEL,
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: "Extract and transcribe all readable text from this image exactly as it appears. Do not add any extra commentary or explanations, just the extracted text.",
        },
      ],
    });

    const text = response.text || "";
    return text;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[Gemini Error] extractImageText failed", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(`Gemini Image Extraction error: ${errorMessage}`);
  }
}