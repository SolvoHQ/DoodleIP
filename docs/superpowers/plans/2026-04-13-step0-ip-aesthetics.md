# Step 0 — IP Aesthetic Feasibility Experiment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a disposable TypeScript script that calls Gemini 2.5 Flash Image and FLUX.1 [dev] with 3 prompt strategies × 4 samples each, saves 24 named PNGs for visual review, and produces a go/no-go decision on whether hand-drawn doodle IP characters are achievable via current image-generation APIs.

**Architecture:** A single-directory, non-production experiment under `experiments/step0-ip-aesthetics/`. TypeScript + `tsx` runner, native `fetch` for both providers, no SDKs. Manual env-file loading (no deps beyond `tsx`). Outputs go to a gitignored `outputs/` folder; results are recorded by hand in the experiment's `README.md`. Entirely isolated from the Next.js app.

**Tech Stack:** TypeScript 5, `tsx`, Node 20+, native `fetch`, Gemini REST API (`gemini-2.5-flash-image-preview`), fal.ai REST API (`fal-ai/flux/dev`).

**Spec:** `docs/superpowers/specs/2026-04-13-step0-ip-aesthetics-design.md`

---

## File Structure

**Created:**
- `experiments/step0-ip-aesthetics/README.md` — purpose, how to run, results section
- `experiments/step0-ip-aesthetics/prompts.ts` — three prompt strategy templates + types
- `experiments/step0-ip-aesthetics/providers.ts` — `callGemini()` and `callFlux()`, both return `Buffer`
- `experiments/step0-ip-aesthetics/env.ts` — minimal env-file loader (no deps)
- `experiments/step0-ip-aesthetics/run.ts` — orchestrator: iterate configs, save images
- `experiments/step0-ip-aesthetics/.env.experiment.example` — template for required keys

**Modified:**
- `.gitignore` — add `experiments/**/outputs/` and `experiments/**/.env.experiment`
- `package.json` — add `tsx` to `devDependencies`

**Not committed (runtime artifacts):**
- `experiments/step0-ip-aesthetics/outputs/*.png`
- `experiments/step0-ip-aesthetics/.env.experiment`

---

## Testing Approach

This experiment has no automated tests — the spec explicitly excludes them. Verification at each task is manual:
- After each provider implementation: run a single call, confirm a valid PNG lands on disk
- After the orchestrator: run in smoke mode (one sample, not four) and confirm file naming/counts
- Final evaluation: visual review in Finder's gallery view, outcome recorded in `README.md`

---

### Task 1: Scaffold directory, gitignore, deps

**Files:**
- Create: `experiments/step0-ip-aesthetics/README.md`
- Create: `experiments/step0-ip-aesthetics/.env.experiment.example`
- Create: `experiments/step0-ip-aesthetics/outputs/.gitkeep`
- Modify: `.gitignore`
- Modify: `package.json`

- [ ] **Step 1: Create experiment directory and placeholder README**

Create `experiments/step0-ip-aesthetics/README.md` with this content:

```markdown
# Step 0 — IP Aesthetic Feasibility Experiment

See spec: `docs/superpowers/specs/2026-04-13-step0-ip-aesthetics-design.md`

## Goal

Answer a single binary question: can current image-generation APIs produce hand-drawn doodle IP characters that pass the "would I use this as my personal IP?" gut test?

## Prerequisites

1. Copy `.env.experiment.example` to `.env.experiment` and fill in:
   - `GEMINI_API_KEY` — from https://aistudio.google.com/app/apikey
   - `FAL_KEY` — from https://fal.ai/dashboard/keys
2. Prepay at least $5 on fal.ai (will be underused)

## How to run

From repo root:

```bash
# Smoke run (2 images, ~$0.10) — verify API keys and pipeline
pnpm tsx experiments/step0-ip-aesthetics/run.ts --smoke

# Full run (24 images, ~$1)
pnpm tsx experiments/step0-ip-aesthetics/run.ts
```

Outputs land in `outputs/` as `{archetype}-{model}-{strategy}-{sample}.png`.

Open that folder in Finder, switch to Gallery view, and scan.

## Evaluation

For each image, ask: **"Would I use this as the IP representing me?"**

Mark pass/fail. Then classify the overall run:

- 🟢 **Green** — ≥ 3 passes clustered under a stable (model × strategy) combo
- 🟡 **Yellow** — 1-2 scattered passes (looks like luck)
- 🔴 **Red** — 0 passes or all AI slop

## Results

_To be filled in after running the experiment._
```

- [ ] **Step 2: Create `.env.experiment.example`**

File `experiments/step0-ip-aesthetics/.env.experiment.example`:

```
# Get from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=

# Get from https://fal.ai/dashboard/keys
FAL_KEY=
```

- [ ] **Step 3: Create `outputs/.gitkeep`**

So the folder exists in fresh clones even though contents are gitignored.

```bash
mkdir -p experiments/step0-ip-aesthetics/outputs
touch experiments/step0-ip-aesthetics/outputs/.gitkeep
```

- [ ] **Step 4: Update `.gitignore`**

Append these lines to `.gitignore`:

```
# experiments
experiments/**/outputs/*
!experiments/**/outputs/.gitkeep
experiments/**/.env.experiment
```

- [ ] **Step 5: Add `tsx` as dev dep**

Run:

```bash
npm install --save-dev tsx
```

Verify `package.json` now has `"tsx"` under `devDependencies`.

- [ ] **Step 6: Smoke-test tsx install**

Run:

```bash
npx tsx -e "console.log('tsx works')"
```

Expected output: `tsx works`

- [ ] **Step 7: Commit**

```bash
git add experiments/step0-ip-aesthetics/README.md \
        experiments/step0-ip-aesthetics/.env.experiment.example \
        experiments/step0-ip-aesthetics/outputs/.gitkeep \
        .gitignore package.json package-lock.json
git commit -m "chore: scaffold step 0 ip-aesthetics experiment directory"
```

---

### Task 2: Env loader

**Files:**
- Create: `experiments/step0-ip-aesthetics/env.ts`

- [ ] **Step 1: Write `env.ts`**

File `experiments/step0-ip-aesthetics/env.ts`:

```typescript
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadEnv(): Record<string, string> {
  const path = resolve(__dirname, ".env.experiment");
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    throw new Error(
      `Missing ${path}. Copy .env.experiment.example and fill in keys.`
    );
  }

  const env: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key) env[key] = value;
  }
  return env;
}

export function requireKey(env: Record<string, string>, name: string): string {
  const v = env[name];
  if (!v) throw new Error(`Missing ${name} in .env.experiment`);
  return v;
}
```

- [ ] **Step 2: Manually verify**

Create a temporary `.env.experiment` (without real keys, just to test parsing):

```bash
cat > experiments/step0-ip-aesthetics/.env.experiment <<'EOF'
GEMINI_API_KEY=test-gemini
FAL_KEY=test-fal
EOF
```

Run:

```bash
npx tsx -e "import('./experiments/step0-ip-aesthetics/env.ts').then(m => console.log(m.loadEnv()))"
```

Expected output: `{ GEMINI_API_KEY: 'test-gemini', FAL_KEY: 'test-fal' }`

Then remove the test file (or replace with real keys later):

```bash
rm experiments/step0-ip-aesthetics/.env.experiment
```

- [ ] **Step 3: Commit**

```bash
git add experiments/step0-ip-aesthetics/env.ts
git commit -m "feat(exp): add env-file loader for step 0"
```

---

### Task 3: Prompt strategies

**Files:**
- Create: `experiments/step0-ip-aesthetics/prompts.ts`

- [ ] **Step 1: Write `prompts.ts`**

File `experiments/step0-ip-aesthetics/prompts.ts`:

```typescript
export type Archetype = "cat" | "stick-figure";
export type Strategy = "naive" | "artist" | "doodle";

export interface PromptConfig {
  archetype: Archetype;
  strategy: Strategy;
  prompt: string;
}

const BASE: Record<Archetype, { naive: string; subject: string }> = {
  cat: {
    naive: "a simple cat character",
    subject: "cat",
  },
  "stick-figure": {
    naive: "a simple round-head stick figure character",
    subject: "round-head stick figure",
  },
};

export function buildPrompt(archetype: Archetype, strategy: Strategy): string {
  const { naive, subject } = BASE[archetype];

  if (strategy === "naive") {
    return naive;
  }

  if (strategy === "artist") {
    return (
      `A ${subject} character in the style of minimalist line artists ` +
      `like Jean Jullien and Jimmy Liao (几米). ` +
      `Minimal line drawing, children's book illustration feel, hand-drawn.`
    );
  }

  // strategy === "doodle"
  return (
    `Hand-drawn doodle of a ${subject}. ` +
    `Single uneven black pen stroke on a plain white background. ` +
    `Two simple dot eyes, one-line smile, minimal features. ` +
    `Deliberately imperfect geometry — wobbly lines, asymmetric proportions. ` +
    `No shading, no gradient, no color fill, no background objects, no texture. ` +
    `Looks like a human sketched it in a notebook in under a minute. ` +
    `Children's book doodle style.`
  );
}

export const STRATEGIES: Strategy[] = ["naive", "artist", "doodle"];
```

- [ ] **Step 2: Manually verify prompts build correctly**

Run:

```bash
npx tsx -e "import('./experiments/step0-ip-aesthetics/prompts.ts').then(m => { for (const s of m.STRATEGIES) console.log(s, '→', m.buildPrompt('cat', s)); })"
```

Expected: three lines printed, one per strategy, each with a progressively longer prompt for `cat`.

- [ ] **Step 3: Commit**

```bash
git add experiments/step0-ip-aesthetics/prompts.ts
git commit -m "feat(exp): add 3-level prompt strategies for step 0"
```

---

### Task 4: Gemini provider

**Files:**
- Create: `experiments/step0-ip-aesthetics/providers.ts`

The Gemini image model is accessed through the `generateContent` endpoint with `responseModalities: ["IMAGE"]`. Response parts contain `inlineData` with base64-encoded image bytes.

- [ ] **Step 1: Write the Gemini half of `providers.ts`**

File `experiments/step0-ip-aesthetics/providers.ts`:

```typescript
const GEMINI_MODEL = "gemini-2.5-flash-image-preview";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function callGemini(
  apiKey: string,
  prompt: string
): Promise<Buffer> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
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
```

- [ ] **Step 2: Fill in real `GEMINI_API_KEY` in `.env.experiment`**

Create `.env.experiment` from `.env.experiment.example` and paste your Gemini key.

- [ ] **Step 3: Manually verify with one real call**

Run:

```bash
npx tsx -e "
import { writeFileSync } from 'node:fs';
import { loadEnv, requireKey } from './experiments/step0-ip-aesthetics/env.ts';
import { callGemini } from './experiments/step0-ip-aesthetics/providers.ts';
const env = loadEnv();
const img = await callGemini(requireKey(env, 'GEMINI_API_KEY'), 'hand-drawn doodle of a cat, single black pen stroke');
writeFileSync('experiments/step0-ip-aesthetics/outputs/_smoke-gemini.png', img);
console.log('saved', img.length, 'bytes');
"
```

Expected: file `_smoke-gemini.png` created, ≥ 10 KB, opens as a PNG in Preview.

If API returns an error about model name or modality, consult https://ai.google.dev/gemini-api/docs/image-generation for the current model ID and update the `GEMINI_MODEL` constant.

- [ ] **Step 4: Commit**

```bash
git add experiments/step0-ip-aesthetics/providers.ts
git commit -m "feat(exp): add gemini 2.5 flash image provider"
```

---

### Task 5: FLUX (fal.ai) provider

**Files:**
- Modify: `experiments/step0-ip-aesthetics/providers.ts` (append `callFlux`)

fal.ai's synchronous `fal.run` endpoint accepts a POST with `Authorization: Key <FAL_KEY>` and returns JSON with image URLs we then download.

- [ ] **Step 1: Append `callFlux` to `providers.ts`**

Add to `experiments/step0-ip-aesthetics/providers.ts`:

```typescript
const FAL_FLUX_ENDPOINT = "https://fal.run/fal-ai/flux/dev";

export async function callFlux(
  apiKey: string,
  prompt: string
): Promise<Buffer> {
  const submitRes = await fetch(FAL_FLUX_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify({
      prompt,
      image_size: "square_hd",
      num_images: 1,
      enable_safety_checker: false,
    }),
  });

  if (!submitRes.ok) {
    const text = await submitRes.text();
    throw new Error(`fal.ai submit ${submitRes.status}: ${text}`);
  }

  const result = (await submitRes.json()) as {
    images?: Array<{ url?: string }>;
  };

  const url = result.images?.[0]?.url;
  if (!url) {
    throw new Error(
      `fal.ai returned no image: ${JSON.stringify(result).slice(0, 500)}`
    );
  }

  const imgRes = await fetch(url);
  if (!imgRes.ok) {
    throw new Error(`fal.ai image download ${imgRes.status}`);
  }
  const arrayBuf = await imgRes.arrayBuffer();
  return Buffer.from(arrayBuf);
}
```

- [ ] **Step 2: Manually verify with one real call**

Run:

```bash
npx tsx -e "
import { writeFileSync } from 'node:fs';
import { loadEnv, requireKey } from './experiments/step0-ip-aesthetics/env.ts';
import { callFlux } from './experiments/step0-ip-aesthetics/providers.ts';
const env = loadEnv();
const img = await callFlux(requireKey(env, 'FAL_KEY'), 'hand-drawn doodle of a cat, single black pen stroke on white');
writeFileSync('experiments/step0-ip-aesthetics/outputs/_smoke-flux.png', img);
console.log('saved', img.length, 'bytes');
"
```

Expected: file `_smoke-flux.png` created, ≥ 50 KB, opens as a valid image.

- [ ] **Step 3: Commit**

```bash
git add experiments/step0-ip-aesthetics/providers.ts
git commit -m "feat(exp): add fal.ai flux.1 dev provider"
```

---

### Task 6: Orchestrator

**Files:**
- Create: `experiments/step0-ip-aesthetics/run.ts`

- [ ] **Step 1: Write `run.ts`**

File `experiments/step0-ip-aesthetics/run.ts`:

```typescript
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnv, requireKey } from "./env";
import { buildPrompt, STRATEGIES, type Archetype, type Strategy } from "./prompts";
import { callGemini, callFlux } from "./providers";

type Model = "gemini" | "flux";
const MODELS: Model[] = ["gemini", "flux"];

const OUTPUT_DIR = resolve(__dirname, "outputs");
mkdirSync(OUTPUT_DIR, { recursive: true });

const isSmoke = process.argv.includes("--smoke");
const archetype: Archetype = "cat"; // primary run — spec: cat first, stick-figure only if cat passes

// Smoke mode: 1 model × 1 strategy × 1 sample. Full mode: 2 × 3 × 4.
const samplesPerConfig = isSmoke ? 1 : 4;
const modelsToRun: Model[] = isSmoke ? ["flux"] : MODELS;
const strategiesToRun: Strategy[] = isSmoke ? ["doodle"] : STRATEGIES;

async function generate(
  model: Model,
  prompt: string,
  env: Record<string, string>
): Promise<Buffer> {
  if (model === "gemini") {
    return callGemini(requireKey(env, "GEMINI_API_KEY"), prompt);
  }
  return callFlux(requireKey(env, "FAL_KEY"), prompt);
}

async function main() {
  const env = loadEnv();

  const total =
    modelsToRun.length * strategiesToRun.length * samplesPerConfig;
  console.log(
    `Generating ${total} images (smoke=${isSmoke}) for archetype=${archetype}`
  );

  let done = 0;
  let failed = 0;

  for (const model of modelsToRun) {
    for (const strategy of strategiesToRun) {
      const prompt = buildPrompt(archetype, strategy);
      for (let i = 1; i <= samplesPerConfig; i++) {
        const sample = String(i).padStart(2, "0");
        const filename = `${archetype}-${model}-${strategy}-${sample}.png`;
        const outPath = resolve(OUTPUT_DIR, filename);

        try {
          process.stdout.write(
            `[${++done}/${total}] ${filename} ... `
          );
          const img = await generate(model, prompt, env);
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
```

- [ ] **Step 2: Run in smoke mode**

Clean up prior smoke-test files first, then run:

```bash
rm -f experiments/step0-ip-aesthetics/outputs/_smoke-*.png
npx tsx experiments/step0-ip-aesthetics/run.ts --smoke
```

Expected: one file `cat-flux-doodle-01.png` created; logs show `[1/1] cat-flux-doodle-01.png ... ok (...)`.

- [ ] **Step 3: Visually spot-check the smoke image**

Open `experiments/step0-ip-aesthetics/outputs/cat-flux-doodle-01.png`. Confirm it's an actual image (can be anything — we're just validating the pipeline here, not evaluating yet).

- [ ] **Step 4: Commit**

```bash
git add experiments/step0-ip-aesthetics/run.ts
git commit -m "feat(exp): add orchestrator with smoke mode for step 0"
```

---

### Task 7: Full run and evaluation

**Files:**
- Modify: `experiments/step0-ip-aesthetics/README.md` (fill Results section)
- Create (commit): 2-4 screenshot crops of passing images into `experiments/step0-ip-aesthetics/`

- [ ] **Step 1: Clean outputs folder**

```bash
rm -f experiments/step0-ip-aesthetics/outputs/*.png
```

(The `.gitkeep` stays.)

- [ ] **Step 2: Run the full experiment**

```bash
npx tsx experiments/step0-ip-aesthetics/run.ts
```

Expected: 24 PNGs in `outputs/`, most calls succeeding, log ends with `X succeeded, Y failed`.

If a batch fails (e.g., rate limit), re-run — successful outputs will be overwritten identically, failures retry. No retry logic is built in; that's intentional.

- [ ] **Step 3: Review in Finder**

Open the folder:

```bash
open experiments/step0-ip-aesthetics/outputs/
```

Switch to Gallery view (⌘4). Group mentally by the middle segments of the filename (model × strategy).

For each image, make a gut call: **"Would I use this as the IP representing me?"** — yes or no.

- [ ] **Step 4: Classify outcome per the spec's decision matrix**

- 🟢 **Green:** ≥ 3 passes clustered under a stable (model × strategy) combo
- 🟡 **Yellow:** 1-2 scattered passes
- 🔴 **Red:** 0 passes, or all AI slop

- [ ] **Step 5: Save screenshots of passing images (if any)**

For each passing image, make a copy into the experiment directory (not `outputs/`, which is gitignored):

```bash
# Example:
cp experiments/step0-ip-aesthetics/outputs/cat-flux-doodle-03.png \
   experiments/step0-ip-aesthetics/pass-01.png
```

This commits the visual evidence. 2-4 is enough. Skip if Red.

- [ ] **Step 6: Fill Results section of `README.md`**

Replace the `_To be filled in after running the experiment._` line with something like:

```markdown
## Results

**Date run:** YYYY-MM-DD
**Outcome:** 🟢 Green | 🟡 Yellow | 🔴 Red

**Summary:** <one sentence>

**Winning configuration (if Green):** `<model>` + `<strategy>` strategy. See `pass-01.png`, `pass-02.png`.

**Observed failure modes:**
- <specific aesthetic problem 1, e.g., "Gemini added background gradients despite 'no background' directive">
- <specific aesthetic problem 2>
- ...

**Next action:**
- 🟢 → design Step 1 (pose consistency). Optionally rerun with `stick-figure` archetype first (edit `archetype` in `run.ts`, rerun).
- 🟡 → add a 4th prompt strategy with a reference-image style anchor; rerun 12 images.
- 🔴 → stop. Trigger product pivot discussion.
```

- [ ] **Step 7: Commit results**

```bash
git add experiments/step0-ip-aesthetics/README.md experiments/step0-ip-aesthetics/pass-*.png 2>/dev/null || \
git add experiments/step0-ip-aesthetics/README.md
git commit -m "chore(exp): record step 0 results"
```

---

## Self-Review Notes

- **Spec coverage:** Every section of the spec maps to a task. Scope (24 images, 2×3×4) → Task 6. Prompt strategies → Task 3. Models → Tasks 4 & 5. Code structure → Tasks 1-6. Evaluation + decision gates → Task 7. Budget cap is naturally enforced by the hardcoded loop bounds. Prerequisites (API key setup) are covered in Task 1 README and Task 4/5 Step 2.
- **Placeholders:** None. All code is complete; Results section has an explicit "fill in" template.
- **Type consistency:** `Archetype`, `Strategy`, `Model` types are defined once and reused across `prompts.ts` and `run.ts`. Function names (`callGemini`, `callFlux`, `buildPrompt`, `loadEnv`, `requireKey`) are consistent wherever referenced.
- **Spec omissions handled inline:** Stick-figure secondary run is deferred to a manual `run.ts` edit per Task 7 Step 6 "Next action" rather than a separate task — keeps the plan focused on the primary experiment, matching the spec's "only if cat passes" wording.
