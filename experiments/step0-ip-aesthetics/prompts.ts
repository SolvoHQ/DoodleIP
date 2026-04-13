export type Archetype = "cat" | "stick-figure";

export const STRATEGIES = ["naive", "artist", "doodle"] as const;
export type Strategy = (typeof STRATEGIES)[number];

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

  switch (strategy) {
    case "naive":
      return naive;
    case "artist":
      return (
        `A ${subject} character in the style of minimalist line artists ` +
        `like Jean Jullien and Jimmy Liao (几米). ` +
        `Minimal line drawing, children's book illustration feel, hand-drawn.`
      );
    case "doodle":
      return (
        `Hand-drawn doodle of a ${subject}. ` +
        `Single uneven black pen stroke on a plain white background. ` +
        `Two simple dot eyes, one-line smile, minimal features. ` +
        `Deliberately imperfect geometry — wobbly lines, asymmetric proportions. ` +
        `No shading, no gradient, no color fill, no background objects, no texture. ` +
        `Looks like a human sketched it in a notebook in under a minute. ` +
        `Children's book doodle style.`
      );
    default: {
      const _exhaustive: never = strategy;
      throw new Error(`Unknown strategy: ${String(_exhaustive)}`);
    }
  }
}
