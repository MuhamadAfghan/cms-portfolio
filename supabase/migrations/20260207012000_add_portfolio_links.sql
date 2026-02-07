alter table if exists public.portfolio
  add column if not exists link_demo text,
  add column if not exists link_github text;
