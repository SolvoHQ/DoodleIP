# DoodleIP Landing Page Design Spec

**Date:** 2026-04-03
**Status:** Approved

## Goal

A Chinese-language landing page targeting Xiaohongshu (Little Red Book) content creators.
Primary purpose: collect waitlist emails to validate demand before building the full product.

## Target Audience

Xiaohongshu content creators who either:
- Already post text-only content with no visual identity
- Want to start creating but don't want to show their face and can't design

## Page Structure

Four sections, top to bottom:

### 1. Hero
- Badge: "DoodleIP"
- Headline: "不露脸，也能让别人记住你"
- Subtitle: one sentence explaining the product (AI generates a unique doodle character for your content)
- Waitlist email input + submit button
- Product mockup: 4 carousel cards showing an IP character across different slides

### 2. Before/After Comparison
- Section title: "有 IP 和没 IP，差别有多大？"
- Left: boring gray text-only screenshot (labeled "Before")
- Right: colorful card with IP character (labeled "After")
- Arrow between them

### 3. How It Works
- Section title: "三步拥有你的专属 IP"
- Three step cards:
  1. Describe your character (text input)
  2. AI generates your unique IP (multiple candidates, pick one)
  3. One-click carousel generation (input text, get publishable carousel)

### 4. Bottom CTA
- Headline: "首批用户免费体验"
- Subtitle: "留下邮箱，产品上线第一时间通知你"
- Repeat waitlist email form

### 5. Footer
- "DoodleIP (c) 2026"

## Visual Style

- **Aesthetic:** Hand-drawn doodle feel + bold youthful colors
- **Background:** Warm off-white (#FFF8F0) with subtle radial gradient accents
- **Accent colors:** Bright orange (#FF6B35), mint green (#00D28C), yellow (#FFD93D)
- **Borders:** Thick (2.5px) dark borders with offset box shadows (comic/sticker feel)
- **Typography:** Handwritten-style Chinese font for headings, Noto Sans SC for body
- **Decorations:** Scattered doodle elements (squiggles, stars) with subtle animation
- **Cards:** Slight rotation transforms for playful, hand-pinned feel

## Tech Stack

- **Framework:** Next.js (static export, single page)
- **Deployment:** Vercel
- **Styling:** Tailwind CSS or inline styles; hand-drawn decorations as SVGs
- **Fonts:** Handwritten Chinese font for headings, Noto Sans SC for body text
- **Waitlist storage:** Supabase (free tier)
- **API:** Single Next.js API route `POST /api/waitlist`

## Waitlist API

### Database
Supabase table `waitlist`:
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | primary key, auto-generated |
| email | text | unique, not null |
| created_at | timestamptz | default now() |

### Endpoint: `POST /api/waitlist`
- **Request body:** `{ "email": "user@example.com" }`
- **Validation:** valid email format
- **Dedup:** if email already exists, return success (don't leak whether email is registered)
- **Success response:** `{ "ok": true }`
- **Error response:** `{ "ok": false, "error": "invalid email" }`

### Frontend behavior
- On submit: show loading state on button
- On success: replace form with "已加入等待列表！" message
- On duplicate: same success message (no leak)
- On error: show inline error below input

## Scope

**In scope:**
- Single static landing page (Chinese)
- Waitlist email collection with Supabase
- Responsive design (mobile + desktop)
- Hand-drawn/doodle visual style

**Out of scope:**
- English version (separate future effort)
- Analytics/tracking
- Email confirmation/verification
- Admin dashboard for waitlist
- Actual product functionality

## Success Criteria

- Page loads fast (<2s on 3G)
- Waitlist form works end-to-end (submit -> stored in Supabase)
- Visually compelling enough that a Xiaohongshu creator would share it
- Mobile-first responsive layout
- No JS errors in console
