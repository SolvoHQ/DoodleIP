import type { Archetype, FeatureChip, VerticalOption } from "./archetypes";

export interface IpPromptInput {
  archetype: Archetype;
  chips: readonly FeatureChip[];
  description: string;     // optional free-text from user; empty string if not provided
  vertical: VerticalOption;
}

/**
 * Assembles the full Gemini prompt for generating IP candidates.
 * The structure is:
 *   Hand-drawn doodle of {archetype.subject}, {chip.descriptor}...,
 *   {description if any}. {vertical.hint if any}.
 *   + doodle-style constraints (single black pen stroke, no color, etc.)
 *
 * The doodle-style suffix is the one validated in Step 0 — do not edit
 * without re-validating aesthetic output quality.
 */
export function buildIpPrompt(input: IpPromptInput): string {
  const { archetype, chips, description, vertical } = input;

  const chipDescriptors = chips.map((c) => c.descriptor).join(", ");
  const descriptionClause = description.trim() ? description.trim() : "";
  const verticalClause = vertical.hint.trim();

  const subjectPieces = [archetype.subject];
  if (chipDescriptors) subjectPieces.push(chipDescriptors);
  if (descriptionClause) subjectPieces.push(descriptionClause);

  const subjectSentence = subjectPieces.join(", ") + ".";

  const styleBlock = (
    "single uneven black pen stroke on a plain white background. " +
    "Minimal strokes — only what's essential for the character to read. " +
    "Deliberately imperfect geometry — wobbly lines, asymmetric proportions. " +
    "No shading, no gradient, no color fill, no background objects, no texture. " +
    "Looks like a human sketched it in a notebook in under a minute. " +
    "Children's book doodle style."
  );

  const verticalBlock = verticalClause ? ` ${verticalClause}` : "";

  return `Hand-drawn doodle of ${subjectSentence} ${styleBlock}${verticalBlock}`;
}
