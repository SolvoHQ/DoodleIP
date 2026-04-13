export type Archetype =
  | "cat"
  | "stick-figure"
  | "blob-creature"
  | "stick-square"
  | "ghost-simple"
  | "one-eye-monster"
  | "potato-person"
  | "chubby-frog";

export const ROUND_2_ARCHETYPES: readonly Archetype[] = [
  "stick-figure",
  "blob-creature",
  "stick-square",
  "ghost-simple",
  "one-eye-monster",
  "potato-person",
  "chubby-frog",
];

export const STRATEGIES = [
  "naive",
  "artist",
  "doodle",
  "crayon",
  "watercolor",
  "accent",
] as const;
export type Strategy = (typeof STRATEGIES)[number];

export const COLOR_STRATEGIES: readonly Strategy[] = [
  "crayon",
  "watercolor",
  "accent",
];

export interface PromptConfig {
  archetype: Archetype;
  strategy: Strategy;
  prompt: string;
}

const BASE: Record<Archetype, { naive: string; subject: string }> = {
  cat: {
    naive: "a simple cat character",
    subject: "a cat with two simple dot eyes and a one-line smile",
  },
  "stick-figure": {
    naive: "a simple round-head stick figure character",
    subject:
      "a round-head stick figure with two dot eyes and a simple smile, thin stick arms and legs",
  },
  "blob-creature": {
    naive: "a round blob creature",
    subject:
      "a round rice-ball-shaped blob creature with no visible limbs, just a tiny face — two small dot eyes and a small smile",
  },
  "stick-square": {
    naive: "a stick figure with a rectangular body",
    subject:
      "a character with a small round head, a square rectangular torso, and thin stick arms and legs; two dot eyes and a one-line smile on the head",
  },
  "ghost-simple": {
    naive: "a cute ghost",
    subject:
      "a small ghost with a rounded dome top and a wavy bottom edge, two round dot eyes, no mouth, floating",
  },
  "one-eye-monster": {
    naive: "a one-eyed monster",
    subject:
      "a small round fuzzy creature with one big central round eye, two tiny stub legs, no visible mouth",
  },
  "potato-person": {
    naive: "a potato person",
    subject:
      "a potato-shaped upright character with two tiny stub arms on the sides and short little legs at the bottom; two dot eyes and a small mouth on the upper half",
  },
  "chubby-frog": {
    naive: "a chubby frog",
    subject:
      "a chubby round frog sitting on the ground, wide simple mouth, and two round dot eyes on top of its head",
  },
};

export function buildPrompt(archetype: Archetype, strategy: Strategy): string {
  const { naive, subject } = BASE[archetype];

  switch (strategy) {
    case "naive":
      return naive;
    case "artist":
      return (
        `${subject} in the style of minimalist line artists ` +
        `like Jean Jullien and Jimmy Liao (几米). ` +
        `Minimal line drawing, children's book illustration feel, hand-drawn.`
      );
    case "doodle":
      return (
        `Hand-drawn doodle of ${subject}. ` +
        `Single uneven black pen stroke on a plain white background. ` +
        `Minimal strokes — only what's essential for the character to read. ` +
        `Deliberately imperfect geometry — wobbly lines, asymmetric proportions. ` +
        `No shading, no gradient, no color fill, no background objects, no texture. ` +
        `Looks like a human sketched it in a notebook in under a minute. ` +
        `Children's book doodle style.`
      );
    case "crayon":
      return (
        `Hand-drawn doodle of ${subject}. ` +
        `Uneven black pen outline filled with soft crayon color — muted, chalky, coloring slightly outside the lines like a child did it. ` +
        `Use a restrained palette: 2-3 soft colors maximum (e.g., a pale ochre, a dusty pink, a muted sage). ` +
        `Plain white or cream paper background. ` +
        `Deliberately imperfect geometry — wobbly lines, asymmetric proportions. ` +
        `No digital gradient, no clean vector fill, no shadow. ` +
        `Children's book crayon illustration feel. ` +
        `Looks like a human drew and colored this on paper.`
      );
    case "watercolor":
      return (
        `Hand-drawn doodle of ${subject}. ` +
        `Loose black pen outline with light watercolor wash fills — uneven saturation, bleeding edges, pale pastel tones. ` +
        `Restrained palette, 2-3 soft colors with some white left uncovered. ` +
        `Textured watercolor-paper white background. ` +
        `Deliberately imperfect geometry — wobbly lines, asymmetric proportions. ` +
        `No digital effects, no gradient shading, no crisp vector edges. ` +
        `Children's picture-book watercolor feel. ` +
        `Looks like a human painted this on paper.`
      );
    case "accent":
      return (
        `Hand-drawn doodle of ${subject}. ` +
        `Single uneven black pen stroke on a plain white background. ` +
        `Add exactly ONE small accent of color — e.g., rosy cheeks, a tiny scarf, a small hat, or a single colored dot. ` +
        `Everything else is pure black line on white. ` +
        `Deliberately imperfect geometry — wobbly lines. ` +
        `No shading, no gradient, no background elements, no multi-color fills. ` +
        `Children's book doodle style with one colored highlight.`
      );
    default: {
      const _exhaustive: never = strategy;
      throw new Error(`Unknown strategy: ${String(_exhaustive)}`);
    }
  }
}
