/**
 * The 8 archetypes used as the inspiration grid during onboarding.
 * Each one corresponds to a pre-generated thumbnail in /public/archetypes/
 * (see Task 9) and a subject description fed into the IP generation prompt.
 */

export type ArchetypeKey =
  | "potato"
  | "blob"
  | "monster"
  | "frog"
  | "ghost"
  | "stick"
  | "square"
  | "catblob";

export interface Archetype {
  key: ArchetypeKey;
  label: string;       // shown under the thumbnail
  subject: string;     // fed into the Gemini prompt
  thumbPath: string;   // public path
}

export const ARCHETYPES: readonly Archetype[] = [
  {
    key: "potato",
    label: "土豆人",
    subject: "a potato-shaped upright character with two tiny stub arms and short little legs, two dot eyes and a small mouth",
    thumbPath: "/archetypes/potato.png",
  },
  {
    key: "blob",
    label: "小饭团",
    subject: "a round rice-ball-shaped blob creature with no visible limbs, just a tiny face with two small dot eyes and a small smile",
    thumbPath: "/archetypes/blob.png",
  },
  {
    key: "monster",
    label: "独眼小怪",
    subject: "a small round fuzzy creature with one big central round eye, two tiny stub legs, no visible mouth",
    thumbPath: "/archetypes/monster.png",
  },
  {
    key: "frog",
    label: "胖青蛙",
    subject: "a chubby round frog sitting on the ground, wide simple mouth, and two round dot eyes on top of its head",
    thumbPath: "/archetypes/frog.png",
  },
  {
    key: "ghost",
    label: "小鬼",
    subject: "a small ghost with a rounded dome top and a wavy bottom edge, two round dot eyes, no mouth, floating",
    thumbPath: "/archetypes/ghost.png",
  },
  {
    key: "stick",
    label: "火柴人",
    subject: "a round-head stick figure with two dot eyes and a simple smile, thin stick arms and legs",
    thumbPath: "/archetypes/stick.png",
  },
  {
    key: "square",
    label: "方块先生",
    subject: "a character with a small round head, a square rectangular block torso, and thin stick arms and legs; two dot eyes and a one-line smile on the head",
    thumbPath: "/archetypes/square.png",
  },
  {
    key: "catblob",
    label: "圆脸猫",
    subject: "a round-faced cat character with two simple dot eyes, a small triangular nose, and a one-line smile, sitting upright",
    thumbPath: "/archetypes/catblob.png",
  },
];

export const ARCHETYPE_BY_KEY: Record<ArchetypeKey, Archetype> = Object.fromEntries(
  ARCHETYPES.map((a) => [a.key, a])
) as Record<ArchetypeKey, Archetype>;

/**
 * Feature chips — small additions users toggle to individualize their IP.
 * Keep this list to 10-12 options. Multi-select (users may pick 0-3).
 */
export interface FeatureChip {
  key: string;
  label: string;    // UI label
  descriptor: string; // appended to the prompt
}

export const FEATURE_CHIPS: readonly FeatureChip[] = [
  { key: "glasses",   label: "戴眼镜",   descriptor: "wearing round black glasses" },
  { key: "hat",       label: "戴帽子",   descriptor: "wearing a small baseball cap" },
  { key: "scarf",     label: "围围巾",   descriptor: "wearing a simple striped scarf" },
  { key: "headphones",label: "戴耳机",   descriptor: "wearing small headphones" },
  { key: "ponytail",  label: "扎马尾",   descriptor: "with a small ponytail on top of its head" },
  { key: "shorthair", label: "短发",     descriptor: "with a short tufted hair on top" },
  { key: "mustache",  label: "留胡子",   descriptor: "with a small simple mustache" },
  { key: "backpack",  label: "背背包",   descriptor: "carrying a tiny backpack on its back" },
  { key: "camera",    label: "挂相机",   descriptor: "with a small camera hanging from its neck" },
  { key: "bottle",    label: "拿水壶",   descriptor: "holding a small water bottle" },
];

/**
 * Light vertical hints — collected during onboarding, fed into IP prompt
 * as softer flavor context. Does NOT branch product flow in v1.
 */
export interface VerticalOption {
  key: string;
  label: string;
  hint: string; // appended to prompt
}

export const VERTICALS: readonly VerticalOption[] = [
  { key: "general",  label: "通用",     hint: "" },
  { key: "abroad",   label: "留学",     hint: "The character reads as a young study-abroad student, approachable and curious." },
  { key: "ai",       label: "AI / 知识",hint: "The character reads as a helpful knowledge-sharing friend, slightly nerdy in a warm way." },
  { key: "work",     label: "打工人",   hint: "The character reads as a mildly tired but relatable office worker type." },
  { key: "reading",  label: "读书",     hint: "The character reads as a thoughtful book-loving type." },
];
