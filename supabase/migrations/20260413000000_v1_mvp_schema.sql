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
