/**
 * Gemini 2.5 Flash Image wrapper for server routes.
 * Supports both text-only prompts and reference-image prompts.
 * Adapted from experiments/step0-ip-aesthetics/providers.ts.
 */

const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type Part =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

async function callGeminiWithParts(
  apiKey: string,
  parts: Part[]
): Promise<Buffer> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { data?: string } }> };
    }>;
  };

  const part = json.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData?.data
  );
  const b64 = part?.inlineData?.data;
  if (!b64) {
    throw new Error(
      `Gemini returned no image data: ${JSON.stringify(json).slice(0, 500)}`
    );
  }

  return Buffer.from(b64, "base64");
}

export async function generateImage(prompt: string): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return callGeminiWithParts(key, [{ text: prompt }]);
}

export async function generateImageWithReference(
  prompt: string,
  referenceImage: Buffer,
  mimeType: string = "image/png"
): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return callGeminiWithParts(key, [
    { inlineData: { mimeType, data: referenceImage.toString("base64") } },
    { text: prompt },
  ]);
}
