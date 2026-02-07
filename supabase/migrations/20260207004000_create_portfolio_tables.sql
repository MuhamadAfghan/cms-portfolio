create extension if not exists "pgcrypto";

create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  summary text,
  content text,
  status text not null default 'draft' check (status in ('draft','published')),
  featured boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolio(id) on delete cascade,
  url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.portfolio_tech_stack (
  portfolio_id uuid not null references public.portfolio(id) on delete cascade,
  tech_stack_id uuid not null references public.tech_stack(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (portfolio_id, tech_stack_id)
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_portfolio_updated_at on public.portfolio;
create trigger trg_portfolio_updated_at
before update on public.portfolio
for each row execute function public.set_updated_at();

alter table public.portfolio enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.portfolio_tech_stack enable row level security;

drop policy if exists "Public read portfolio" on public.portfolio;
create policy "Public read portfolio" on public.portfolio
for select using (true);

drop policy if exists "Public insert portfolio" on public.portfolio;
create policy "Public insert portfolio" on public.portfolio
for insert with check (true);

drop policy if exists "Public update portfolio" on public.portfolio;
create policy "Public update portfolio" on public.portfolio
for update using (true) with check (true);

drop policy if exists "Public delete portfolio" on public.portfolio;
create policy "Public delete portfolio" on public.portfolio
for delete using (true);

drop policy if exists "Public read portfolio_images" on public.portfolio_images;
create policy "Public read portfolio_images" on public.portfolio_images
for select using (true);

drop policy if exists "Public insert portfolio_images" on public.portfolio_images;
create policy "Public insert portfolio_images" on public.portfolio_images
for insert with check (true);

drop policy if exists "Public update portfolio_images" on public.portfolio_images;
create policy "Public update portfolio_images" on public.portfolio_images
for update using (true) with check (true);

drop policy if exists "Public delete portfolio_images" on public.portfolio_images;
create policy "Public delete portfolio_images" on public.portfolio_images
for delete using (true);

drop policy if exists "Public read portfolio_tech_stack" on public.portfolio_tech_stack;
create policy "Public read portfolio_tech_stack" on public.portfolio_tech_stack
for select using (true);

drop policy if exists "Public insert portfolio_tech_stack" on public.portfolio_tech_stack;
create policy "Public insert portfolio_tech_stack" on public.portfolio_tech_stack
for insert with check (true);

drop policy if exists "Public update portfolio_tech_stack" on public.portfolio_tech_stack;
create policy "Public update portfolio_tech_stack" on public.portfolio_tech_stack
for update using (true) with check (true);

drop policy if exists "Public delete portfolio_tech_stack" on public.portfolio_tech_stack;
create policy "Public delete portfolio_tech_stack" on public.portfolio_tech_stack
for delete using (true);

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

do $$
begin
  alter table storage.objects enable row level security;

  drop policy if exists "Public read uploads" on storage.objects;
  create policy "Public read uploads" on storage.objects
  for select using (bucket_id = 'uploads');

  drop policy if exists "Public insert uploads" on storage.objects;
  create policy "Public insert uploads" on storage.objects
  for insert with check (bucket_id = 'uploads');

  drop policy if exists "Public update uploads" on storage.objects;
  create policy "Public update uploads" on storage.objects
  for update using (bucket_id = 'uploads') with check (bucket_id = 'uploads');

  drop policy if exists "Public delete uploads" on storage.objects;
  create policy "Public delete uploads" on storage.objects
  for delete using (bucket_id = 'uploads');
exception
  when insufficient_privilege then
    raise notice 'Skipping storage.objects policies for uploads (insufficient privilege).';
end $$;
