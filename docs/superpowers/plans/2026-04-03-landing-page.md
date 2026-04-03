# DoodleIP Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chinese-language landing page that collects waitlist emails for DoodleIP, targeting Xiaohongshu content creators.

**Architecture:** Next.js App Router with a single page (`app/page.tsx`) and one API route (`app/api/waitlist/route.ts`). Supabase for email storage. Tailwind CSS for styling with custom hand-drawn SVG decorations.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS 4, Supabase JS client, Vercel deployment

**Spec:** `docs/superpowers/specs/2026-04-03-landing-page-design.md`

---

## File Structure

```
app/
  layout.tsx          — Root layout, fonts, metadata
  page.tsx            — Landing page (all sections)
  globals.css         — Tailwind imports, custom styles, animations
  api/
    waitlist/
      route.ts        — POST handler: validate email, write to Supabase
components/
  waitlist-form.tsx   — Client component: email form with loading/success states
  hero.tsx            — Hero section with mockup cards
  compare.tsx         — Before/After comparison section
  steps.tsx           — How-it-works 3-step section
  footer.tsx          — Footer
lib/
  supabase.ts         — Supabase client singleton
public/
  doodles/            — SVG decoration assets (squiggles, stars, arrows)
```

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd /Users/weston/Desktop/DoodleIP
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

When prompted about overwriting existing files, say yes. This will create the full Next.js scaffold.

- [ ] **Step 2: Verify it runs**

Run:
```bash
npm run dev
```

Open http://localhost:3000 in browser. Expected: default Next.js page loads without errors.

- [ ] **Step 3: Clean up boilerplate**

Replace `app/page.tsx` with a minimal placeholder:

```tsx
export default function Home() {
  return <main>DoodleIP</main>;
}
```

Replace `app/globals.css` with:

```css
@import "tailwindcss";
```

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "DoodleIP — 不露脸，也能让别人记住你",
  description: "给内容创作者的专属 IP 生成器。AI 帮你创造独一无二的涂鸦角色。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSansSC.variable} font-sans`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verify clean state**

Run:
```bash
npm run dev
```

Open http://localhost:3000. Expected: blank page with "DoodleIP" text, no errors in console.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind"
```

---

### Task 2: Build Hero section

**Files:**
- Create: `components/hero.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create Hero component**

Create `components/hero.tsx`:

```tsx
export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center bg-[#FFF8F0]">
      {/* Gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,107,53,0.08),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0,210,140,0.08),transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Badge */}
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold text-white bg-[#FF6B35] border-[2.5px] border-[#2D2D2D] rounded-full shadow-[3px_3px_0_#2D2D2D] -rotate-2">
          DoodleIP
        </span>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
          不露脸，也能让
          <br />
          别人
          <span className="relative inline-block">
            记住你
            <span className="absolute bottom-0.5 -left-1 -right-1 h-3.5 bg-[#00D28C]/40 -rotate-1 rounded -z-10" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
          给内容创作者的专属 IP 生成器。AI 帮你创造一个独一无二的涂鸦角色，从此你的内容有脸、有辨识度、被人记住。
        </p>

        {/* Waitlist form placeholder — will be replaced by client component in Task 5 */}
        <div className="mb-12 text-gray-400">[waitlist form]</div>

        {/* Mockup cards */}
        <div className="flex gap-4 justify-center flex-wrap max-w-[700px]">
          {[
            { bg: "bg-[#FF6B35]", text: "text-white", rotate: "-rotate-3", label: "5个方法提升\n你的内容质量" },
            { bg: "bg-white", text: "text-[#2D2D2D]", rotate: "rotate-1", label: "方法一\n找到你的节奏" },
            { bg: "bg-[#00D28C]", text: "text-white", rotate: "-rotate-1", label: "方法二\n保持一致性" },
            { bg: "bg-[#FFD93D]", text: "text-[#2D2D2D]", rotate: "rotate-2", label: "关注我获取\n更多干货！" },
          ].map((card, i) => (
            <div
              key={i}
              className={`w-[140px] h-[187px] rounded-xl border-[2.5px] border-[#2D2D2D] shadow-[4px_4px_0_#2D2D2D] flex flex-col items-center justify-center p-4 text-center ${card.bg} ${card.text} ${card.rotate}`}
            >
              <div className="text-4xl mb-2">(=^.^=)</div>
              <div className="text-xs font-bold leading-snug whitespace-pre-line">
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire Hero into page**

Replace `app/page.tsx`:

```tsx
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}
```

- [ ] **Step 3: Verify**

Run `npm run dev`, open http://localhost:3000. Expected: Hero section renders with badge, headline with green highlight, subtitle, and 4 colorful mockup cards with slight rotations.

- [ ] **Step 4: Commit**

```bash
git add components/hero.tsx app/page.tsx
git commit -m "feat: add Hero section with mockup cards"
```

---

### Task 3: Build Before/After Comparison section

**Files:**
- Create: `components/compare.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create Compare component**

Create `components/compare.tsx`:

```tsx
export function Compare() {
  return (
    <section className="py-20 px-6 max-w-[900px] mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-black mb-3">
        有 IP 和没 IP，差别有多大？
      </h2>
      <p className="text-lg text-gray-400 mb-12">同样的内容，完全不同的辨识度</p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        {/* Before */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Before
          </span>
          <div className="aspect-[4/5] max-h-[280px] mx-auto w-full rounded-xl border-[2.5px] border-[#2D2D2D] bg-[#f0f0f0] shadow-[2px_2px_0_#ccc] flex flex-col items-center justify-center p-5 gap-2">
            <span className="text-sm text-gray-400 mb-3">纯文字截图</span>
            <div className="w-4/5 flex flex-col gap-1.5">
              <div className="h-1.5 bg-[#ddd] rounded-full w-full" />
              <div className="h-1.5 bg-[#ddd] rounded-full w-[65%]" />
              <div className="h-1.5 bg-[#ddd] rounded-full w-[80%]" />
              <div className="h-1.5 bg-[#ddd] rounded-full w-[50%]" />
            </div>
            <span className="text-xs text-gray-300 mt-4">刷过就忘</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-4xl text-[#FF6B35] md:rotate-0 rotate-90">→</div>

        {/* After */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold uppercase tracking-widest text-[#FF6B35]">
            After
          </span>
          <div className="aspect-[4/5] max-h-[280px] mx-auto w-full rounded-xl border-[2.5px] border-[#2D2D2D] bg-[#FFD93D] shadow-[4px_4px_0_#2D2D2D] flex flex-col items-center justify-center p-5">
            <div className="text-5xl mb-3">(=^.^=)</div>
            <div className="w-4/5 flex flex-col gap-1.5">
              <div className="h-1.5 bg-black/10 rounded-full w-full" />
              <div className="h-1.5 bg-black/10 rounded-full w-[65%]" />
              <div className="h-1.5 bg-black/10 rounded-full w-[80%]" />
            </div>
            <span className="text-xs font-bold mt-4">一眼认出是你</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to page**

Update `app/page.tsx`:

```tsx
import { Hero } from "@/components/hero";
import { Compare } from "@/components/compare";

export default function Home() {
  return (
    <main>
      <Hero />
      <Compare />
    </main>
  );
}
```

- [ ] **Step 3: Verify**

Run `npm run dev`. Expected: Before/After section appears below Hero with gray "boring" card on left, colorful card with character on right, arrow between them.

- [ ] **Step 4: Commit**

```bash
git add components/compare.tsx app/page.tsx
git commit -m "feat: add Before/After comparison section"
```

---

### Task 4: Build How-It-Works section

**Files:**
- Create: `components/steps.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create Steps component**

Create `components/steps.tsx`:

```tsx
const steps = [
  {
    number: 1,
    icon: "💬",
    title: "描述你的角色",
    desc: '"一只戴墨镜的猫"\n"圆脑袋火柴人围红围巾"\n用文字就够了',
  },
  {
    number: 2,
    icon: "✨",
    title: "AI 生成专属 IP",
    desc: "多个候选方案，\n选一个你最喜欢的，\n自动生成全套姿势",
  },
  {
    number: 3,
    icon: "📱",
    title: "一键生成轮播图",
    desc: "输入文字内容，\n自动排版成小红书轮播图，\n下载直接发",
  },
];

export function Steps() {
  return (
    <section className="py-20 px-6 bg-[radial-gradient(circle_at_80%_20%,rgba(255,217,61,0.15),transparent_50%),#FFF8F0]">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-3">
        三步拥有你的专属 IP
      </h2>
      <p className="text-lg text-gray-400 text-center mb-12">不会画画也没关系</p>

      <div className="flex gap-8 max-w-[900px] mx-auto justify-center flex-wrap">
        {steps.map((step) => (
          <div
            key={step.number}
            className="relative flex-1 min-w-[220px] max-w-[280px] bg-white border-[2.5px] border-[#2D2D2D] rounded-2xl p-8 pt-10 text-center shadow-[4px_4px_0_#2D2D2D]"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center font-black text-sm border-[2.5px] border-[#2D2D2D]">
              {step.number}
            </div>
            <div className="text-5xl mb-4">{step.icon}</div>
            <h3 className="text-lg font-black mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to page**

Update `app/page.tsx`:

```tsx
import { Hero } from "@/components/hero";
import { Compare } from "@/components/compare";
import { Steps } from "@/components/steps";

export default function Home() {
  return (
    <main>
      <Hero />
      <Compare />
      <Steps />
    </main>
  );
}
```

- [ ] **Step 3: Verify**

Run `npm run dev`. Expected: Three step cards appear in a row with numbered badges, icons, titles, and descriptions.

- [ ] **Step 4: Commit**

```bash
git add components/steps.tsx app/page.tsx
git commit -m "feat: add How-It-Works steps section"
```

---

### Task 5: Build Waitlist form and Bottom CTA

**Files:**
- Create: `components/waitlist-form.tsx`
- Create: `components/footer.tsx`
- Modify: `components/hero.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create WaitlistForm client component**

Create `components/waitlist-form.tsx`:

```tsx
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
```

- [ ] **Step 2: Create Footer component**

Create `components/footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-100">
      DoodleIP &copy; 2026
    </footer>
  );
}
```

- [ ] **Step 3: Update Hero to use WaitlistForm**

In `components/hero.tsx`, replace the waitlist placeholder:

Replace:
```tsx
        {/* Waitlist form placeholder — will be replaced by client component in Task 5 */}
        <div className="mb-12 text-gray-400">[waitlist form]</div>
```

With:
```tsx
        {/* Waitlist form */}
        <div className="mb-12">
          <WaitlistForm />
        </div>
```

Add the import at the top of `components/hero.tsx`:
```tsx
import { WaitlistForm } from "@/components/waitlist-form";
```

- [ ] **Step 4: Build full page with Bottom CTA**

Update `app/page.tsx`:

```tsx
import { Hero } from "@/components/hero";
import { Compare } from "@/components/compare";
import { Steps } from "@/components/steps";
import { WaitlistForm } from "@/components/waitlist-form";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Compare />
      <Steps />

      {/* Bottom CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-3">首批用户免费体验</h2>
        <p className="text-gray-500 mb-8 text-lg">
          留下邮箱，产品上线第一时间通知你
        </p>
        <div className="flex justify-center">
          <WaitlistForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
```

- [ ] **Step 5: Verify**

Run `npm run dev`. Expected: Both waitlist forms render (Hero and bottom CTA). Submitting shows loading state then error (API not built yet, that's expected).

- [ ] **Step 6: Commit**

```bash
git add components/waitlist-form.tsx components/footer.tsx components/hero.tsx app/page.tsx
git commit -m "feat: add WaitlistForm, Bottom CTA, and Footer"
```

---

### Task 6: Set up Supabase and build Waitlist API

**Files:**
- Create: `lib/supabase.ts`
- Create: `app/api/waitlist/route.ts`
- Modify: `.env.local` (create, not committed)

- [ ] **Step 1: Install Supabase client**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 2: Create Supabase table**

Go to your Supabase project dashboard. Run this SQL in the SQL editor:

```sql
CREATE TABLE waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

- [ ] **Step 3: Create `.env.local`**

Create `.env.local` at the project root (this file is gitignored by default):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these values from Supabase dashboard > Settings > API.

- [ ] **Step 4: Create Supabase client**

Create `lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

- [ ] **Step 5: Create API route**

Create `app/api/waitlist/route.ts`:

```ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const email = body.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "请输入有效的邮箱地址" }, { status: 400 });
  }

  const { error } = await supabase.from("waitlist").upsert(
    { email },
    { onConflict: "email", ignoreDuplicates: true }
  );

  if (error) {
    return NextResponse.json({ ok: false, error: "服务器错误，请稍后再试" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Verify end-to-end**

Run `npm run dev`. Go to http://localhost:3000. Enter an email and submit. Expected:
- Button shows "提交中..."
- Then form is replaced with "已加入等待列表！🎉"
- Check Supabase dashboard: the email appears in the `waitlist` table
- Submit the same email again: still shows success (upsert ignores duplicates)

- [ ] **Step 7: Commit**

```bash
git add lib/supabase.ts app/api/waitlist/route.ts
git commit -m "feat: add Supabase waitlist API endpoint"
```

---

### Task 7: Add doodle decorations and animations

**Files:**
- Modify: `app/globals.css`
- Modify: `components/hero.tsx`

- [ ] **Step 1: Add wiggle animation to globals.css**

Add to `app/globals.css`:

```css
@import "tailwindcss";

@keyframes wiggle {
  0%, 100% { transform: rotate(-5deg) scale(1); }
  50% { transform: rotate(5deg) scale(1.1); }
}

.animate-wiggle {
  animation: wiggle 3s ease-in-out infinite;
}
```

- [ ] **Step 2: Add doodle decorations to Hero**

In `components/hero.tsx`, add scattered decorative elements inside the section, before the `<div className="relative z-10">`:

```tsx
      {/* Doodle decorations */}
      <span className="absolute top-[10%] left-[8%] text-2xl opacity-50 animate-wiggle">~</span>
      <span className="absolute top-[15%] right-[12%] text-2xl opacity-50 animate-wiggle" style={{ animationDelay: "1s" }}>✦</span>
      <span className="absolute bottom-[20%] left-[15%] text-2xl opacity-50 animate-wiggle" style={{ animationDelay: "0.5s" }}>~</span>
      <span className="absolute bottom-[25%] right-[8%] text-2xl opacity-50 animate-wiggle" style={{ animationDelay: "1.5s" }}>✦</span>
```

- [ ] **Step 3: Verify**

Run `npm run dev`. Expected: Small doodle characters float and wiggle subtly around the Hero section.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css components/hero.tsx
git commit -m "feat: add doodle decorations and wiggle animation"
```

---

### Task 8: Mobile responsive polish

**Files:**
- Modify: `components/hero.tsx`
- Modify: `components/compare.tsx`

- [ ] **Step 1: Test mobile layout**

Run `npm run dev`. Open browser DevTools, toggle device toolbar, select iPhone 14 (390px width). Check each section:
- Hero: headline should wrap nicely, mockup cards should wrap to 2x2
- Compare: should stack vertically, arrow rotates 90deg
- Steps: cards should stack vertically
- Bottom CTA: form should stack vertically (input above button)

- [ ] **Step 2: Fix any issues**

The Tailwind classes already include responsive breakpoints (`md:`, `sm:`). Verify:
- `components/hero.tsx`: mockup cards use `flex-wrap` — should wrap on mobile
- `components/compare.tsx`: uses `grid-cols-1 md:grid-cols-[1fr_auto_1fr]` — stacks on mobile
- `components/waitlist-form.tsx`: uses `flex-col sm:flex-row` — stacks on mobile

If mockup cards are too wide on mobile, update their width in `components/hero.tsx`:

Replace:
```tsx
            className={`w-[140px] h-[187px]
```

With:
```tsx
            className={`w-[110px] h-[147px] sm:w-[140px] sm:h-[187px]
```

- [ ] **Step 3: Verify mobile layout**

Check all sections at 375px width. Expected: everything readable, no horizontal scroll, forms usable.

- [ ] **Step 4: Commit**

```bash
git add components/
git commit -m "fix: polish mobile responsive layout"
```

---

### Task 9: Build check and final verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 2: Run production preview**

```bash
npm run start
```

Open http://localhost:3000. Walk through the full page:
1. Hero loads with badge, headline, subtitle, form, mockup cards
2. Before/After comparison renders correctly
3. Three-step section renders correctly
4. Bottom CTA with second form renders correctly
5. Submit an email — succeeds
6. No console errors

- [ ] **Step 3: Commit any remaining fixes**

If any issues were found and fixed:

```bash
git add -A
git commit -m "fix: final build and verification fixes"
```

- [ ] **Step 4: Clean up mockup file**

Remove the HTML mockup file that was used during design:

```bash
rm mockup.html
git add mockup.html
git commit -m "chore: remove design mockup file"
```
