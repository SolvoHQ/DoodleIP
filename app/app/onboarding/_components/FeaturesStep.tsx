"use client";
import { useState } from "react";
import { FEATURE_CHIPS, VERTICALS } from "@/lib/archetypes";
import type { OnboardingState } from "../page";

interface Props {
  state: OnboardingState;
  onBack: () => void;
  onNext: (update: {
    chipKeys: string[];
    description: string;
    verticalKey: string;
    creationPrompt: string;
    candidates: OnboardingState["candidates"];
  }) => void;
}

export function FeaturesStep({ state, onBack, onNext }: Props) {
  const [chipKeys, setChipKeys] = useState<string[]>(state.chipKeys);
  const [description, setDescription] = useState<string>(state.description);
  const [verticalKey, setVerticalKey] = useState<string>(state.verticalKey);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleChip(key: string) {
    setChipKeys((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 3) return prev; // cap at 3
      return [...prev, key];
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/ip/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archetypeKey: state.archetypeKey,
          chipKeys,
          description,
          verticalKey,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);

      onNext({
        chipKeys,
        description,
        verticalKey,
        creationPrompt: json.prompt,
        candidates: json.candidates,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-black mb-2">加点专属你的小细节</h1>
      <p className="text-gray-600 mb-6">最多选 3 个特征 · 可选填几句描述</p>

      <form onSubmit={onSubmit}>
        <div className="flex flex-wrap gap-2 mb-6">
          {FEATURE_CHIPS.map((c) => {
            const active = chipKeys.includes(c.key);
            return (
              <button
                type="button"
                key={c.key}
                onClick={() => toggleChip(c.key)}
                className={`px-3 py-1.5 rounded-full border-2 text-sm ${
                  active
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-900 border-gray-300 hover:border-gray-900"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <label className="block text-sm font-semibold mb-2">
          你主要发什么内容？
        </label>
        <div className="flex flex-wrap gap-2 mb-6">
          {VERTICALS.map((v) => {
            const active = verticalKey === v.key;
            return (
              <button
                type="button"
                key={v.key}
                onClick={() => setVerticalKey(v.key)}
                className={`px-3 py-1.5 rounded-full border-2 text-sm ${
                  active
                    ? "bg-[#FF6B35] text-white border-gray-900"
                    : "bg-white text-gray-900 border-gray-300 hover:border-gray-900"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        <label className="block text-sm font-semibold mb-2">
          再描述两句（可选）
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          placeholder="例如：有点呆萌、总是在思考"
          className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 bg-white mb-8"
          rows={2}
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-lg border-2 border-gray-900 bg-white font-semibold"
            disabled={generating}
          >
            返回
          </button>
          <button
            type="submit"
            disabled={generating}
            className="flex-1 px-5 py-3 rounded-lg bg-gray-900 text-white font-bold disabled:opacity-50"
          >
            {generating ? "正在生成 4 个候选（10-15 秒）..." : "生成 4 个候选 →"}
          </button>
        </div>
      </form>
    </section>
  );
}
