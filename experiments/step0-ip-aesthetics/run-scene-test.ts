import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, requireKey } from "./env.ts";
import { callGeminiWithImage } from "./providers.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "outputs");
mkdirSync(OUTPUT_DIR, { recursive: true });

const REFERENCE_PATH = resolve(__dirname, "round3-crayon-potato.png");

const IDENTITY_PRESERVATION =
  " Preserve the character perfectly: same potato body shape, same face (two dot eyes, small smile), same pink cheeks, same green arms and boots, same crayon-on-cream-paper style, same deliberately imperfect hand-drawn feel. The character must be CLEARLY recognizable as the same one in the reference. The character is the focal subject, the scene is a supporting backdrop. Hand-drawn crayon illustration, children's book feel. No digital polish.";

const SCENES = [
  {
    key: "sim-card",
    prompt:
      "The exact same character as the reference image, now standing at an EE mobile phone shop counter at an airport, holding up a small SIM card and looking at it with curious expression. Simple hand-drawn scene in the background: a counter, a small 'EE' sign, a shop display. Scene drawn in same crayon hand-drawn style as the character." +
      IDENTITY_PRESERVATION,
  },
  {
    key: "tesco",
    prompt:
      "The exact same character as the reference image, now standing outside a small Tesco Express storefront, looking up at the 'Tesco Express' sign with a slightly worried / skeptical expression, one hand on chin. Simple hand-drawn storefront in background — a doorway, a sign, a window. Scene drawn in same crayon hand-drawn style as the character." +
      IDENTITY_PRESERVATION,
  },
  {
    key: "tube-station",
    prompt:
      "The exact same character as the reference image, now standing inside a London Underground tube station, looking down at a wristwatch with a slightly alarmed / rushed expression. Simple hand-drawn scene: tiled station walls, a 'Tube' roundel logo in background, platform edge. Scene drawn in same crayon hand-drawn style as the character." +
      IDENTITY_PRESERVATION,
  },
  {
    key: "rooftop-phone",
    prompt:
      "The exact same character as the reference image, now sitting cross-legged, holding a smartphone with both hands, looking down at the screen with relaxed expression. Simple hand-drawn scene: sitting on a small platform or cushion, tiny plant beside. Scene drawn in same crayon hand-drawn style as the character." +
      IDENTITY_PRESERVATION,
  },
];

async function main() {
  const env = loadEnv();
  const apiKey = requireKey(env, "GEMINI_API_KEY");

  const reference = readFileSync(REFERENCE_PATH);
  console.log(
    `Reference: ${REFERENCE_PATH} (${reference.length} bytes)\nGenerating ${SCENES.length} scene variations via gemini with image input...\n`
  );

  let done = 0;
  let failed = 0;

  for (const { key, prompt } of SCENES) {
    const filename = `scene-${key}.png`;
    const outPath = resolve(OUTPUT_DIR, filename);
    try {
      process.stdout.write(`[${++done}/${SCENES.length}] ${filename} ... `);
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
