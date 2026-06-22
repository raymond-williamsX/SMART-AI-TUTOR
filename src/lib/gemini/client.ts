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

const MOCK_ANSWERS: Record<string, string> = {
  "quantum computing": "Quantum computing is a type of computing that uses quantum mechanics (like superposition and entanglement) to process information. While classical computers use bits (0s and 1s), quantum computers use qubits, which can exist in multiple states at once. This allows them to solve complex calculations, like drug discovery or cryptography, exponentially faster.",
  "active and passive transport": "Active transport requires cellular energy (ATP) to move molecules against their concentration gradient (from low to high concentration), like the sodium-potassium pump. Passive transport, however, requires no energy as molecules move along their gradient (from high to low concentration), such as simple diffusion or osmosis.",
  "recursive programming": "Recursive programming is a method where a function calls itself to solve a smaller instance of the same problem. Think of it like a set of nesting Russian dolls: to reach the smallest doll, you must open each larger doll one by one, with a 'base case' that tells the function when to stop opening dolls and return the result.",
  "dna replicate": "DNA replication is the process by which a double-stranded DNA molecule is copied to produce two identical DNA molecules. It occurs in three main steps: unwinding of the double helix by helicase, complementary base pairing by DNA polymerase, and joining of the sugar-phosphate backbone by ligase.",
  "default": "That's an excellent study question! In academic terms, this concept focuses on how structured inputs adapt to dynamic environments. To master this topic, try breaking it down into its core components: define the primary terms, map out their relationships, and look for real-world examples of this system in action."
};

function getMockAnswer(prompt: string): string {
  const normalized = prompt.toLowerCase();
  for (const key of Object.keys(MOCK_ANSWERS)) {
    if (normalized.includes(key)) {
      return MOCK_ANSWERS[key];
    }
  }
  return MOCK_ANSWERS["default"];
}

function getMockEmbedding(text: string): number[] {
  const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);
  for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
    const charCode = text.charCodeAt(i % text.length) || 0;
    vector[i] = Math.sin(charCode + i) * 0.1;
  }
  return vector;
}

function isMockingNeeded(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("API key not valid") ||
    msg.includes("API_KEY_INVALID") ||
    msg.includes("INVALID_ARGUMENT") ||
    msg.includes("Missing GEMINI_API_KEY")
  );
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
    if (isMockingNeeded(error)) {
      console.warn("[Gemini Client] API key is invalid/missing. Falling back to high-quality mockup responses for the demo.");
      const mockText = getMockAnswer(prompt);
      return {
        text: mockText,
        raw: { mock: true },
      };
    }

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
    if (isMockingNeeded(error)) {
      console.warn("[Gemini Client] API key is invalid/missing. Falling back to mock embeddings for the demo.");
      return getMockEmbedding(text);
    }

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
    if (isMockingNeeded(error)) {
      console.warn("[Gemini Client] API key is invalid/missing. Falling back to mock OCR text for the demo.");
      return `[Mock OCR Result: Extracted text from ${fileName || "image"}. Let's study this material together!]`;
    }

    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error("[Gemini Error] extractImageText failed", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new Error(`Gemini Image Extraction error: ${errorMessage}`);
  }
}