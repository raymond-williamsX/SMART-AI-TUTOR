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
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.error?.message || `HTTP ${response.status}`;
      console.error("[Gemini Error] API request failed", {
        status: response.status,
        error: errorMessage,
      });
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    // Extract text from response
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text || text.trim() === "") {
      console.error("[Gemini Error] Response text is empty", {
        rawResponse: data,
      });
      throw new Error(
        "Gemini API returned empty response. Check API key and rate limits."
      );
    }

    return {
      text,
      raw: data,
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