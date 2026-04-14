"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingState } from "../page";

interface Props {
  state: OnboardingState;
  onNameChange: (name: string) => void;
}

interface PoseStatus {
  totalExpected: number;
  completed: number;
  poses: Array<{ key: string; signedUrl: string }>;
}

export function RevealStep({ state, onNameChange }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<PoseStatus>({
    totalExpected: 6,
    completed: 0,
    poses: [],
  });
  const [saving, setSaving] = useState(false);

  // Poll /api/ip/poses every 2 seconds until completed === totalExpected
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const res = await fetch("/api/ip/poses");
        if (!res.ok) return;
        const json: PoseStatus = await res.json();
        if (cancelled) return;
        setStatus(json);
        if (json.completed < json.totalExpected) {
          timer = setTimeout(tick, 2000);
        }
      } catch {
        // fall through — schedule retry
        if (!cancelled) timer = setTimeout(tick, 3000);
      }
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const ready = status.completed >= status.totalExpected;

  async function onStartCreating() {
    setSaving(true);
    // Update name only if user typed something (optional)
    if (state.name.trim()) {
      await fetch("/api/ip/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chosenImagePath: state.chosenImagePath,
          archetypeSeed: state.archetypeKey,
          creationPrompt: state.creationPrompt,
          name: state.name,
        }),
      });
    }
    router.push("/app/generate");
  }

  return (
    <section>
      <h1 className="text-3xl font-black mb-2">
        {ready ? "见见你的 IP！" : "正在训练你的专属 IP..."}
      </h1>
      <p className="text-gray-600 mb-6">
        {ready
          ? "你的 IP 已经准备好了。给 TA 起个名字，然后开始创作"
          : `已完成 ${status.completed} / ${status.totalExpected} 个姿势`}
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {Array.from({ length: status.totalExpected }).map((_, i) => {
          const pose = status.poses[i];
          return (
            <div
              key={i}
              className="aspect-square rounded-lg border-2 border-gray-200 bg-white flex items-center justify-center"
            >
              {pose ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pose.signedUrl}
                  alt={pose.key}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="animate-pulse text-gray-400 text-xs">生成中...</div>
              )}
            </div>
          );
        })}
      </div>

      <label className="block text-sm font-semibold mb-2">给 TA 起个名字（可选）</label>
      <input
        type="text"
        value={state.name}
        onChange={(e) => onNameChange(e.target.value)}
        maxLength={30}
        placeholder="小土豆"
        className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 bg-white mb-6"
      />

      <button
        onClick={onStartCreating}
        disabled={!ready || saving}
        className="w-full px-5 py-3 rounded-lg bg-[#FF6B35] text-white font-bold disabled:opacity-50 border-2 border-gray-900"
      >
        {saving ? "准备中..." : ready ? "开始创作 →" : "还在训练，稍候..."}
      </button>
    </section>
  );
}
