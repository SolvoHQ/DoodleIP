"use client";
import { useState } from "react";
import type { ArchetypeKey } from "@/lib/archetypes";
import { InspirationStep } from "./_components/InspirationStep";
import { FeaturesStep } from "./_components/FeaturesStep";
import { PickStep } from "./_components/PickStep";
import { RevealStep } from "./_components/RevealStep";

type Step = "inspiration" | "features" | "pick" | "reveal";

export interface OnboardingState {
  step: Step;
  archetypeKey: ArchetypeKey | null;
  chipKeys: string[];
  description: string;
  verticalKey: string;
  creationPrompt: string;
  candidates: Array<{ tempKey: string; imagePath: string; signedUrl: string }>;
  chosenImagePath: string | null;
  name: string;
}

export default function OnboardingPage() {
  const [state, setState] = useState<OnboardingState>({
    step: "inspiration",
    archetypeKey: null,
    chipKeys: [],
    description: "",
    verticalKey: "general",
    creationPrompt: "",
    candidates: [],
    chosenImagePath: null,
    name: "",
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <StepBar current={state.step} />

      {state.step === "inspiration" && (
        <InspirationStep
          state={state}
          onNext={(archetypeKey) =>
            setState((s) => ({ ...s, archetypeKey, step: "features" }))
          }
        />
      )}

      {state.step === "features" && (
        <FeaturesStep
          state={state}
          onBack={() => setState((s) => ({ ...s, step: "inspiration" }))}
          onNext={(update) =>
            setState((s) => ({
              ...s,
              chipKeys: update.chipKeys,
              description: update.description,
              verticalKey: update.verticalKey,
              creationPrompt: update.creationPrompt,
              candidates: update.candidates,
              step: "pick",
            }))
          }
        />
      )}

      {state.step === "pick" && (
        <PickStep
          state={state}
          onBack={() => setState((s) => ({ ...s, step: "features" }))}
          onRegenerate={(update) =>
            setState((s) => ({
              ...s,
              candidates: update.candidates,
              creationPrompt: update.creationPrompt,
            }))
          }
          onChosen={(chosenImagePath) =>
            setState((s) => ({ ...s, chosenImagePath, step: "reveal" }))
          }
        />
      )}

      {state.step === "reveal" && (
        <RevealStep
          state={state}
          onNameChange={(name) => setState((s) => ({ ...s, name }))}
        />
      )}
    </div>
  );
}

function StepBar({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "inspiration", label: "1. 灵感" },
    { key: "features", label: "2. 细节" },
    { key: "pick", label: "3. 选定" },
    { key: "reveal", label: "4. 命名" },
  ];
  return (
    <div className="flex gap-2 mb-8 text-xs font-semibold">
      {steps.map(({ key, label }) => {
        const active = key === current;
        return (
          <div
            key={key}
            className={`flex-1 py-2 px-3 rounded text-center ${
              active ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
