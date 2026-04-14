// One-shot script — generates the 8 archetype thumbnails for the
// onboarding inspiration grid. Run once, commit outputs to /public.
//
// Usage: GEMINI_API_KEY=... node scripts/generate-archetype-thumbs.mjs
//
// Safe to re-run (overwrites existing files). Uses the same doodle
// strategy validated in Step 0.

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "public", "archetypes");
mkdirSync(OUT_DIR, { recursive: true });

const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const ARCHETYPES = [
  { key: "potato",  subject: "a potato-shaped upright character with two tiny stub arms and short little legs, two dot eyes and a small mouth" },
  { key: "blob",    subject: "a round rice-ball-shaped blob creature with no visible limbs, just a tiny face with two small dot eyes and a small smile" },
  { key: "monster", subject: "a small round fuzzy creature with one big central round eye, two tiny stub legs, no visible mouth" },
  { key: "frog",    subject: "a chubby round frog sitting on the ground, wide simple mouth, and two round dot eyes on top of its head" },
  { key: "ghost",   subject: "a small ghost with a rounded dome top and a wavy bottom edge, two round dot eyes, no mouth, floating" },
  { key: "stick",   subject: "a round-head stick figure with two dot eyes and a simple smile, thin stick arms and legs" },
  { key: "square",  subject: "a character with a small round head, a square rectangular block torso, and thin stick arms and legs; two dot eyes and a one-line smile on the head" },
  { key: "catblob", subject: "a round-faced cat character with two simple dot eyes, a small triangular nose, and a one-line smile, sitting upright" },
];

function doodlePrompt(subject) {
  return (
    `Hand-drawn doodle of ${subject}. ` +
    `Single uneven black pen stroke on a plain white background. ` +
    `Minimal strokes — only what's essential for the character to read. ` +
    `Deliberately imperfect geometry — wobbly lines, asymmetric proportions. ` +
    `No shading, no gradient, no color fill, no background objects, no texture. ` +
    `Looks like a human sketched it in a notebook in under a minute. ` +
    `Children's book doodle style.`
  );
}

async function callGemini(apiKey, prompt) {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  const b64 = part?.inlineData?.data;
  if (!b64) throw new Error("No image in response");
  return Buffer.from(b64, "base64");
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY env var required");

  for (const { key, subject } of ARCHETYPES) {
    const outPath = resolve(OUT_DIR, `${key}.png`);
    console.log(`generating ${key}...`);
    const img = await callGemini(apiKey, doodlePrompt(subject));
    writeFileSync(outPath, img);
    console.log(`  ok: ${outPath} (${img.length} bytes)`);
  }
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
