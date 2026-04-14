# DoodleIP v1 MVP — 设计规格（中文版）

**日期：** 2026-04-13
**状态：** 已批准
**负责人：** Weston

> 本文档是 `2026-04-13-doodleip-v1-mvp-design.md` 的中文对照版，供 Weston 审阅。以英文版为准（英文是给未来协作者/AI agent 读的 canonical 版本）。

## 背景与动机

DoodleIP 的落地页（`doodleip.vercel.app`）推广语是"给不想露脸但想被记住的小红书创作者的涂鸦 IP 生成器"。落地页之外的产品还没建。

2026 年 4 月做的三轮验证解决了此前未知的问题：

1. **审美可行性（Step 0）** — Gemini 2.5 Flash Image + doodle 策略 prompt 能稳定产出可用的手绘 IP 候选，8 个 archetype × 4 种着色 = 45 次生成、零 AI slop。真正起作用的是负向约束（`no color` / `no background` / `no shading`）+ 不完美关键词（`deliberately imperfect` / `wobbly`）。

2. **姿势变体（Step 1 spike）** — 给一张 IP 参考图，Gemini 能在不同姿势（思考/挥手/指向/看手机）下保持 4/4 身份一致。

3. **场景变体（Step 1 扩展 spike）** — 给一张 IP 参考图，Gemini 能生成特定内容场景（Tesco 招牌下、伦敦地铁站里、拿 SIM 卡）下的 IP，4/4 身份保留，且**模型自动添加了匹配场景情绪的细节**（Tesco 前皱眉、地铁站额头冒汗）。

市场调研揭露了第二个关键洞察：**在小红书上，IP 形象贡献创作者成功约 20%，内容和文案占 80%**。XHS 上跑得起来的手绘 IP 不是"可爱角色加好帖子"，而是"有强内容的创作者，他们的 IP 让他们被认出"。

基于这些发现，v1 的范围跟 `DESIGN.md` 最初设想**实质上不同**。v1 是一个单用户产品：用户创建 IP 一次，之后反复把文字变成 5-7 页的轮播图，每页 IP 都在该页内容的场景里演绎——用户手动上传到小红书即可发布。

前置 spec：
- `docs/superpowers/specs/2026-04-03-landing-page-design.md`（已上线）
- `docs/superpowers/specs/2026-04-13-step0-ip-aesthetics-design.md`（已验证）

## 目标

交付一个能跑的产品：**让小红书创作者创建一次自己的手绘 IP，之后反复把粘贴进来的文字变成 5-7 页的轮播图，每页 IP 都出现在该页内容的场景里——下载后手动上传小红书即可发布。**

## 目标用户

v1 单一用户画像：

- 自己写内容（文字帖、笔记、文章）的小红书创作者
- 想要循环出现的视觉身份但不想露脸
- 自己画不出来或不想画

Onboarding 会轻度收集垂类信号（留学 / AI知识 / 打工人 / 读书 / 通用）来调整 IP 生成，但**不分叉产品流程**。

## 11 个核心决定

Brainstorm 过程中对齐的 11 个决定：

| # | 决定 | 含义 |
|---|---|---|
| 1 | Job-to-be-done = A | 用户已有内容 → 产品出可发布的轮播图。不是给只有话题方向的用户做内容生成 |
| 2 | IP 架构 = 场景变体 | 每个 body 页是 AI 生成的 IP-in-scene 图，不是贴在文字页上的静态 IP。IP 演绎内容 |
| 3 | 轮播生成 = LLM 规划 + 代码合成 | Claude 规划（页数、每页场景描述、每页 overlay 文字）。Gemini 生成场景。客户端 Canvas 渲染文字叠在上面。**文字从不由图像模型生成** |
| 4 | 身份机制 = 邮箱 magic link | Supabase Auth magic link。无密码。每用户 1 个 IP。跨设备通过邮箱登录 |
| 5 | 垂类预设 = 轻量 | Onboarding 问"你发什么内容？"，只作为 seed 影响 IP 生成 prompt。内容规划不分叉，无垂类专属模板 |
| 6 | Onboarding = B+D 混合 | 灵感板 8 archetype → 用户选 vibe → 特征 chip 选择 → 可选自由输入 → 生成 4 候选 → 挑一个 → 后台生成姿势库 → 命名 IP。约 90 秒，约 $0.50 API 成本 |
| 7 | Output = Gallery + 单页重跑 + ZIP | 5-7 页预览。每页一个"重跑"按钮（~$0.05/次）。一个"下载全部"按钮打 ZIP，用户手动上传小红书 |
| 8 | 定价 = v1 完全免费 | 无付费墙、无订阅。v1 验证"人是不是真的反复用"，不验证"能不能收钱"。100 用户 × 每周 1 post ≈ $160/月 API 成本，Weston 可接受 |
| 9 | LLM = Claude Sonnet 4.5；图像模型 = Gemini 2.5 Flash Image | Claude 用于规划质量。Gemini 用于图像生成（已验证） |
| 10 | Canvas 合成在客户端 | 用户浏览器合成 scene 图 + 文字叠层。零后端算力成本。JSZip 客户端打包 ZIP |
| 11 | 技术栈复用现有仓库 | Next.js 16 + React 19 + Tailwind 4（现有）。Supabase Auth + Postgres + Storage（现有，加新表）。Vercel 部署（现有） |

## 架构

### 数据流 — 日常使用

```
用户把文字粘进 textarea
        │
        ▼
POST /api/carousel/plan  (Claude Sonnet)
  输入：{ userText, userId }
  输出：{
    pages: [
      { sceneDescription, overlayText },
      ... 共 5-7 页
    ]
  }
        │
        ▼
对每页并行（Promise.all）:
  POST /api/carousel/page  (Gemini 2.5 Flash Image + 参考图)
    输入：{ userId, sceneDescription }
    输出：scene-image.png (1024×1024, 服务端上传到 Supabase Storage, 返回签名 URL)
        │
        ▼
客户端把 overlayText 合成到每张 scene 图上
  （Canvas API，原生，零依赖）
        │
        ▼
Gallery 渲染 5-7 页，每页带"重生成"按钮
        │
        ├── 用户点"重生成第 N 页" → 再次调 /api/carousel/page 用新 prompt 变体
        │     → 替换 gallery 里的该页
        │
        └── 用户点"下载全部" → 客户端用 JSZip 把所有合成好的 PNG 打成 ZIP → 浏览器下载
```

### 数据流 — Onboarding

```
用户打开 /app
        │
        ▼
Supabase Auth 检查:
  - 无 session → 显示邮箱输入框 → 发 magic link
  - 已登录且已有 IP → 直接跳 /app/generate (skip onboarding)
  - 已登录但无 IP → 跳 /app/onboarding
        │
        ▼
Onboarding 步骤 1（灵感）：展示 8 个 archetype 缩略图
  素材：预先生成的静态文件（放 /public 或 Storage）
  用户选一个 → archetype_seed 存到客户端 state
        │
        ▼
Onboarding 步骤 2（特征）：chip 选择 + 可选自由输入
  chip 列表：[戴眼镜, 围巾, 耳机, 马尾, 背包, ...]（10-15 个静态选项）
  有创意的用户可用自由描述框
        │
        ▼
POST /api/ip/create  (Gemini, 4 次并行调用)
  输入：{ archetype_seed, feature_chips, description, vertical_hint }
  输出：4 张候选图 → Supabase Storage → 4 个签名 URL
        │
        ▼
Onboarding 步骤 3（选定）：用户从 4 张中挑 1 张（或点"全部重生成"重跑）
        │
        ▼
POST /api/ip/confirm
  输入：{ chosen_candidate_url }
  动作：持久化 IP 记录到 DB；后台启动姿势库生成
         （6-8 次并行 Gemini 调用，以选定图为参考）
  输出：{ ip_id, pose_library_progress }
        │
        ▼
Onboarding 步骤 4（命名，姿势库后台生成的同时）:
  输入框："给你的 IP 起个名字（可选）"
  姿势库生成完 → 展示"见见你的 IP"画廊（6-8 姿势）作为奖励瞬间
  → "开始创作"按钮 → /app/generate

v1 里姿势库的作用：onboarding 结尾的展示瞬间（"看你的 IP 能做 8 件事"），
给用户一种"我真的拥有一个角色"的实感。日常轮播生成**不用**姿势库——
每次都从参考图现场生成 scene。姿势库约 $0.32/次的一次性成本，
被这个产品瞬间的价值 justify 了。
```

### 组件模块

| 模块 | 职责 | 位置 |
|---|---|---|
| LandingLayer | 已有的营销页 + waitlist | `app/page.tsx`, `components/*`（不动） |
| AuthBoundary | 邮箱 magic link 流程 + session 管理 | `app/app/*`, middleware |
| OnboardingFlow | 7 步向导（灵感 → 特征 → 生成 → 选定 → 姿势库 → 命名 → 完成） | `app/app/onboarding/*` |
| GenerateFlow | 粘贴文字 → 规划 → 并行场景生成 → gallery → 重跑 → 下载 | `app/app/generate/*` |
| ContentPlanner | LLM 封装 for `/api/carousel/plan` | `app/api/carousel/plan/route.ts` + `lib/planner.ts` |
| SceneGenerator | Gemini image-to-image 封装 for `/api/carousel/page` | `app/api/carousel/page/route.ts` + `lib/scene.ts`（从 `experiments/step0-ip-aesthetics/providers.ts` 改造） |
| IPService | Onboarding 侧的 IP 候选生成 + 姿势库生成 | `app/api/ip/*` + `lib/ip.ts` |
| Compositor | 客户端通过 Canvas 把文字叠到 scene 图上 | `lib/compositor.ts` |
| Downloader | 客户端 ZIP 打包 | `lib/downloader.ts`（用 JSZip） |

### 数据模型（Supabase Postgres）

```sql
-- Waitlist（已有，不动）

-- IPs —— v1 每用户 1 个
create table ips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade unique,
  name text,
  archetype_seed text,                    -- 8 个预定义 seed 之一
  creation_prompt text,                   -- 拼好的 Gemini prompt
  reference_image_path text not null,     -- 用户选定图的 Storage 路径
  pose_library jsonb default '[]',        -- [{ key: "thinking", path: "..." }, ...]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Posts —— 每用户可多
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  user_text text not null,
  plan jsonb not null,                    -- LLM 规划输出
  page_image_paths jsonb default '[]',    -- [{ index: 0, path: "..." }, ...]
  created_at timestamptz default now()
);

-- 单页重生成审计（对质量学习有用）
create table page_regenerations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts on delete cascade,
  page_index int not null,
  new_image_path text not null,
  created_at timestamptz default now()
);

-- 三表都开 RLS：user_id = auth.uid()
```

### Supabase Storage（私密 bucket）

```
ip-references/{user_id}/ip.png             ← 用户选定的 IP 候选
ip-poses/{user_id}/{pose_key}.png          ← 6-8 个姿势
post-scenes/{post_id}/page-{n}.png         ← 每次生成的场景图
```

全部私密，通过已认证用户会话请求短期签名 URL 访问。

### URL 结构

```
/                        landing page（已有）
/app                     auth 边界 + 路由
/app/onboarding          首次流程
/app/generate            日常使用
/api/ip/create           POST: 生成 4 候选
/api/ip/confirm          POST: 保存选定候选 + 启动姿势库
/api/ip/poses            GET: 姿势库状态（onboarding 中轮询）
/api/carousel/plan       POST: LLM → 分页规划
/api/carousel/page       POST: 单页场景生成（首次+重跑走同一端点）
/api/waitlist            POST: 现有端点（不动）
```

### 技术栈

| 层 | 选择 |
|---|---|
| Framework | Next.js 16（App Router）、React 19、Tailwind 4 |
| Auth | Supabase Auth（magic link，v1 用默认 SMTP） |
| 数据库 | Supabase Postgres，开 RLS |
| 存储 | Supabase Storage，私密 bucket |
| LLM（内容规划） | Anthropic Claude Sonnet 4.5（`@anthropic-ai/sdk`） |
| 图像生成 | Gemini 2.5 Flash Image（REST，复用 `experiments/step0-ip-aesthetics/providers.ts` 里的封装） |
| Canvas 合成 | 浏览器 Canvas API，无库 |
| ZIP 打包 | JSZip |
| 部署 | Vercel（现有） |

### 环境变量

```
NEXT_PUBLIC_SUPABASE_URL           （已有）
NEXT_PUBLIC_SUPABASE_ANON_KEY      （已有）
SUPABASE_SERVICE_ROLE_KEY          （新增 — 服务端 DB/Storage 写入）
GEMINI_API_KEY                     （新增）
ANTHROPIC_API_KEY                  （新增）
```

## v1 In Scope（做什么）

- Supabase Auth 邮箱 magic link 登录
- Onboarding 流程：灵感板 → chip 特征 → 4 候选 → 选定 → 姿势库 → 命名
- 每用户单一 IP，含参考图 + 姿势库
- 日常流程：粘贴文字 → LLM 规划 → 并行场景生成 → Canvas 文字合成 → gallery（每页可重跑） → ZIP 下载
- Onboarding 轻量垂类信号（"你发什么内容？"），只影响 IP 生成 prompt
- 全中文 UI
- 预生成素材库：灵感板上的 8 张 archetype 缩略图（一次性生成后 checkin 到 `/public`）
- 客户端 Canvas 合成器（文字叠 scene 图）
- 客户端 JSZip 打包下载

## v1 Out of Scope（明确延后）

| 延后功能 | 理由 |
|---|---|
| 多 IP 切换 | 单循环 IP 就是 identity 产品的核心约束 |
| IP 创建后编辑 | 需重走 onboarding；v1.1 |
| Post 历史 / 工作台 UI | 数据在 DB，但无界面；v1.1 |
| gallery 里文字编辑 | 用户给的文字本来就是他想发的 |
| 重排 / 删除单页 | LLM 规划顺序是 final |
| 一键发布到小红书 | 无公开 API；用户手动上传 |
| 多语言 UI | v1 仅中文 |
| 服务端日志之外的分析 | 等有用户再说 |
| 管理员 dashboard | v1 规模下 N/A |
| 付费 tier / 订阅 / 用量限制 | v1 免费 |
| 内容日历 / 多 post 规划 | 这是 Job C，早期否决 |
| IP 动画 / 视频输出 | v1 只做图 |
| 自定义字体 / 色板 | 固定 crayon + 默认字体 |
| 团队 / 组织账号 | 单用户 v1 |
| Supabase/API provider 默认之外的 rate limit | v1 规模下不是关键 |
| 垂类专属轮播结构（留学=7页日记体；AI=5页信息卡） | 你选了轻量垂类——垂类调校是分发工作，不是产品工作 |
| 匿名 UUID 时的"可分享工作台 URL" | 邮箱登录替代了 UUID identity 机制 |
| 用户对初始姿势库不满时的重新生成 | 延后；不满的话可删除重走 onboarding |

## 成功标准

### 技术门槛（上线最低要求）

- Onboarding 完成率（用户走到"完成"状态）≥ 80%
- 单页生成首次成功率（IP 身份识别 + 场景贴合内容）≥ 90%
- 端到端耗时：onboarding ≤ 90 秒，daily use（粘文字到 gallery）≤ 60 秒
- 单页重跑 ≤ 10 秒
- 输出文字零错字（代码侧渲染保证）
- 生成的 ZIP 在标准工具里能打开，含 5-7 张 PNG

### 产品成功信号（上线后 2-4 周内观察）

| 信号 | 阈值 | 含义 |
|---|---|---|
| 🟢 非 Weston 用户完成 onboarding | ≥ 1 人 | 产品对陌生人能用 |
| 🟢 用户 7 天内回来生成第 2 个 post | ≥ 3 位不同用户 | 有粘性信号 |
| 🟢 生成的 post 真发到小红书了 | ≥ 1 次（问出来 / 自己刷到） | 闭环成立 |
| 🟡 每 post 重跑率 | 30-50% | AI 方差存在但可接受 |
| 🔴 每 post 重跑率 | > 50% | AI 质量不够——投 prompt engineering |
| 🔴 第 1-2 周内完 onboarding 人数 < 10 | — | 分发问题，不是产品问题 |
| 🔴 onboarded 用户里 < 20% 生成第 2 个 post | — | 产品是 novelty，不是复用工具 |

### 学习产出（v1 必须回答这些问题）

- 哪个垂类在早期用户里占比最多？（指导 v1.1 垂类深度优化方向）
- 8 个 archetype seed 里哪个最被挑？（市场审美信号）
- 哪些 chip 特征用得最多？（个性化偏好维度）
- 日常使用单次 session 时长？（> 5 分钟意味着摩擦大）
- 哪类 post（主题/长度/语气）出图质量最好 / 最差？（指导 LLM prompt 迭代）

## 风险与待解决问题

### 已知风险

- **Gemini 限流** — v1 预期会并发图像生成（onboarding 4 张候选；每 post 5-7 张）。如果达到 Gemini 的速率上限，用户侧会看到失败。对策：指数退避自动重试 1 次；失败时显示"稍后再试"的明确 UX
- **文字叠在繁忙 scene 上可读性问题** — 部分场景输出可能在文字要叠的位置有视觉干扰。对策：mockup 里选的深色 caption 条设计在任何背景上都提供高对比度
- **多次 post 累积的身份漂移** — 几十个 post 下来，角色可能细微漂移（每次 scene 从存储的参考图现场生成，所以漂移被 Gemini 的参考保留质量约束）。v1 不是 blocker（每个用户只看自己的输出），但值得作为学习数据持续监控
- **Supabase 默认 SMTP 可能被 throttle** — Supabase 自带邮件限制 3/小时。如果注册速度超过会延迟 magic link。对策：持续注册速度超过 3/小时就换 Resend（免费档 100/天）

### 待解决问题（实现阶段解决，不是 brainstorm 阶段）

- 姿势库具体组成（预生成哪 6-8 个姿势）——实现时跟 Weston 定，初步建议：站立/思考/挥手/指向/拿东西/坐姿/走路/笑
- Onboarding 特征 chip 具体列表——实现时定，初步建议：[戴眼镜/戴帽子/围巾/耳机/马尾/短发/胡子/背包/相机/水壶]
- Claude 内容规划 prompt——实现时设计迭代；结构 = system prompt 定义输出 JSON schema + user message = 用户原文
- 灵感板 8 archetype 缩略图怎么预生成——很可能跑现有 `experiments/step0-ip-aesthetics` 管道一次用特定 seed，把输出 commit 到 `/public`

## 附：这替换了什么

原 `DESIGN.md` 和早期 Step-0 plan 假设：
- MVP 是一次性内容生成器（无账号、无持久化）
- IP 作为静态 PNG 贴纸贴到固定 HTML 模板上
- 产品命脉押在"角色在 6-8 姿势下的一致性"

三个假设都被修正：
- **账号 + 单个持久化 IP** 是 v1
- **场景变体替换贴纸 + 模板**
- 姿势一致性被轻易验证（4/4 绿灯）；现在更难的约束是 **scene 级别的身份保留**（也验证了，4/4 绿灯）
