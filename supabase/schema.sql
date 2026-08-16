-- ============================================================
-- cookiekiller portfolio — Supabase schema
-- Run this once in Supabase → SQL Editor → New query → Run
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  order_index   integer not null default 0,
  status        text not null default 'case',       -- 'case' | 'live' | 'dev'
  hue           text not null default '#1B3BFF',
  template      integer not null default 1,          -- 1 = case study, 2 = filmstrip
  published     boolean not null default true,
  thumb         text,                                 -- small square preview (work list row)
  preview_img   text,                                 -- big hover preview (right-side panel)
  external_url  text,                                  -- e.g. Behance link, used as fallback CTA
  name          jsonb not null default '{}'::jsonb,   -- {en,ru,ro}
  tags          jsonb not null default '{}'::jsonb,   -- {en,ru,ro}
  content       jsonb not null default '{}'::jsonb,   -- see README-ADMIN.md for shape
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists projects_order_idx on public.projects (order_index);
create index if not exists projects_slug_idx on public.projects (slug);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Row Level Security
-- Public (anon) visitors can only READ published projects.
-- Only a logged-in (authenticated) admin can create/update/delete
-- and can also see unpublished (draft) projects.
-- ============================================================
alter table public.projects enable row level security;

drop policy if exists "public read published" on public.projects;
create policy "public read published"
  on public.projects for select
  to anon
  using (published = true);

drop policy if exists "admin full access" on public.projects;
create policy "admin full access"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- Storage bucket for images / gifs / video uploaded from the admin
-- ============================================================
insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do nothing;

drop policy if exists "public read project media" on storage.objects;
create policy "public read project media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-media');

drop policy if exists "admin upload project media" on storage.objects;
create policy "admin upload project media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-media');

drop policy if exists "admin update project media" on storage.objects;
create policy "admin update project media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-media');

drop policy if exists "admin delete project media" on storage.objects;
create policy "admin delete project media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-media');
