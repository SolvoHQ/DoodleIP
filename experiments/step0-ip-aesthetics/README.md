# Step 0 — IP Aesthetic Feasibility Experiment

See spec: `docs/superpowers/specs/2026-04-13-step0-ip-aesthetics-design.md`

## Goal

Answer a single binary question: can current image-generation APIs produce hand-drawn doodle IP characters that pass the "would I use this as my personal IP?" gut test?

**First-pass scope:** Gemini 2.5 Flash Image only (12 images). If results are yellow/red, FLUX.1 [dev] via fal.ai is added in a follow-up round.

## Prerequisites

1. Copy `.env.experiment.example` to `.env.experiment` and fill in:
   - `GEMINI_API_KEY` — from https://aistudio.google.com/app/apikey

## How to run

From repo root:

```bash
# Smoke run (1 image, ~$0.05) — verify API key and pipeline
npx tsx experiments/step0-ip-aesthetics/run.ts --smoke

# Full run (12 images, ~$0.50)
npx tsx experiments/step0-ip-aesthetics/run.ts
```

Outputs land in `outputs/` as `{archetype}-gemini-{strategy}-{sample}.png`.

Open that folder in Finder, switch to Gallery view, and scan.

## Evaluation

For each image, ask: **"Would I use this as the IP representing me?"**

Mark pass/fail. Then classify the overall run per the spec's decision matrix:

- 🟢 **Green** — ≥ 3 passes clustered under a stable strategy → Declare winner, proceed to Step 1
- 🟡 **Yellow** — 1-2 scattered passes → Add FLUX before further judgment
- 🔴 **Red** — 0 passes or all AI slop → Add FLUX before declaring hypothesis dead

## Results

**Date run:** 2026-04-13
**Model tested:** Gemini 2.5 Flash Image (`gemini-2.5-flash-image`)
**Outcome:** 🟢 **Green**

### Summary

The `doodle` strategy produced 4/4 images that pass the "would I use this as my IP" test — hand-drawn, minimal, no AI slop. `naive` and `artist` strategies failed (commercial cartoon / busy illustrated-book style). Clear winner identified on the first pass; FLUX not needed.

### Pass/fail by strategy

| Strategy | Pass | Fail | Notes |
|---|---|---|---|
| `naive`  | 0 / 4 | 4 / 4 | Commercial orange tabby cartoons with blue-sky or star/moon backgrounds — stereotypical AI illustration |
| `artist` | 0-1 / 4 | 3-4 / 4 | Hand-drawn linework present, but consistently contaminated with color (scarf stripes, watercolor splotches, green grass, yellow sun) and extra elements (birds, books, hot-air balloons). Not the pure doodle feel we want. |
| `doodle` | **4 / 4** | 0 / 4 | All four read as "a human sketched this in a notebook" — the target aesthetic |

### Winning configuration

- **Model:** `gemini-2.5-flash-image` (note: `-preview` suffix variant returns 404)
- **Strategy:** `doodle` — heavy positive + negative anchoring
- **Key effective keywords:** `single uneven black pen stroke`, `no color fill`, `no background`, `deliberately imperfect geometry`, `wobbly lines`, `children's book doodle style`

See visual evidence: `pass-01-face-closeup.png` through `pass-04-standing-tail.png`.

### Observed failure modes (lessons for prompt iteration)

- **`naive` baseline:** Gemini's default cat output is commercial children's-book illustration — thick outlines, color fills, ambient backgrounds. Consistent with the "AI slop" concern. Confirms bare prompts won't work for this product.
- **`artist` strategy:** Referencing Jean Jullien / 几米 moves output toward hand-drawn linework but Gemini keeps adding color accents and scene elements. The model treats "minimalist line drawing" as a color-splashed editorial illustration rather than a raw doodle. The artist-reference approach alone is insufficient.
- **Pattern:** The explicit negative constraints in `doodle` (`no color`, `no background`, `no shading`) do real work. Artist reference names alone are not enough to suppress Gemini's default toward commercial polish.

### Next action

🟢 **Green → design Step 1 (pose consistency).**

Step 1 will test whether the `doodle` strategy can produce a recognizable single character across 6+ poses, using image-to-image / reference-conditioned generation. Outstanding open questions for Step 1 design:

1. Does Gemini's image editing endpoint (`responseModalities: ["IMAGE"]` with an input image part) preserve character identity adequately? Or do we need FLUX Kontext / fal.ai for better reference-conditioned generation?
2. Should pose generation start from a single reference image picked from this round's pass set, or re-generate a fresh reference optimized for consistency?
3. How to evaluate "same character" when the style is intentionally wobbly — what recognition cues are load-bearing (silhouette shape, face features, proportions)?

Secondary follow-up (optional, low priority): rerun this experiment with `archetype = "stick-figure"` to confirm the doodle strategy generalizes beyond cats. Expected 1-hour / ~$0.50 effort.
