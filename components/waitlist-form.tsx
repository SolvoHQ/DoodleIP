"use client";

import { useState, useEffect, useCallback } from "react";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-[#00D28C] text-white",
    error: "bg-red-500 text-white",
    info: "bg-[#FF6B35] text-white",
  };

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl border-[2.5px] border-[#2D2D2D] shadow-[3px_3px_0_#2D2D2D] font-bold text-sm animate-toast ${colors[type]}`}>
      {message}
    </div>
  );
}

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "submitted">("idle");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const clearToast = useCallback(() => setToast(null), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitted") return;

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setStatus("idle");
        setToast({ message: "操作太频繁，请稍后再试", type: "error" });
      } else if (data.ok) {
        setStatus("submitted");
        setToast({
          message: data.duplicate ? "你已经在等待列表中了 👋" : "加入成功！上线后第一时间通知你 🎉",
          type: data.duplicate ? "info" : "success",
        });
      } else {
        setStatus("idle");
        setToast({ message: data.error || "出了点问题，请稍后再试", type: "error" });
      }
    } catch {
      setStatus("idle");
      setToast({ message: "网络错误，请稍后再试", type: "error" });
    }
  }

  const isLocked = status === "submitted";

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-[460px] w-full">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLocked}
          placeholder="输入你的邮箱"
          className={`flex-1 px-5 py-3.5 border-[2.5px] rounded-xl text-base shadow-[3px_3px_0_#2D2D2D] outline-none transition-all ${
            isLocked
              ? "border-[#00D28C] bg-[#f0fdf4] text-gray-500 cursor-not-allowed"
              : "border-[#2D2D2D] bg-white focus:shadow-[5px_5px_0_#FF6B35] focus:border-[#FF6B35]"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading" || isLocked}
          className={`px-7 py-3.5 border-[2.5px] border-[#2D2D2D] rounded-xl text-base font-bold shadow-[3px_3px_0_#2D2D2D] transition-all whitespace-nowrap ${
            isLocked
              ? "bg-[#00D28C] text-white cursor-default"
              : "bg-[#FF6B35] text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#2D2D2D] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_#2D2D2D] disabled:opacity-60"
          }`}
        >
          {status === "loading" ? "提交中..." : isLocked ? "✓ 已加入" : "加入等待列表"}
        </button>
      </form>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </>
  );
}
