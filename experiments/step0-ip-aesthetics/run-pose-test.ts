import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, requireKey } from "./env.ts";
import { callGeminiWithImage } from "./providers.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "outputs");
mkdirSync(OUTPUT_DIR, { recursive: true });

const REFERENCE_PATH = resolve(__dirname, "round3-crayon-potato.png");

const POSES = [
  {
    key: "thinking",
    prompt:
      "The exact same character as the reference image, now in a thinking pose — one hand on chin, slightly tilted head, contemplative expression. Preserve the character's design perfectly: same proportions, same face, same colors, same crayon-on-cream-paper style, same deliberately imperfect hand-drawn feel. ONLY the pose changes. No digital polish. Children's-book crayon illustration.",
  },
  {
    key: "waving",
    prompt:
      "The exact same character as the reference image, now waving one hand in greeting, cheerful. Preserve the character's design perfectly: same proportions, same face, same colors, same crayon-on-cream-paper style, same deliberately imperfect hand-drawn feel. ONLY the pose changes. No digital polish.",
  },
  {
    key: "pointing",
    prompt:
      "The exact same character as the reference image, now pointing to the right with one arm extended, other arm at side. Preserve the character's design perfectly: same proportions, same face, same colors, same crayon-on-cream-paper style, same deliberately imperfect hand-drawn feel. ONLY the pose changes. No digital polish.",
  },
  {
    key: "holding-phone",
    prompt:
      "The exact same character as the reference image, now holding a small smartphone in both hands, looking down at its screen. Preserve the character's design perfectly: same proportions, same face, same colors, same crayon-on-cream-paper style, same deliberately imperfect hand-drawn feel. ONLY the pose changes. No digital polish.",
  },
];

async function main() {
  const env = loadEnv();
  const apiKey = requireKey(env, "GEMINI_API_KEY");

  const reference = readFileSync(REFERENCE_PATH);
  console.log(
    `Reference: ${REFERENCE_PATH} (${reference.length} bytes)\nGenerating ${POSES.length} pose variations via gemini with image input...\n`
  );

  let done = 0;
  let failed = 0;

  for (const { key, prompt } of POSES) {
    const filename = `pose-${key}.png`;
    const outPath = resolve(OUTPUT_DIR, filename);
    try {
      process.stdout.write(`[${++done}/${POSES.length}] ${filename} ... `);
      const img = await callGeminiWithImage(apiKey, prompt, reference);
      writeFileSync(outPath, img);
      console.log(`ok (${img.length} bytes)`);
    } catch (err) {
      failed++;
      console.log(`FAILED: ${(err as Error).message}`);
    }
  }

  console.log(
    `\nDone. ${done - failed} succeeded, ${failed} failed. Outputs in ${OUTPUT_DIR}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
