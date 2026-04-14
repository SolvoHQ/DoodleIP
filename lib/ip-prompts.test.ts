import { describe, expect, it } from "vitest";
import { buildIpPrompt } from "./ip-prompts";
import type { Archetype, FeatureChip, VerticalOption } from "./archetypes";

const fakeArchetype: Archetype = {
  key: "potato",
  label: "土豆人",
  subject: "a potato-shaped character",
  thumbPath: "/archetypes/potato.png",
};

const glassesChip: FeatureChip = {
  key: "glasses",
  label: "戴眼镜",
  descriptor: "wearing round black glasses",
};

const scarfChip: FeatureChip = {
  key: "scarf",
  label: "围围巾",
  descriptor: "wearing a simple striped scarf",
};

const abroadVertical: VerticalOption = {
  key: "abroad",
  label: "留学",
  hint: "The character reads as a young study-abroad student, approachable and curious.",
};

const generalVertical: VerticalOption = {
  key: "general",
  label: "通用",
  hint: "",
};

describe("buildIpPrompt", () => {
  it("includes archetype subject", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [],
      description: "",
      vertical: generalVertical,
    });
    expect(prompt).toContain("a potato-shaped character");
  });

  it("appends feature chip descriptors", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [glassesChip, scarfChip],
      description: "",
      vertical: generalVertical,
    });
    expect(prompt).toContain("wearing round black glasses");
    expect(prompt).toContain("wearing a simple striped scarf");
  });

  it("includes user free-text description when provided", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [],
      description: "with a big curious smile",
      vertical: generalVertical,
    });
    expect(prompt).toContain("with a big curious smile");
  });

  it("appends vertical hint when non-empty", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [],
      description: "",
      vertical: abroadVertical,
    });
    expect(prompt).toContain("study-abroad student");
  });

  it("omits vertical hint when empty", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [],
      description: "",
      vertical: generalVertical,
    });
    expect(prompt).not.toContain("study-abroad");
    expect(prompt).not.toContain("reads as");
  });

  it("always includes doodle style constraints", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [],
      description: "",
      vertical: generalVertical,
    });
    expect(prompt).toContain("single uneven black pen stroke");
    expect(prompt.toLowerCase()).toContain("no color");
    expect(prompt.toLowerCase()).toContain("no background");
  });
});
