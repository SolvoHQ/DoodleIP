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

_To be filled in after running the experiment._
