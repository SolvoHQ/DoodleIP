# DoodleIP v1 · Phase A — Foundation + Onboarding · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation layer (auth, schema, storage) plus the complete onboarding flow so a first-time user can log in with email, create their custom IP through a 4-step wizard (inspiration → features → candidates → name), and see their pose library as an onboarding reward.

**Architecture:** Next.js 16 App Router. Supabase for Auth (magic link), Postgres (RLS-protected tables for `ips` / `posts` / `page_regenerations`), and Storage (private buckets for images). Server-side Gemini calls for IP candidate and pose library generation. Client-side state machine for the 4-step onboarding wizard. All code extends the existing landing-page repo — no new project.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, TypeScript, `@supabase/supabase-js`, `@supabase/ssr`, Gemini 2.5 Flash Image REST API, `vitest` for pure-logic tests.

**Spec:** `docs/superpowers/specs/2026-04-13-doodleip-v1-mvp-design.md`

**Phase B** (daily generate + output) lives in a separate plan written after Phase A ships.

---

## Scope of Phase A

**In:** Environment setup, dependencies, database schema + RLS, storage buckets, auth middleware, `/app/login` + callback, empty authenticated `/app` shell, pre-generated archetype thumbnails, Gemini/IP libraries, IP-creation API routes (`/api/ip/*`), onboarding UI (4 steps with state machine), pose library reveal.

**Out (deferred to Phase B):** `/api/carousel/*` routes, daily generate UI (`/app/generate`), Canvas text compositor, per-page regeneration UI, ZIP download, history UI.

**End-state verification (manual):** A new visitor can go to `/app`, enter email, click magic link, run the full onboarding wizard, and land on `/app/generate` with their IP stored in DB and visible in Supabase Storage.

---

## Testing Approach

This plan uses **targeted unit tests** only for pure-logic modules:
- `lib/ip-prompts.ts` (prompt builder) — unit test via `vitest`
- Other modules verified **manually in the browser** during development

Not written in Phase A (deferred):
- UI component tests (Next.js UI testing is painful; manual verification via dev server is sufficient at MVP scale)
- API route integration tests (would require mocking Supabase + Gemini; deferred)
- E2E tests (deferred to post-MVP)

Each task that writes logic includes a manual verification step.

---

## File Structure

**New files created in this plan:**

```
.env.local.example                                (new)
middleware.ts                                      (new — auth gate)
app/app/layout.tsx                                 (new)
app/app/page.tsx                                   (new — dispatcher)
app/app/login/page.tsx                             (new)
app/app/auth/callback/route.ts                    (new)
app/app/onboarding/page.tsx                       (new)
app/app/onboarding/_components/InspirationStep.tsx (new)
app/app/onboarding/_components/FeaturesStep.tsx   (new)
app/app/onboarding/_components/PickStep.tsx       (new)
app/app/onboarding/_components/RevealStep.tsx     (new)
app/api/ip/create/route.ts                        (new)
app/api/ip/confirm/route.ts                       (new)
app/api/ip/poses/route.ts                         (new)
lib/gemini.ts                                      (new — adapted from experiments/)
lib/ip-prompts.ts                                  (new)
lib/ip-prompts.test.ts                             (new)
lib/ip.ts                                          (new — orchestration)
lib/supabase-browser.ts                            (new — client-side, anon key, SSR-aware)
lib/archetypes.ts                                  (new — 8 archetype metadata + chip list)
public/archetypes/potato.png                      (new — pre-generated thumbnails)
public/archetypes/blob.png
public/archetypes/monster.png
public/archetypes/frog.png
public/archetypes/ghost.png
public/archetypes/stick.png
public/archetypes/square.png
public/archetypes/catblob.png
supabase/migrations/20260413000000_v1_mvp_schema.sql
supabase/migrations/20260413000001_v1_mvp_storage.sql
vitest.config.ts                                   (new)
```

**Existing files modified:**

```
.gitignore                           (append entries)
package.json                         (add deps)
lib/supabase.ts                      (rename → lib/supabase-server.ts; keep behavior)
app/api/waitlist/route.ts            (update import path)
```

---

## Pre-flight (do before Task 1)

You will need:

1. **Anthropic API key** — sign up at https://console.anthropic.com, create a key. (Used in Phase B, not Phase A, but grab now.)
2. **Supabase project** — already exists (the waitlist uses it). Get the project's Service Role key from Dashboard → Settings → API.
3. **Gemini API key** — already in `experiments/step0-ip-aesthetics/.env.experiment`. Same key can be reused.

These three keys will be added to a new `.env.local` file in Task 1.

**Branch setup:**
```bash
cd /Users/weston/Desktop/DoodleIP
git checkout main
git pull origin main || true
git checkout -b feat/v1-phase-a-foundation-onboarding
```

All Phase A tasks commit to this branch. The final task merges to `main`.

---

### Task 1: Environment, gitignore, dependencies

**Files:**
- Create: `.env.local.example`
- Modify: `.gitignore`
- Modify: `package.json` (via `npm install`)

- [ ] **Step 1: Create `.env.local.example` in repo root**

```bash
# Public (client-exposed) — already in use for landing page
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-side secrets
SUPABASE_SERVICE_ROLE_KEY=

# Image generation
GEMINI_API_KEY=

# LLM (used in Phase B, include now)
ANTHROPIC_API_KEY=
```

- [ ] **Step 2: Copy to a real `.env.local` and fill in values**

```bash
cp .env.local.example .env.local
# Then edit .env.local and paste the 5 real keys
```

(`.env.local` is already gitignored by the root `.gitignore` — the `.env*` rule covers it. The `.env.local.example` file is NOT ignored — it must be committed.)

- [ ] **Step 3: Verify `.env.local` is ignored but `.env.local.example` is tracked**

```bash
git check-ignore .env.local && echo "local: correctly ignored"
git check-ignore .env.local.example || echo "example: correctly tracked"
```

Expected: `local: correctly ignored` on the first line, `example: correctly tracked` on the second.

- [ ] **Step 4: Install dependencies**

```bash
npm install @supabase/ssr
npm install --save-dev vitest @vitest/ui
```

Wait for completion. Verify `package.json` has `@supabase/ssr` in `dependencies` and `vitest` + `@vitest/ui` in `devDependencies`.

- [ ] **Step 5: Commit**

```bash
git add .env.local.example .gitignore package.json package-lock.json
git commit -m "chore: env template + ssr/vitest deps for v1 phase a"
```

---

### Task 2: Database schema migration

**Files:**
- Create: `supabase/migrations/20260413000000_v1_mvp_schema.sql`

- [ ] **Step 1: Ensure `supabase/migrations/` directory exists**

```bash
mkdir -p supabase/migrations
```

- [ ] **Step 2: Write the schema migration**

Create `supabase/migrations/20260413000000_v1_mvp_schema.sql`:

```sql
-- DoodleIP v1 MVP — core schema
-- Adds ips, posts, page_regenerations. Waitlist table is untouched.

-- IPs: one per user
create table if not exists public.ips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  name text,
  archetype_seed text not null,
  creation_prompt text not null,
  reference_image_path text not null,
  pose_library jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Posts: many per user
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_text text not null,
  plan jsonb not null,
  page_image_paths jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Per-page regeneration audit log
create table if not exists public.page_regenerations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  page_index int not null,
  new_image_path text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists ips_user_id_idx on public.ips(user_id);
create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists page_regen_post_id_idx on public.page_regenerations(post_id);

-- Row-Level Security
alter table public.ips enable row level security;
alter table public.posts enable row level security;
alter table public.page_regenerations enable row level security;

-- RLS policies: users can only read/write their own rows
create policy ips_owner_all on public.ips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy posts_owner_all on public.posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy page_regen_owner_all on public.page_regenerations
  for all using (
    exists (
      select 1 from public.posts p
      where p.id = page_regenerations.post_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.posts p
      where p.id = page_regenerations.post_id and p.user_id = auth.uid()
    )
  );

-- Updated-at trigger for ips
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger ips_set_updated_at
  before update on public.ips
  for each row execute function public.set_updated_at();
```

- [ ] **Step 3: Apply the migration via Supabase CLI**

If `supabase` CLI isn't installed:
```bash
brew install supabase/tap/supabase
```

Link to your project (one-time):
```bash
supabase link --project-ref $(grep NEXT_PUBLIC_SUPABASE_URL .env.local | sed 's|.*https://||;s|\.supabase\.co||')
# Or run interactively:
# supabase link
```

Push the migration:
```bash
supabase db push
```

Expected: "Applying migration 20260413000000_v1_mvp_schema.sql..." success.

**If you don't want to install the Supabase CLI**, paste the SQL directly into the Supabase Dashboard → SQL Editor → Run.

- [ ] **Step 4: Manually verify in Supabase Dashboard**

Open Supabase Dashboard → Table Editor. Confirm three new tables exist: `ips`, `posts`, `page_regenerations`. Confirm each has RLS enabled (small lock icon).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260413000000_v1_mvp_schema.sql
git commit -m "feat(db): v1 mvp schema — ips, posts, page_regenerations with RLS"
```

---

### Task 3: Storage buckets migration

**Files:**
- Create: `supabase/migrations/20260413000001_v1_mvp_storage.sql`

- [ ] **Step 1: Write the storage migration**

Create `supabase/migrations/20260413000001_v1_mvp_storage.sql`:

```sql
-- DoodleIP v1 MVP — storage buckets
-- Three private buckets, owner-scoped access via the first path segment.

insert into storage.buckets (id, name, public)
values
  ('ip-references', 'ip-references', false),
  ('ip-poses', 'ip-poses', false),
  ('post-scenes', 'post-scenes', false)
on conflict (id) do nothing;

-- Policy: a user can read and write objects under their own user_id folder
-- Path convention: {bucket}/{user_id}/... for ip-references and ip-poses
-- For post-scenes the path is {post_id}/... so we join via posts table

-- ip-references + ip-poses: first path segment = user_id
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and policyname = 'ip_refs_owner'
  ) then
    create policy ip_refs_owner on storage.objects
      for all using (
        bucket_id = 'ip-references'
        and (storage.foldername(name))[1] = auth.uid()::text
      ) with check (
        bucket_id = 'ip-references'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and policyname = 'ip_poses_owner'
  ) then
    create policy ip_poses_owner on storage.objects
      for all using (
        bucket_id = 'ip-poses'
        and (storage.foldername(name))[1] = auth.uid()::text
      ) with check (
        bucket_id = 'ip-poses'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and policyname = 'post_scenes_owner'
  ) then
    create policy post_scenes_owner on storage.objects
      for all using (
        bucket_id = 'post-scenes'
        and exists (
          select 1 from public.posts p
          where p.id::text = (storage.foldername(name))[1]
            and p.user_id = auth.uid()
        )
      ) with check (
        bucket_id = 'post-scenes'
        and exists (
          select 1 from public.posts p
          where p.id::text = (storage.foldername(name))[1]
            and p.user_id = auth.uid()
        )
      );
  end if;
end $$;
```

- [ ] **Step 2: Apply**

```bash
supabase db push
```

(Or paste in Dashboard → SQL Editor.)

- [ ] **Step 3: Manually verify in Supabase Dashboard**

Dashboard → Storage. Confirm three buckets exist: `ip-references`, `ip-poses`, `post-scenes`. Each should be marked as "Private" (not public).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260413000001_v1_mvp_storage.sql
git commit -m "feat(storage): v1 mvp private buckets with owner-scoped RLS"
```

---

### Task 4: Rename existing Supabase client, add browser client

**Files:**
- Rename: `lib/supabase.ts` → `lib/supabase-server.ts`
- Create: `lib/supabase-browser.ts`
- Modify: `app/api/waitlist/route.ts`

- [ ] **Step 1: Rename and update content of existing server client**

```bash
git mv lib/supabase.ts lib/supabase-server.ts
```

Overwrite `lib/supabase-server.ts` with:

```typescript
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the Service Role key.
 * Bypasses RLS — only use in server routes for admin operations
 * (upload files on behalf of a user after verifying their session,
 * insert records that reference auth.users, etc).
 * NEVER import from a client component or expose to the browser.
 */
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```

- [ ] **Step 2: Update the existing waitlist route to use the new name**

Open `app/api/waitlist/route.ts`. Change the import from:

```typescript
import { supabase } from "@/lib/supabase";
```

to:

```typescript
import { supabaseServer as supabase } from "@/lib/supabase-server";
```

Keep all other code in that file unchanged.

- [ ] **Step 3: Create the browser (SSR-aware) client**

Create `lib/supabase-browser.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client for use in React client components.
 * Respects RLS — users can only access their own rows.
 */
export function getBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 4: Verify waitlist still compiles**

```bash
npx tsc --noEmit
```

Expected: no errors involving `app/api/waitlist/route.ts`. If other pre-existing errors appear, ignore them for this task (they're not what we changed).

- [ ] **Step 5: Commit**

```bash
git add lib/supabase-server.ts lib/supabase-browser.ts app/api/waitlist/route.ts
git commit -m "refactor(supabase): split clients into server (service role) and browser (anon)"
```

---

### Task 5: Auth middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Write middleware**

Create `middleware.ts` in the repo root:

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Auth gate for /app/* routes. Unauthenticated users are redirected to /app/login.
 * The /app/login and /app/auth/callback paths are exempt.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAppRoute = pathname.startsWith("/app");
  const isPublicAppRoute =
    pathname === "/app/login" || pathname.startsWith("/app/auth/");

  if (!isAppRoute || isPublicAppRoute) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/app/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/app/:path*"],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): middleware gates /app/* behind supabase session"
```

(No verification until Task 6 adds the login page. Middleware alone would infinite-redirect if `/app/login` didn't exist.)

---

### Task 6: Login page and auth callback

**Files:**
- Create: `app/app/login/page.tsx`
- Create: `app/app/auth/callback/route.ts`

- [ ] **Step 1: Create the login page**

Create `app/app/login/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Create the auth callback route**

Create `app/app/auth/callback/route.ts`:

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/app";

  if (!code) {
    return NextResponse.redirect(new URL("/app/login?error=missing_code", req.url));
  }

  const res = NextResponse.redirect(new URL(next, req.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/app/login?error=${encodeURIComponent(error.message)}`, req.url)
    );
  }

  return res;
}
```

- [ ] **Step 3: Configure the Supabase project to allow this callback URL**

In the Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000` (for local dev) — add `https://doodleip.vercel.app` later for prod
- Redirect URLs: add `http://localhost:3000/app/auth/callback` and `https://doodleip.vercel.app/app/auth/callback`

- [ ] **Step 4: Manually verify the login flow**

Start dev server: `npm run dev`. Open `http://localhost:3000/app`. Expected:
1. Immediately redirected to `/app/login?next=/app` (by middleware)
2. Enter your email, click "发送登录链接"
3. Expected: "邮件已发送" confirmation appears
4. Check inbox, click the magic link
5. Expected: redirected to `/app` (which will 404 until Task 7 creates that page — that's fine; the *auth* is what we're verifying)

If step 5 shows the 404 page at `/app`, auth succeeded. If it redirects back to `/app/login`, auth failed — check Supabase Dashboard → Authentication → Users to see if the user row was created.

- [ ] **Step 5: Commit**

```bash
git add app/app/login/page.tsx app/app/auth/callback/route.ts
git commit -m "feat(auth): magic link login page + auth callback handler"
```

---

### Task 7: Empty `/app` shell with dispatcher

**Files:**
- Create: `app/app/layout.tsx`
- Create: `app/app/page.tsx`

- [ ] **Step 1: Create `/app` layout**

Create `app/app/layout.tsx`:

```tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fbf7ef]">
      <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <a href="/app" className="text-xl font-black">DoodleIP</a>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create `/app` page — the dispatcher**

Create `app/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function AppIndexPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Server components can't set cookies here; middleware handles refresh.
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/app/login");
  }

  const { data: ip } = await supabase.from("ips").select("id").eq("user_id", user.id).maybeSingle();

  if (!ip) {
    redirect("/app/onboarding");
  }

  redirect("/app/generate");
}
```

- [ ] **Step 3: Create a placeholder `/app/generate` page so the redirect has a target**

Create `app/app/generate/page.tsx`:

```tsx
export default function GeneratePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-black mb-4">日常生成（Phase B 占位）</h1>
      <p className="text-gray-600">Phase B 会把这里做成粘贴文字 → 轮播图的界面。</p>
    </div>
  );
}
```

- [ ] **Step 4: Create a placeholder `/app/onboarding` page for the same reason**

Create `app/app/onboarding/page.tsx`:

```tsx
export default function OnboardingPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-black mb-4">Onboarding（稍后 Task 16 做真实界面）</h1>
      <p className="text-gray-600">这里会被 Task 16-21 的步骤覆盖。</p>
    </div>
  );
}
```

- [ ] **Step 5: Manually verify**

With `npm run dev` running, visit `http://localhost:3000/app`:
- Logged-in user with no IP → should land on `/app/onboarding` placeholder
- Logged-in user with an IP (none yet at this point, so everyone's new) → would land on `/app/generate` placeholder

If you've completed the Task 6 login flow, you should see the onboarding placeholder.

- [ ] **Step 6: Commit**

```bash
git add app/app/layout.tsx app/app/page.tsx app/app/generate/page.tsx app/app/onboarding/page.tsx
git commit -m "feat(app): authenticated shell + onboarding/generate dispatcher"
```

---

### Task 8: Archetype metadata and chip list

**Files:**
- Create: `lib/archetypes.ts`

- [ ] **Step 1: Write the archetype + chip metadata**

Create `lib/archetypes.ts`:

```typescript
/**
 * The 8 archetypes used as the inspiration grid during onboarding.
 * Each one corresponds to a pre-generated thumbnail in /public/archetypes/
 * (see Task 9) and a subject description fed into the IP generation prompt.
 */

export type ArchetypeKey =
  | "potato"
  | "blob"
  | "monster"
  | "frog"
  | "ghost"
  | "stick"
  | "square"
  | "catblob";

export interface Archetype {
  key: ArchetypeKey;
  label: string;       // shown under the thumbnail
  subject: string;     // fed into the Gemini prompt
  thumbPath: string;   // public path
}

export const ARCHETYPES: readonly Archetype[] = [
  {
    key: "potato",
    label: "土豆人",
    subject: "a potato-shaped upright character with two tiny stub arms and short little legs, two dot eyes and a small mouth",
    thumbPath: "/archetypes/potato.png",
  },
  {
    key: "blob",
    label: "小饭团",
    subject: "a round rice-ball-shaped blob creature with no visible limbs, just a tiny face with two small dot eyes and a small smile",
    thumbPath: "/archetypes/blob.png",
  },
  {
    key: "monster",
    label: "独眼小怪",
    subject: "a small round fuzzy creature with one big central round eye, two tiny stub legs, no visible mouth",
    thumbPath: "/archetypes/monster.png",
  },
  {
    key: "frog",
    label: "胖青蛙",
    subject: "a chubby round frog sitting on the ground, wide simple mouth, and two round dot eyes on top of its head",
    thumbPath: "/archetypes/frog.png",
  },
  {
    key: "ghost",
    label: "小鬼",
    subject: "a small ghost with a rounded dome top and a wavy bottom edge, two round dot eyes, no mouth, floating",
    thumbPath: "/archetypes/ghost.png",
  },
  {
    key: "stick",
    label: "火柴人",
    subject: "a round-head stick figure with two dot eyes and a simple smile, thin stick arms and legs",
    thumbPath: "/archetypes/stick.png",
  },
  {
    key: "square",
    label: "方块先生",
    subject: "a character with a small round head, a square rectangular block torso, and thin stick arms and legs; two dot eyes and a one-line smile on the head",
    thumbPath: "/archetypes/square.png",
  },
  {
    key: "catblob",
    label: "圆脸猫",
    subject: "a round-faced cat character with two simple dot eyes, a small triangular nose, and a one-line smile, sitting upright",
    thumbPath: "/archetypes/catblob.png",
  },
];

export const ARCHETYPE_BY_KEY: Record<ArchetypeKey, Archetype> = Object.fromEntries(
  ARCHETYPES.map((a) => [a.key, a])
) as Record<ArchetypeKey, Archetype>;

/**
 * Feature chips — small additions users toggle to individualize their IP.
 * Keep this list to 10-12 options. Multi-select (users may pick 0-3).
 */
export interface FeatureChip {
  key: string;
  label: string;    // UI label
  descriptor: string; // appended to the prompt
}

export const FEATURE_CHIPS: readonly FeatureChip[] = [
  { key: "glasses",   label: "戴眼镜",   descriptor: "wearing round black glasses" },
  { key: "hat",       label: "戴帽子",   descriptor: "wearing a small baseball cap" },
  { key: "scarf",     label: "围围巾",   descriptor: "wearing a simple striped scarf" },
  { key: "headphones",label: "戴耳机",   descriptor: "wearing small headphones" },
  { key: "ponytail",  label: "扎马尾",   descriptor: "with a small ponytail on top of its head" },
  { key: "shorthair", label: "短发",     descriptor: "with a short tufted hair on top" },
  { key: "mustache",  label: "留胡子",   descriptor: "with a small simple mustache" },
  { key: "backpack",  label: "背背包",   descriptor: "carrying a tiny backpack on its back" },
  { key: "camera",    label: "挂相机",   descriptor: "with a small camera hanging from its neck" },
  { key: "bottle",    label: "拿水壶",   descriptor: "holding a small water bottle" },
];

/**
 * Light vertical hints — collected during onboarding, fed into IP prompt
 * as softer flavor context. Does NOT branch product flow in v1.
 */
export interface VerticalOption {
  key: string;
  label: string;
  hint: string; // appended to prompt
}

export const VERTICALS: readonly VerticalOption[] = [
  { key: "general",  label: "通用",     hint: "" },
  { key: "abroad",   label: "留学",     hint: "The character reads as a young study-abroad student, approachable and curious." },
  { key: "ai",       label: "AI / 知识",hint: "The character reads as a helpful knowledge-sharing friend, slightly nerdy in a warm way." },
  { key: "work",     label: "打工人",   hint: "The character reads as a mildly tired but relatable office worker type." },
  { key: "reading",  label: "读书",     hint: "The character reads as a thoughtful book-loving type." },
];
```

- [ ] **Step 2: Commit**

```bash
git add lib/archetypes.ts
git commit -m "feat(lib): archetype metadata, feature chips, vertical options"
```

---

### Task 9: Pre-generate 8 archetype thumbnails

**Files:**
- Create: `public/archetypes/*.png` (8 files)
- Create: `scripts/generate-archetype-thumbs.mjs` (one-shot generator)

- [ ] **Step 1: Write the thumbnail generator script**

Create `scripts/generate-archetype-thumbs.mjs`:

```javascript
// One-shot script — generates the 8 archetype thumbnails for the
// onboarding inspiration grid. Run once, commit outputs to /public.
//
// Usage: GEMINI_API_KEY=... node scripts/generate-archetype-thumbs.mjs
//
// Safe to re-run (overwrites existing files). Uses the same doodle
// strategy validated in Step 0.

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "public", "archetypes");
mkdirSync(OUT_DIR, { recursive: true });

const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const ARCHETYPES = [
  { key: "potato",  subject: "a potato-shaped upright character with two tiny stub arms and short little legs, two dot eyes and a small mouth" },
  { key: "blob",    subject: "a round rice-ball-shaped blob creature with no visible limbs, just a tiny face with two small dot eyes and a small smile" },
  { key: "monster", subject: "a small round fuzzy creature with one big central round eye, two tiny stub legs, no visible mouth" },
  { key: "frog",    subject: "a chubby round frog sitting on the ground, wide simple mouth, and two round dot eyes on top of its head" },
  { key: "ghost",   subject: "a small ghost with a rounded dome top and a wavy bottom edge, two round dot eyes, no mouth, floating" },
  { key: "stick",   subject: "a round-head stick figure with two dot eyes and a simple smile, thin stick arms and legs" },
  { key: "square",  subject: "a character with a small round head, a square rectangular block torso, and thin stick arms and legs; two dot eyes and a one-line smile on the head" },
  { key: "catblob", subject: "a round-faced cat character with two simple dot eyes, a small triangular nose, and a one-line smile, sitting upright" },
];

function doodlePrompt(subject) {
  return (
    `Hand-drawn doodle of ${subject}. ` +
    `Single uneven black pen stroke on a plain white background. ` +
    `Minimal strokes — only what's essential for the character to read. ` +
    `Deliberately imperfect geometry — wobbly lines, asymmetric proportions. ` +
    `No shading, no gradient, no color fill, no background objects, no texture. ` +
    `Looks like a human sketched it in a notebook in under a minute. ` +
    `Children's book doodle style.`
  );
}

async function callGemini(apiKey, prompt) {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  const b64 = part?.inlineData?.data;
  if (!b64) throw new Error("No image in response");
  return Buffer.from(b64, "base64");
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY env var required");

  for (const { key, subject } of ARCHETYPES) {
    const outPath = resolve(OUT_DIR, `${key}.png`);
    console.log(`generating ${key}...`);
    const img = await callGemini(apiKey, doodlePrompt(subject));
    writeFileSync(outPath, img);
    console.log(`  ok: ${outPath} (${img.length} bytes)`);
  }
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the generator**

```bash
export $(grep -v '^#' .env.local | xargs)
node scripts/generate-archetype-thumbs.mjs
```

Expected: 8 log lines ending in "ok: ..." and a final "done". Each image should be 500KB-1.5MB.

- [ ] **Step 3: Visually review in Finder**

```bash
open public/archetypes/
```

Gallery view. Verify:
- 8 PNGs exist
- Each is a clear hand-drawn doodle matching its key
- None are clearly "AI slop" (they shouldn't be, but visual sanity check)

If any one is bad, re-run the script (it overwrites). If multiple are bad, the `doodlePrompt` may need tuning — update the function and re-run.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-archetype-thumbs.mjs public/archetypes/
git commit -m "feat(assets): pre-generate 8 archetype thumbnails for onboarding grid"
```

---

### Task 10: Gemini client library

**Files:**
- Create: `lib/gemini.ts`

- [ ] **Step 1: Write `lib/gemini.ts`**

Create `lib/gemini.ts`:

```typescript
/**
 * Gemini 2.5 Flash Image wrapper for server routes.
 * Supports both text-only prompts and reference-image prompts.
 * Adapted from experiments/step0-ip-aesthetics/providers.ts.
 */

const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type Part =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

async function callGeminiWithParts(
  apiKey: string,
  parts: Part[]
): Promise<Buffer> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { data?: string } }> };
    }>;
  };

  const part = json.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData?.data
  );
  const b64 = part?.inlineData?.data;
  if (!b64) {
    throw new Error(
      `Gemini returned no image data: ${JSON.stringify(json).slice(0, 500)}`
    );
  }

  return Buffer.from(b64, "base64");
}

export async function generateImage(prompt: string): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return callGeminiWithParts(key, [{ text: prompt }]);
}

export async function generateImageWithReference(
  prompt: string,
  referenceImage: Buffer,
  mimeType: string = "image/png"
): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return callGeminiWithParts(key, [
    { inlineData: { mimeType, data: referenceImage.toString("base64") } },
    { text: prompt },
  ]);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/gemini.ts
git commit -m "feat(lib): gemini wrapper for server use (text + reference-image)"
```

---

### Task 11: IP prompt builder + unit test

**Files:**
- Create: `lib/ip-prompts.ts`
- Create: `lib/ip-prompts.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Write vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 2: Write the test file first (TDD)**

Create `lib/ip-prompts.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { buildIpPrompt } from "./ip-prompts";
import type { Archetype, FeatureChip, VerticalOption } from "./archetypes";

const fakeArchetype: Archetype = {
  key: "potato",
  label: "土豆人",
  subject: "a potato-shaped character",
  thumbPath: "/archetypes/potato.png",
};

const glassesChip: FeatureChip = {
  key: "glasses",
  label: "戴眼镜",
  descriptor: "wearing round black glasses",
};

const scarfChip: FeatureChip = {
  key: "scarf",
  label: "围围巾",
  descriptor: "wearing a simple striped scarf",
};

const abroadVertical: VerticalOption = {
  key: "abroad",
  label: "留学",
  hint: "The character reads as a young study-abroad student, approachable and curious.",
};

const generalVertical: VerticalOption = {
  key: "general",
  label: "通用",
  hint: "",
};

describe("buildIpPrompt", () => {
  it("includes archetype subject", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [],
      description: "",
      vertical: generalVertical,
    });
    expect(prompt).toContain("a potato-shaped character");
  });

  it("appends feature chip descriptors", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [glassesChip, scarfChip],
      description: "",
      vertical: generalVertical,
    });
    expect(prompt).toContain("wearing round black glasses");
    expect(prompt).toContain("wearing a simple striped scarf");
  });

  it("includes user free-text description when provided", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [],
      description: "with a big curious smile",
      vertical: generalVertical,
    });
    expect(prompt).toContain("with a big curious smile");
  });

  it("appends vertical hint when non-empty", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [],
      description: "",
      vertical: abroadVertical,
    });
    expect(prompt).toContain("study-abroad student");
  });

  it("omits vertical hint when empty", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [],
      description: "",
      vertical: generalVertical,
    });
    expect(prompt).not.toContain("study-abroad");
    expect(prompt).not.toContain("reads as");
  });

  it("always includes doodle style constraints", () => {
    const prompt = buildIpPrompt({
      archetype: fakeArchetype,
      chips: [],
      description: "",
      vertical: generalVertical,
    });
    expect(prompt).toContain("single uneven black pen stroke");
    expect(prompt.toLowerCase()).toContain("no color");
    expect(prompt.toLowerCase()).toContain("no background");
  });
});
```

- [ ] **Step 3: Run the test — should fail (module doesn't exist)**

```bash
npx vitest run lib/ip-prompts.test.ts
```

Expected: errors about `./ip-prompts` not existing or `buildIpPrompt` not being exported.

- [ ] **Step 4: Implement `lib/ip-prompts.ts`**

Create `lib/ip-prompts.ts`:

```typescript
import type { Archetype, FeatureChip, VerticalOption } from "./archetypes";

export interface IpPromptInput {
  archetype: Archetype;
  chips: readonly FeatureChip[];
  description: string;     // optional free-text from user; empty string if not provided
  vertical: VerticalOption;
}

/**
 * Assembles the full Gemini prompt for generating IP candidates.
 * The structure is:
 *   Hand-drawn doodle of {archetype.subject}, {chip.descriptor}...,
 *   {description if any}. {vertical.hint if any}.
 *   + doodle-style constraints (single black pen stroke, no color, etc.)
 *
 * The doodle-style suffix is the one validated in Step 0 — do not edit
 * without re-validating aesthetic output quality.
 */
export function buildIpPrompt(input: IpPromptInput): string {
  const { archetype, chips, description, vertical } = input;

  const chipDescriptors = chips.map((c) => c.descriptor).join(", ");
  const descriptionClause = description.trim() ? description.trim() : "";
  const verticalClause = vertical.hint.trim();

  const subjectPieces = [archetype.subject];
  if (chipDescriptors) subjectPieces.push(chipDescriptors);
  if (descriptionClause) subjectPieces.push(descriptionClause);

  const subjectSentence = subjectPieces.join(", ") + ".";

  const styleBlock = (
    "Single uneven black pen stroke on a plain white background. " +
    "Minimal strokes — only what's essential for the character to read. " +
    "Deliberately imperfect geometry — wobbly lines, asymmetric proportions. " +
    "No shading, no gradient, no color fill, no background objects, no texture. " +
    "Looks like a human sketched it in a notebook in under a minute. " +
    "Children's book doodle style."
  );

  const verticalBlock = verticalClause ? ` ${verticalClause}` : "";

  return `Hand-drawn doodle of ${subjectSentence} ${styleBlock}${verticalBlock}`;
}
```

- [ ] **Step 5: Run the tests — should now pass**

```bash
npx vitest run lib/ip-prompts.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/ip-prompts.ts lib/ip-prompts.test.ts vitest.config.ts
git commit -m "feat(lib): ip prompt builder with unit tests"
```

---

### Task 12: IP orchestration library

**Files:**
- Create: `lib/ip.ts`

- [ ] **Step 1: Write `lib/ip.ts`**

Create `lib/ip.ts`:

```typescript
import { randomUUID } from "node:crypto";
import { supabaseServer } from "./supabase-server";
import { generateImage, generateImageWithReference } from "./gemini";
import { buildIpPrompt, type IpPromptInput } from "./ip-prompts";

/**
 * The 6 basic poses generated during onboarding as the "meet your IP"
 * reveal. NOT used by daily carousel generation (that regenerates scenes
 * per post from the reference image). These purely exist so the user
 * sees their IP in motion once at the end of onboarding.
 */
export const BASIC_POSES: readonly { key: string; prompt: string }[] = [
  { key: "waving",   prompt: "The exact same character as the reference image, waving one hand in greeting, cheerful." },
  { key: "thinking", prompt: "The exact same character as the reference image, in a thinking pose — one hand on chin, slightly tilted head." },
  { key: "pointing", prompt: "The exact same character as the reference image, pointing to the right with one arm extended." },
  { key: "phone",    prompt: "The exact same character as the reference image, holding a small smartphone in both hands, looking at the screen." },
  { key: "sitting",  prompt: "The exact same character as the reference image, sitting cross-legged on the ground, relaxed." },
  { key: "laughing", prompt: "The exact same character as the reference image, laughing happily, eyes closed into little arcs." },
];

const POSE_PROMPT_SUFFIX =
  " Preserve the character perfectly: same shape, face, proportions, colors, and the same deliberately imperfect hand-drawn style as the reference. ONLY the pose changes. Hand-drawn doodle, single uneven black pen stroke on white background. No digital polish.";

export interface GeneratedCandidate {
  tempKey: string;      // opaque key to identify this candidate for confirmation
  imagePath: string;    // Storage path (not yet in `ips` table)
  signedUrl: string;    // signed URL for the client to display
}

/**
 * Generate 4 candidate IPs in parallel and upload each to the
 * ip-references/{user_id}/tmp/{tempKey}.png Storage path.
 *
 * Returns candidates with signed URLs valid for 1 hour.
 */
export async function generateCandidates(
  userId: string,
  input: IpPromptInput
): Promise<{ prompt: string; candidates: GeneratedCandidate[] }> {
  const prompt = buildIpPrompt(input);

  const tasks = Array.from({ length: 4 }, async () => {
    const tempKey = randomUUID();
    const imagePath = `${userId}/tmp/${tempKey}.png`;
    const img = await generateImage(prompt);

    const { error: uploadError } = await supabaseServer.storage
      .from("ip-references")
      .upload(imagePath, img, { contentType: "image/png", upsert: true });
    if (uploadError) throw new Error(`upload failed: ${uploadError.message}`);

    const { data: signed, error: signError } = await supabaseServer.storage
      .from("ip-references")
      .createSignedUrl(imagePath, 60 * 60);
    if (signError) throw new Error(`sign failed: ${signError.message}`);

    return { tempKey, imagePath, signedUrl: signed.signedUrl };
  });

  const candidates = await Promise.all(tasks);
  return { prompt, candidates };
}

/**
 * Persist a user's chosen candidate as their IP, move it from tmp/ to
 * the stable path, and return the created IP id.
 *
 * Does NOT generate the pose library (that's async, kicked off separately).
 */
export async function confirmChosenCandidate(
  userId: string,
  args: {
    chosenTempPath: string;   // e.g. "{userId}/tmp/{tempKey}.png"
    archetypeSeed: string;
    creationPrompt: string;
    name: string | null;
  }
): Promise<{ ipId: string; referencePath: string }> {
  const stablePath = `${userId}/ip.png`;

  // Copy object within bucket
  const { error: copyErr } = await supabaseServer.storage
    .from("ip-references")
    .copy(args.chosenTempPath, stablePath);
  if (copyErr) throw new Error(`copy failed: ${copyErr.message}`);

  // Insert IP row
  const { data: ipRow, error: insertErr } = await supabaseServer
    .from("ips")
    .upsert(
      {
        user_id: userId,
        name: args.name,
        archetype_seed: args.archetypeSeed,
        creation_prompt: args.creationPrompt,
        reference_image_path: stablePath,
        pose_library: [],
      },
      { onConflict: "user_id" }
    )
    .select("id")
    .single();
  if (insertErr || !ipRow) throw new Error(`insert failed: ${insertErr?.message}`);

  // Best-effort cleanup of temp candidates (don't fail overall if cleanup fails)
  const tmpPrefix = `${userId}/tmp/`;
  const { data: tmpObjects } = await supabaseServer.storage
    .from("ip-references")
    .list(tmpPrefix);
  if (tmpObjects && tmpObjects.length > 0) {
    const paths = tmpObjects.map((o) => tmpPrefix + o.name);
    await supabaseServer.storage.from("ip-references").remove(paths).catch(() => {});
  }

  return { ipId: ipRow.id, referencePath: stablePath };
}

/**
 * Generate the basic pose library for a user's IP.
 * Called asynchronously — the onboarding UI polls /api/ip/poses to see progress.
 *
 * Fetches the reference image, calls Gemini with it + each pose prompt in
 * parallel, uploads each result, and updates the pose_library jsonb on the IP row.
 */
export async function generatePoseLibrary(userId: string): Promise<void> {
  // Fetch the IP row to find the reference image
  const { data: ipRow, error: fetchErr } = await supabaseServer
    .from("ips")
    .select("id, reference_image_path")
    .eq("user_id", userId)
    .single();
  if (fetchErr || !ipRow) throw new Error(`ip row missing: ${fetchErr?.message}`);

  const { data: refBlob, error: dlErr } = await supabaseServer.storage
    .from("ip-references")
    .download(ipRow.reference_image_path);
  if (dlErr || !refBlob) throw new Error(`reference download failed: ${dlErr?.message}`);
  const referenceBuffer = Buffer.from(await refBlob.arrayBuffer());

  const tasks = BASIC_POSES.map(async ({ key, prompt }) => {
    const fullPrompt = prompt + POSE_PROMPT_SUFFIX;
    const img = await generateImageWithReference(fullPrompt, referenceBuffer);

    const posePath = `${userId}/${key}.png`;
    const { error: upErr } = await supabaseServer.storage
      .from("ip-poses")
      .upload(posePath, img, { contentType: "image/png", upsert: true });
    if (upErr) throw new Error(`pose ${key} upload failed: ${upErr.message}`);

    return { key, path: posePath };
  });

  const poses = await Promise.all(tasks);

  const { error: updateErr } = await supabaseServer
    .from("ips")
    .update({ pose_library: poses })
    .eq("user_id", userId);
  if (updateErr) throw new Error(`pose library update failed: ${updateErr.message}`);
}

/**
 * Create short-lived signed URLs for a user's full pose library.
 */
export async function getPoseLibrarySignedUrls(
  userId: string
): Promise<Array<{ key: string; signedUrl: string }>> {
  const { data: ipRow } = await supabaseServer
    .from("ips")
    .select("pose_library")
    .eq("user_id", userId)
    .single();
  const library = (ipRow?.pose_library as Array<{ key: string; path: string }>) ?? [];

  return Promise.all(
    library.map(async ({ key, path }) => {
      const { data: signed } = await supabaseServer.storage
        .from("ip-poses")
        .createSignedUrl(path, 60 * 60);
      return { key, signedUrl: signed?.signedUrl ?? "" };
    })
  );
}
```

- [ ] **Step 2: Compile check**

```bash
npx tsc --noEmit
```

Expected: no new errors. (Pre-existing errors in unrelated files are OK.)

- [ ] **Step 3: Commit**

```bash
git add lib/ip.ts
git commit -m "feat(lib): ip orchestration — generate candidates, confirm, pose library"
```

---

### Task 13: `/api/ip/create` route

**Files:**
- Create: `app/api/ip/create/route.ts`

- [ ] **Step 1: Write the route**

Create `app/api/ip/create/route.ts`:

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ARCHETYPE_BY_KEY, FEATURE_CHIPS, VERTICALS, type ArchetypeKey } from "@/lib/archetypes";
import { generateCandidates } from "@/lib/ip";

export async function POST(req: NextRequest) {
  // Authenticate the caller
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const {
    archetypeKey,
    chipKeys,
    description,
    verticalKey,
  } = body as {
    archetypeKey?: string;
    chipKeys?: string[];
    description?: string;
    verticalKey?: string;
  };

  const archetype = archetypeKey ? ARCHETYPE_BY_KEY[archetypeKey as ArchetypeKey] : undefined;
  if (!archetype) return NextResponse.json({ error: "invalid archetypeKey" }, { status: 400 });

  const vertical = VERTICALS.find((v) => v.key === verticalKey) ?? VERTICALS[0];

  const chips = (chipKeys ?? [])
    .map((k) => FEATURE_CHIPS.find((c) => c.key === k))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .slice(0, 3); // cap at 3 chips

  const safeDescription = (description ?? "").slice(0, 200);

  try {
    const { prompt, candidates } = await generateCandidates(user.id, {
      archetype,
      chips,
      description: safeDescription,
      vertical,
    });
    return NextResponse.json({ prompt, candidates });
  } catch (err) {
    const message = (err as Error).message ?? "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Manually verify**

Start `npm run dev`. Log in if not already. Then in a browser devtools console with the session cookie present (or via `curl` with a cookie):

```bash
# Replace {sb-access-token cookie} with your actual session cookie from DevTools
curl -X POST http://localhost:3000/api/ip/create \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-<project-ref>-auth-token={cookie-value}" \
  -d '{"archetypeKey":"potato","chipKeys":["glasses"],"description":"","verticalKey":"general"}'
```

Expected response shape:
```json
{
  "prompt": "Hand-drawn doodle of ...",
  "candidates": [
    { "tempKey": "...", "imagePath": "...", "signedUrl": "https://..." },
    { ... },
    { ... },
    { ... }
  ]
}
```

Opening any `signedUrl` should show a PNG of a potato-ish character with glasses.

- [ ] **Step 3: Commit**

```bash
git add app/api/ip/create/route.ts
git commit -m "feat(api): /api/ip/create — generate 4 ip candidates"
```

---

### Task 14: `/api/ip/confirm` route

**Files:**
- Create: `app/api/ip/confirm/route.ts`

- [ ] **Step 1: Write the route**

Create `app/api/ip/confirm/route.ts`:

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { confirmChosenCandidate, generatePoseLibrary } from "@/lib/ip";

export async function POST(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const { chosenImagePath, archetypeSeed, creationPrompt, name } = body as {
    chosenImagePath?: string;
    archetypeSeed?: string;
    creationPrompt?: string;
    name?: string;
  };

  if (!chosenImagePath || !chosenImagePath.startsWith(`${user.id}/tmp/`)) {
    return NextResponse.json({ error: "invalid chosenImagePath" }, { status: 400 });
  }
  if (!archetypeSeed || !creationPrompt) {
    return NextResponse.json({ error: "archetypeSeed and creationPrompt required" }, { status: 400 });
  }

  try {
    const { ipId } = await confirmChosenCandidate(user.id, {
      chosenTempPath: chosenImagePath,
      archetypeSeed,
      creationPrompt,
      name: (name ?? "").trim() || null,
    });

    // Kick off pose library generation in the background.
    // We don't await — the client polls /api/ip/poses.
    generatePoseLibrary(user.id).catch((err) => {
      console.error("pose library generation failed", err);
    });

    return NextResponse.json({ ipId });
  } catch (err) {
    const message = (err as Error).message ?? "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Note about the background task**

Vercel Serverless Functions do not run after the response is returned in most configurations. For local dev this works fine; for production, use Vercel's `after()` helper or a real queue. For v1 launch, document this as a known edge case — if a user closes their browser in the 30 seconds between confirm and pose library completion, the pose library may not finish. Acceptable for MVP.

If you want production-correct behavior, wrap with `after()`:

```typescript
import { after } from "next/server";
// ...
after(() => generatePoseLibrary(user.id).catch(console.error));
```

Use this `after()` version if you're confident the Next.js version supports it; otherwise leave the fire-and-forget pattern.

- [ ] **Step 3: Commit**

```bash
git add app/api/ip/confirm/route.ts
git commit -m "feat(api): /api/ip/confirm — persist chosen candidate, start pose library"
```

---

### Task 15: `/api/ip/poses` route

**Files:**
- Create: `app/api/ip/poses/route.ts`

- [ ] **Step 1: Write the route**

Create `app/api/ip/poses/route.ts`:

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPoseLibrarySignedUrls } from "@/lib/ip";
import { BASIC_POSES } from "@/lib/ip";

export async function GET(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const urls = await getPoseLibrarySignedUrls(user.id);

  return NextResponse.json({
    totalExpected: BASIC_POSES.length,
    completed: urls.length,
    poses: urls,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/ip/poses/route.ts
git commit -m "feat(api): /api/ip/poses — status polling for onboarding reveal"
```

---

### Task 16: Onboarding page — state machine wrapper

**Files:**
- Modify: `app/app/onboarding/page.tsx`

- [ ] **Step 1: Replace the placeholder onboarding page with the real one**

Overwrite `app/app/onboarding/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/app/onboarding/page.tsx
git commit -m "feat(onboarding): state machine shell + step progress bar"
```

(The four step components don't exist yet — the page will fail to compile. Tasks 17-20 fill them in.)

---

### Task 17: Step 1 — Inspiration grid

**Files:**
- Create: `app/app/onboarding/_components/InspirationStep.tsx`

- [ ] **Step 1: Write the inspiration step component**

Create `app/app/onboarding/_components/InspirationStep.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify compile**

```bash
npx tsc --noEmit
```

Expected: no errors in `InspirationStep.tsx` (the page import still fails until later steps exist).

- [ ] **Step 3: Commit**

```bash
git add app/app/onboarding/_components/InspirationStep.tsx
git commit -m "feat(onboarding): step 1 — inspiration archetype grid"
```

---

### Task 18: Step 2 — Feature chips + description + vertical

**Files:**
- Create: `app/app/onboarding/_components/FeaturesStep.tsx`

- [ ] **Step 1: Write the step**

Create `app/app/onboarding/_components/FeaturesStep.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/app/onboarding/_components/FeaturesStep.tsx
git commit -m "feat(onboarding): step 2 — feature chips, vertical, description"
```

---

### Task 19: Step 3 — Candidate picker

**Files:**
- Create: `app/app/onboarding/_components/PickStep.tsx`

- [ ] **Step 1: Write the step**

Create `app/app/onboarding/_components/PickStep.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add app/app/onboarding/_components/PickStep.tsx
git commit -m "feat(onboarding): step 3 — candidate picker with regen-all"
```

---

### Task 20: Step 4 — Reveal + name + completion

**Files:**
- Create: `app/app/onboarding/_components/RevealStep.tsx`

- [ ] **Step 1: Write the step**

Create `app/app/onboarding/_components/RevealStep.tsx`:

```tsx
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
```

- [ ] **Step 2: Manually verify the full onboarding flow**

Start `npm run dev`. Visit `http://localhost:3000/app` (log in if needed):

1. You should land on `/app/onboarding` (since no IP exists yet)
2. Step 1: pick an archetype → moves to step 2
3. Step 2: add 1-2 chips, pick a vertical, optionally type a description → click "生成 4 个候选" → should show 4 images after 10-15 seconds
4. Step 3: click one candidate → click "就选这个" → moves to step 4
5. Step 4: poses fill in one by one (10-30 seconds total); name the IP; click "开始创作"
6. You should land on `/app/generate` (the Phase B placeholder)

Verify in Supabase Dashboard:
- Table `ips` has one row for your user
- Storage `ip-references/{userId}/ip.png` exists
- Storage `ip-poses/{userId}/` has 6 files

- [ ] **Step 3: Commit**

```bash
git add app/app/onboarding/_components/RevealStep.tsx
git commit -m "feat(onboarding): step 4 — pose library reveal + naming + completion"
```

---

### Task 21: Wire up `/app/page.tsx` dispatcher to skip onboarding when IP exists

**Files:**
- Verify only (no new file): `app/app/page.tsx` was written in Task 7

- [ ] **Step 1: Re-read `app/app/page.tsx` to confirm dispatcher logic**

It should already check for the existence of an IP row and redirect appropriately:
- No IP → `/app/onboarding`
- Has IP → `/app/generate`

Run through the flow twice to confirm:
- First user (no IP): goes to onboarding — verified in Task 20
- After onboarding: visiting `/app` → redirects to `/app/generate` — verify this now in the browser

If the second flow doesn't work, inspect `/app/page.tsx` and fix. No new commit if nothing changes.

- [ ] **Step 2: If no fix needed, skip commit. If fix needed, commit.**

```bash
# Only if you changed something:
git add app/app/page.tsx
git commit -m "fix(app): ensure dispatcher skips onboarding for returning users"
```

---

### Task 22: Merge Phase A to main

**Files:** no file changes.

- [ ] **Step 1: Run full tsc check**

```bash
npx tsc --noEmit
```

Expected: no errors anywhere (other than pre-existing `next-env.d.ts` modifications which you were instructed to ignore).

- [ ] **Step 2: Run unit tests**

```bash
npx vitest run
```

Expected: 6 tests pass in `lib/ip-prompts.test.ts`.

- [ ] **Step 3: End-to-end manual walkthrough**

With `npm run dev`:

1. Open incognito tab → `http://localhost:3000/app`
2. Redirected to `/app/login`
3. Enter email → send magic link → click link in inbox
4. Should land on `/app/onboarding`
5. Run through all 4 steps
6. Should land on `/app/generate` (Phase B placeholder)
7. Close tab, re-open `http://localhost:3000/app` → should land directly on `/app/generate` (dispatcher works)

- [ ] **Step 4: Commit any uncommitted work, then merge to main**

```bash
git status
# Should be clean or only show next-env.d.ts

git checkout main
git merge feat/v1-phase-a-foundation-onboarding --no-ff -m "merge: v1 phase a — foundation + onboarding

- Email magic link auth via Supabase Auth + SSR cookies
- DB schema: ips, posts, page_regenerations (with RLS)
- Storage buckets: ip-references, ip-poses, post-scenes (owner-scoped RLS)
- /app authenticated shell + dispatcher (onboarding vs generate)
- 4-step onboarding flow: inspiration → features → candidates → reveal+name
- API routes: /api/ip/create, /api/ip/confirm, /api/ip/poses
- Library modules: gemini, ip-prompts (tested), ip orchestration
- 8 pre-generated archetype thumbnails

Phase B (daily generate + output + download) is a separate plan."

git log --oneline -5
```

---

## Self-Review Notes

- **Spec coverage — Phase A in scope:**
  - Email magic link auth ✅ (Tasks 5, 6)
  - DB schema ✅ (Task 2)
  - Storage buckets + RLS ✅ (Task 3)
  - Auth middleware ✅ (Task 5)
  - `/app/login` + callback ✅ (Task 6)
  - Empty `/app` shell with dispatcher ✅ (Tasks 7, 21)
  - 8 archetype thumbnails ✅ (Task 9)
  - `lib/gemini.ts` ✅ (Task 10)
  - `lib/ip-prompts.ts` with tests ✅ (Task 11)
  - `lib/ip.ts` orchestration ✅ (Task 12)
  - `/api/ip/*` routes ✅ (Tasks 13, 14, 15)
  - Onboarding UI (all 4 steps) ✅ (Tasks 16-20)
  - Light vertical signal collection ✅ (Task 18)

- **Spec coverage — Phase B deferred (explicitly called out):**
  - `/api/carousel/plan`, `/api/carousel/page`
  - `/app/generate` real UI
  - Canvas compositor (`lib/compositor.ts`)
  - Per-page regen
  - ZIP download (`lib/downloader.ts`)

- **Placeholder scan:** None. Every step includes complete code or concrete shell commands. Task 14's production `after()` note is a documented known edge case, not a placeholder for future work.

- **Type consistency:** `ArchetypeKey`, `Archetype`, `FeatureChip`, `VerticalOption`, `OnboardingState`, `GeneratedCandidate`, `PoseStatus` all defined once and consistently referenced. `supabaseServer` renamed consistently in Task 4 (waitlist route imports updated).

- **Known risks left to surface during execution:**
  - Supabase CLI requires project link on first push (Task 2 Step 3 mentions Dashboard paste as fallback)
  - Supabase default SMTP is 3/hour — first manual test is fine, beta testing would require Resend (noted in spec risks, not here)
  - `after()` for background pose generation may not be available in all Next.js versions; fire-and-forget fallback is documented (Task 14)

- **No hidden rewrites:** the existing waitlist route's only change is the import path (Task 4). No other pre-existing code is touched.
