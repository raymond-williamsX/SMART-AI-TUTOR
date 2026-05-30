import { GoogleGenAI, createPartFromBase64 } from "@google/genai";

type GenerateResult = {
  text: string;
  raw: unknown;
};

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

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

function getClient() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: getApiKey() });
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Gemini Error] generateText failed", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(`Gemini API error: ${errorMessage}`);
  }
}

export async function generateEmbedding(
  text: string,
  taskType: EmbeddingTaskType,
  title?: string
): Promise<number[]> {
  try {
    const response = await getClient().models.embedContent({
      model: EMBEDDING_MODEL,
      contents: [text],
      config: {
        taskType,
        title: taskType === "RETRIEVAL_DOCUMENT" ? title : undefined,
        outputDimensionality: EMBEDDING_DIMENSIONS,
        autoTruncate: true,
      },
    });

    const values = response.embeddings?.[0]?.values;
    if (!values?.length) {
      throw new Error("Gemini returned no embedding values.");
    }

    return values;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Gemini Error] generateEmbedding failed", {
      message: errorMessage,
    });
    throw new Error(`Gemini embedding error: ${errorMessage}`);
  }
}

export async function extractImageText(buffer: Buffer, mimeType: string, fileName: string): Promise<string> {
  try {
    const response = await getClient().models.generateContent({
      model: GENERATIVE_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            createPartFromBase64(buffer.toString("base64"), mimeType),
            {
              text: `Extract all educational information from this uploaded material named "${fileName}". Include visible text, labels, diagram relationships, formulas, slide/note context, and a concise summary. Preserve useful structure for tutoring.`,
            },
          ],
        },
      ],
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error("Gemini Vision returned no extracted text.");
    }

    return text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Gemini Error] extractImageText failed", {
      message: errorMessage,
      fileName,
      mimeType,
    });
    throw new Error(`Gemini image extraction error: ${errorMessage}`);
  }
}
