import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, requireKey } from "./env.ts";
import { buildPrompt, STRATEGIES, type Archetype, type Strategy } from "./prompts.ts";
import { callGemini } from "./providers.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, "outputs");
mkdirSync(OUTPUT_DIR, { recursive: true });

const isSmoke = process.argv.includes("--smoke");
const archetype: Archetype = "cat";

const samplesPerConfig = isSmoke ? 1 : 4;
const strategiesToRun: readonly Strategy[] = isSmoke ? ["doodle"] : STRATEGIES;

async function main() {
  const env = loadEnv();
  const apiKey = requireKey(env, "GEMINI_API_KEY");

  const total = strategiesToRun.length * samplesPerConfig;
  console.log(
    `Generating ${total} images (smoke=${isSmoke}) for archetype=${archetype} via gemini`
  );

  let done = 0;
  let failed = 0;

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

  console.log(
    `\nDone. ${done - failed} succeeded, ${failed} failed. Outputs in ${OUTPUT_DIR}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
