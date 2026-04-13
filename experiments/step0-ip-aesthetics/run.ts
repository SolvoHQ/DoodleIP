import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, requireKey } from "./env.ts";
import {
  buildPrompt,
  COLOR_STRATEGIES,
  ROUND_2_ARCHETYPES,
  type Archetype,
  type Strategy,
} from "./prompts.ts";
import { callGemini } from "./providers.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "outputs");
mkdirSync(OUTPUT_DIR, { recursive: true });

const isSmoke = process.argv.includes("--smoke");
const isColorRound = process.argv.includes("--color");

// Config selection — three modes:
//   (default)   → doodle on all ROUND_2_ARCHETYPES, 3 samples each
//   --smoke     → doodle on blob-creature, 1 sample
//   --color     → crayon/watercolor/accent on 2 winner archetypes, 2 samples each
const archetypesToRun: readonly Archetype[] = isColorRound
  ? ["potato-person", "one-eye-monster"]
  : isSmoke
    ? ["blob-creature"]
    : ROUND_2_ARCHETYPES;

const strategiesToRun: readonly Strategy[] = isColorRound
  ? COLOR_STRATEGIES
  : ["doodle"];

const samplesPerConfig = isColorRound ? 2 : isSmoke ? 1 : 3;

async function main() {
  const env = loadEnv();
  const apiKey = requireKey(env, "GEMINI_API_KEY");

  const total =
    archetypesToRun.length * strategiesToRun.length * samplesPerConfig;
  const mode = isColorRound ? "color" : isSmoke ? "smoke" : "full";
  console.log(
    `Mode=${mode}: generating ${total} images across ${archetypesToRun.length} archetype(s) × ${strategiesToRun.length} strategy/strategies via gemini`
  );

  let done = 0;
  let failed = 0;

  for (const archetype of archetypesToRun) {
    for (const strategy of strategiesToRun) {
      const prompt = buildPrompt(archetype, strategy);
      for (let i = 1; i <= samplesPerConfig; i++) {
        const sample = String(i).padStart(2, "0");
        const filename = `${archetype}-gemini-${strategy}-${sample}.png`;
        const outPath = resolve(OUTPUT_DIR, filename);

        try {
          process.stdout.write(`[${++done}/${total}] ${filename} ... `);
          const img = await callGemini(apiKey, prompt);
          writeFileSync(outPath, img);
          console.log(`ok (${img.length} bytes)`);
        } catch (err) {
          failed++;
          console.log(`FAILED: ${(err as Error).message}`);
        }
      }
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
