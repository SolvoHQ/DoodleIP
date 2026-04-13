# Step 0 — IP Aesthetic Feasibility Experiment

**Date:** 2026-04-13
**Status:** Approved
**Owner:** Weston

## Context and motivation

DoodleIP's product thesis (see `DESIGN.md`) depends on two load-bearing technical assumptions:

1. AI can generate a base IP character that a creator would actually want to use as their personal visual identity (not generic "AI slop").
2. Given such a character, AI can preserve it across 6-8 poses with enough consistency that viewers recognize it as the same character.

Assumption #1 precedes #2 — if we can't produce a base character that passes the "I'd use this as my IP" gut test, pose consistency is moot. Yet the product spec so far has only considered #2. This experiment validates #1 in isolation.

The experiment has zero user-facing deliverables. Its purpose is to produce a binary go/no-go answer on whether the hand-drawn doodle aesthetic is achievable via current generation APIs.

## Scope

**In scope:**
- Generate ~24 candidate cat characters via 2 models × 3 prompt strategies × 4 samples
- Evaluate outputs against a single criterion: "would I use this as my personal IP?"
- Document the winning combination (if any) and the failure modes observed

**Out of scope:**
- Pose variation / consistency testing (that is Step 1, gated on Step 0 success)
- Any UI, web app, deployment, database, or user-facing surface
- Multi-character style tests beyond a cat (stick-figure is an optional secondary run, only if cat passes)
- Blind testing with external evaluators (self-judgment is sufficient for a binary decision)
- Automatic scoring / grid stitching code (Finder's gallery view handles visual review)

## Aesthetic target

The style is **minimal hand-drawn doodle**. Reference anchors:
- 机器坏人 — stick-figure character with minimal features
- 猫未未 — simple cute hand-drawn cat IP
- Jean Jullien, 几米 — Western/Taiwanese minimalist line artists

**Defining characteristics:**
- Single black line (weight can vary slightly — "pen" feel, not uniform vector)
- No shading, no gradient, no color fill, no background
- Deliberately imperfect geometry (wobbly circles, asymmetric features)
- Expressive with minimal strokes (two dot eyes, one-line mouth)
- Reads as "a human spent a few minutes drawing this" — the opposite of over-rendered AI illustration

**Anti-patterns (failure signals in outputs):**
- Perfectly symmetric vector-clean lines
- Added shading, gradients, or texture
- Unrequested background elements
- Multiple line weights unified into a slick commercial look
- "3D sticker" aesthetic (the default drift of most image models)

## Experiment design

### Variables

**Archetype:** Single cat character. Stick-figure is a secondary run only if cat succeeds.

**Models (2):**

| Model | Access | Rationale |
|---|---|---|
| Gemini 2.5 Flash Image (nano-banana) | Google AI Studio API | Strong style adherence; known to handle minimalist prompts well |
| FLUX.1 [dev] | fal.ai | Good at line art; high prompt tunability |

Explicitly **not testing**: `gpt-image-1` (over-renders toward commercial illustration), Midjourney (no official API).

**Prompt strategies (3 levels, progressively more constrained):**

1. **Naive** — plain description, e.g., `"a simple cat character"`. Control/baseline; expected to fail.
2. **Artist-anchored** — references specific artists/styles, e.g., `"a cat character in the style of Jean Jullien and 几米, minimalist line drawing"`.
3. **Doodle-explicit** — heavy positive + negative anchoring, e.g., `"hand-drawn doodle of a cat, single uneven black pen stroke on white, two dot eyes, one-line smile, no shading, no color, no gradient, no background, children's book style, imperfect lines"`.

**Samples per configuration:** 4

**Total images:** 2 models × 3 strategies × 4 samples = **24 images** (primary cat run)

### Evaluation

Single criterion, judged by self: **"Would I use this as the IP representing me?"**

Each image gets a binary pass/fail. Then classify the run:

| Outcome | Definition | Action |
|---|---|---|
| 🟢 Green | ≥ 3 passes, clustered under a stable (model × strategy) combination | Declare winner; optionally run stick-figure secondary; proceed to design Step 1 |
| 🟡 Yellow | 1-2 passes, scattered across configurations (looks like luck) | Add a 4th prompt strategy (e.g., few-shot with reference image as style anchor); rerun 12 more images. If still yellow after second round, downgrade to red. |
| 🔴 Red | 0 passes, or all outputs are visibly AI slop | Stop. Document failure modes. Do not proceed to Step 1. Trigger product pivot decision. |

## Code structure

All experiment code lives in a new top-level directory, isolated from the landing page:

```
DoodleIP/
├── experiments/
│   └── step0-ip-aesthetics/
│       ├── README.md             # Experiment purpose, how to run, how to read results
│       ├── run.ts                # Main script: iterates configs, calls APIs, saves images
│       ├── prompts.ts            # The 3 prompt strategy templates
│       ├── providers.ts          # Wrappers for Gemini and fal.ai
│       ├── outputs/              # gitignored
│       └── .env.experiment       # gitignored: GEMINI_API_KEY, FAL_KEY
```

**Language:** TypeScript, executed via `tsx`. No Python toolchain.

**File naming:** `{archetype}-{model}-{strategy}-{sample}.png`
Example: `cat-gemini-artist-02.png`, `cat-flux-doodle-04.png`.
This naming causes Finder's gallery view to cluster images by configuration, making visual review trivial.

**Explicitly not building:**
- Web UI or preview server
- Automated grid-stitching of output images
- Scoring / evaluation code
- Database or persistence beyond local PNG files
- Retry logic for API failures (manual rerun is acceptable)

### Deliverables committed to git

1. The script and prompt source code (`run.ts`, `prompts.ts`, `providers.ts`)
2. 2-4 screenshots of images that passed evaluation (if any) — as visual evidence
3. A results section appended to `README.md` stating: outcome (green/yellow/red), winning configuration (if any), observed failure modes, next action

Raw output images in `outputs/` are **not** committed.

## Budget

| Item | Unit cost (estimate) | Count | Subtotal |
|---|---|---|---|
| Gemini 2.5 Flash Image | ~$0.04/image | 12 | $0.48 |
| FLUX.1 [dev] via fal.ai | ~$0.03/image | 12 | $0.36 |
| Baseline | | | **~$1** |
| Iteration buffer (prompt tuning, reruns) | 3× | | ~$3 |
| Optional stick-figure secondary run | | 24 | ~$1 |
| **Cap** | | | **< $5** |

## Timeline

~3-4 hours of focused work, one weekend afternoon:

| Step | Estimate |
|---|---|
| API key setup, scaffolding, install `tsx` | ~45 min |
| Write `prompts.ts`, `providers.ts`, `run.ts` | ~1 hr |
| First run + prompt iteration | ~1-2 hrs |
| Review outputs, classify outcome, write results in README | ~30 min |

## Prerequisites (before implementation)

1. Google AI Studio account, obtain Gemini API key
2. fal.ai account, prepay $10 (will be underused)
3. No other setup — repo already has Node and TypeScript

## What we do NOT do based on Step 0 results

Regardless of outcome:
- Do not extend the landing page with new features
- Do not integrate Stripe, accounts, storage, Cloudflare R2
- Do not build the carousel template engine
- Do not show Step 0 outputs externally or to waitlist users (internal validation only)

Green-light actions are limited to: designing and planning Step 1 (pose consistency). Any product surface beyond that waits for Step 1's own green light.

## Success criteria for this experiment

- A decisive outcome (green/yellow/red) is recorded in the experiment README within ~1 week of approval
- If green: the winning (model × prompt) combination is documented with enough detail to reproduce
- If red: the failure modes are documented with enough specificity to inform a product pivot decision
- No code from this experiment is merged into `app/` or the production landing page
