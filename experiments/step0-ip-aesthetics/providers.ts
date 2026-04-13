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
    throw new Error(`Gemini ${res.status}: ${text}`);
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

export async function callGemini(
  apiKey: string,
  prompt: string
): Promise<Buffer> {
  return callGeminiWithParts(apiKey, [{ text: prompt }]);
}

export async function callGeminiWithImage(
  apiKey: string,
  prompt: string,
  referenceImage: Buffer,
  mimeType: string = "image/png"
): Promise<Buffer> {
  return callGeminiWithParts(apiKey, [
    { inlineData: { mimeType, data: referenceImage.toString("base64") } },
    { text: prompt },
  ]);
}
