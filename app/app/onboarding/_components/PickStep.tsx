"use client";
import { useState } from "react";
import type { OnboardingState } from "../page";

interface Props {
  state: OnboardingState;
  onBack: () => void;
  onRegenerate: (update: {
    candidates: OnboardingState["candidates"];
    creationPrompt: string;
  }) => void;
  onChosen: (chosenImagePath: string) => void;
}

export function PickStep({ state, onBack, onRegenerate, onChosen }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onRegenAll() {
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ip/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archetypeKey: state.archetypeKey,
          chipKeys: state.chipKeys,
          description: state.description,
          verticalKey: state.verticalKey,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      onRegenerate({ candidates: json.candidates, creationPrompt: json.prompt });
      setSelected(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRegenerating(false);
    }
  }

  async function onConfirm() {
    if (!selected) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch("/api/ip/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chosenImagePath: selected,
          archetypeSeed: state.archetypeKey,
          creationPrompt: state.creationPrompt,
          name: "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      onChosen(selected);
    } catch (err) {
      setError((err as Error).message);
      setConfirming(false);
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-black mb-2">挑一个你最喜欢的</h1>
      <p className="text-gray-600 mb-6">一旦选定就会成为你的专属 IP</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {state.candidates.map((c) => {
          const active = selected === c.imagePath;
          return (
            <button
              type="button"
              key={c.tempKey}
              onClick={() => setSelected(c.imagePath)}
              className={`rounded-xl border-2 p-2 bg-white transition ${
                active ? "border-gray-900 shadow-lg" : "border-gray-200 hover:border-gray-500"
              }`}
            >
              <div className="aspect-square relative">
                {/* Using plain img because these are short-lived signed URLs */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.signedUrl}
                  alt="candidate"
                  className="object-contain w-full h-full"
                />
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-lg border-2 border-gray-900 bg-white font-semibold"
          disabled={confirming || regenerating}
        >
          返回
        </button>
        <button
          type="button"
          onClick={onRegenAll}
          disabled={confirming || regenerating}
          className="px-5 py-3 rounded-lg border-2 border-gray-900 bg-white font-semibold disabled:opacity-50"
        >
          {regenerating ? "重新生成中..." : "都不喜欢 · 重来"}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!selected || confirming || regenerating}
          className="flex-1 px-5 py-3 rounded-lg bg-gray-900 text-white font-bold disabled:opacity-50"
        >
          {confirming ? "正在保存..." : "就选这个 →"}
        </button>
      </div>
    </section>
  );
}
