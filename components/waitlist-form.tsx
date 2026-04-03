"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (status === "success") {
    return (
      <div className="text-lg font-bold text-[#00D28C]">
        已加入等待列表！🎉
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "出了点问题，请稍后再试");
      }
    } catch {
      setStatus("error");
      setErrorMsg("网络错误，请稍后再试");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-[460px] w-full">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="输入你的邮箱"
        className="flex-1 px-5 py-3.5 border-[2.5px] border-[#2D2D2D] rounded-xl text-base bg-white shadow-[3px_3px_0_#2D2D2D] outline-none focus:shadow-[5px_5px_0_#FF6B35] focus:border-[#FF6B35] transition-shadow"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-7 py-3.5 bg-[#FF6B35] text-white border-[2.5px] border-[#2D2D2D] rounded-xl text-base font-bold shadow-[3px_3px_0_#2D2D2D] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#2D2D2D] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_#2D2D2D] transition-all whitespace-nowrap disabled:opacity-60"
      >
        {status === "loading" ? "提交中..." : "加入等待列表"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-500 sm:col-span-2">{errorMsg}</p>
      )}
    </form>
  );
}
