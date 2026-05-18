/* Server-side Gemini client wrapper
   - Safe: does not throw at module import time
   - Attempts to use @google/generative-ai if available (dynamic import)
   - Falls back to HTTP call to the Generative Language API
   - Exports `generateText(prompt)` which will validate the API key at call time
*/

type GenerateResult = {
  text: string;
  raw: unknown;
};

function resolveApiKey(): string | null {
  return process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? null;
}

export async function generateText(prompt: string): Promise<GenerateResult> {
  const API_KEY = resolveApiKey();

  if (!API_KEY) {
    throw new Error("Missing Gemini API key. Set GEMINI_API_KEY in server environment.");
  }

  // Try SDK first (dynamic import)
  try {
    const ga = await import("@google/generative-ai");
    const TextService = (ga as any).TextServiceClient || (ga as any).TextGenerationServiceClient || (ga as any).TextClient || (ga as any).GoogleGenerativeAI;

    if (TextService) {
      try {
        // Different SDK shapes: try instantiation patterns
        const ClientCtor = TextService;
        const client = new ClientCtor({ apiKey: API_KEY } as any);

        if (typeof client.generate === "function") {
          const response = await client.generate({ model: "gemini-1.5-mini", prompt });
          const text = response?.output?.[0]?.content ?? response?.candidates?.[0]?.content ?? JSON.stringify(response);
          return { text: String(text), raw: response };
        }
      } catch (e) {
        // continue to HTTP fallback
        console.info("[gemini] sdk client call failed, falling back to http", { error: String(e) });
      }
    }
  } catch (e) {
    // SDK not installed or failed to import
    console.info("[gemini] SDK not available, will use HTTP fallback", { error: String(e) });
  }

  // HTTP fallback to Generative Language API
  try {
    const model = "models/gemini-1.5-mini:generateText";
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}?key=${API_KEY}`;
    const body = {
      prompt: { text: prompt },
      temperature: 0.6,
      maxOutputTokens: 800,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    const text =
      data?.candidates?.[0]?.output?.[0]?.content?.[0]?.text || data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.output?.[0]?.content || data?.text || JSON.stringify(data);

    return { text: String(text), raw: data };
  } catch (err) {
    console.error("[gemini] http fallback failed", { error: err });
    throw new Error("Gemini service unavailable");
  }
}
