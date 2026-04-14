"use client";
import Image from "next/image";
import { ARCHETYPES, type ArchetypeKey } from "@/lib/archetypes";
import type { OnboardingState } from "../page";

interface Props {
  state: OnboardingState;
  onNext: (archetypeKey: ArchetypeKey) => void;
}

export function InspirationStep({ state, onNext }: Props) {
  return (
    <section>
      <h1 className="text-3xl font-black mb-2">先选一个最像你的 vibe</h1>
      <p className="text-gray-600 mb-6">
        这些是我们预备好的起点，之后还可以加细节、改描述
      </p>

      <div className="grid grid-cols-4 gap-3">
        {ARCHETYPES.map((a) => {
          const selected = state.archetypeKey === a.key;
          return (
            <button
              key={a.key}
              onClick={() => onNext(a.key)}
              className={`group rounded-lg border-2 p-2 bg-white hover:border-gray-900 transition ${
                selected ? "border-gray-900 shadow" : "border-gray-200"
              }`}
            >
              <div className="aspect-square relative">
                <Image
                  src={a.thumbPath}
                  alt={a.label}
                  fill
                  sizes="(max-width: 640px) 25vw, 150px"
                  className="object-contain"
                />
              </div>
              <div className="text-center text-xs font-medium mt-1">{a.label}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
