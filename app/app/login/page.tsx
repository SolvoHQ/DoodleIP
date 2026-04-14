"use client";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = getBrowserSupabase();
    const origin = window.location.origin;
    const nextParam = new URLSearchParams(window.location.search).get("next") || "/app";

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${origin}/app/auth/callback?next=${encodeURIComponent(nextParam)}`,
      },
    });

    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#fbf7ef]">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black mb-2">DoodleIP</h1>
        <p className="text-gray-600 mb-8">登录 / 注册 — 邮箱 magic link，无需密码</p>

        {status === "sent" ? (
          <div className="p-6 rounded-lg border-2 border-[#00D28C] bg-white">
            <p className="font-bold mb-1">邮件已发送</p>
            <p className="text-sm text-gray-600">
              去 <strong>{email}</strong> 收件箱点登录链接。链接 1 小时内有效。
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-900 bg-white"
              disabled={status === "sending"}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full px-6 py-3 rounded-lg bg-[#FF6B35] text-white font-bold border-2 border-gray-900 hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "发送中..." : "发送登录链接"}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
