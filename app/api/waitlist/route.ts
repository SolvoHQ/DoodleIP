import { NextResponse } from "next/server";
import { supabaseServer as supabase } from "@/lib/supabase-server";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_REQUESTS;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "操作太频繁，请稍后再试" },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "请求格式错误" },
      { status: 400 }
    );
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "请输入有效的邮箱地址" },
      { status: 400 }
    );
  }

  if (email.length > 320) {
    return NextResponse.json(
      { ok: false, error: "邮箱地址过长" },
      { status: 400 }
    );
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // Insert new email
  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    // Handle race condition: unique constraint violation = duplicate
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json(
      { ok: false, error: "服务器错误，请稍后再试" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, duplicate: false });
}
