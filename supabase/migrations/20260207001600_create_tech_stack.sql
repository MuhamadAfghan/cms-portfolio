create extension if not exists "pgcrypto";

create table if not exists public.tech_stack (
    id uuid primary key default gen_random_uuid (),
    name text not null,
    type text not null check (type in ('svg', 'image')),
    source text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tech_stack_updated_at on public.tech_stack;

create trigger trg_tech_stack_updated_at
before update on public.tech_stack
for each row execute function public.set_updated_at();

alter table public.tech_stack enable row level security;

drop policy if exists "Public read tech_stack" on public.tech_stack;

create policy "Public read tech_stack" on public.tech_stack for
select using (true);

drop policy if exists "Public insert tech_stack" on public.tech_stack;

create policy "Public insert tech_stack" on public.tech_stack for
insert
with
    check (true);

drop policy if exists "Public update tech_stack" on public.tech_stack;

create policy "Public update tech_stack" on public.tech_stack for
update using (true)
with
    check (true);

drop policy if exists "Public delete tech_stack" on public.tech_stack;

create policy "Public delete tech_stack" on public.tech_stack for delete using (true);

insert into
    storage.buckets (id, name, public)
values (
        'uploads',
        'uploads',
        true
    ) on conflict (id) do nothing;

do $$
begin
  alter table storage.objects enable row level security;

  drop policy if exists "Public read uploads" on storage.objects;
  create policy "Public read uploads" on storage.objects for
  select using (bucket_id = 'uploads');

  drop policy if exists "Public insert uploads" on storage.objects;
  create policy "Public insert uploads" on storage.objects for
  insert with check (bucket_id = 'uploads');

  drop policy if exists "Public update uploads" on storage.objects;
  create policy "Public update uploads" on storage.objects for
  update using (bucket_id = 'uploads')
  with check (bucket_id = 'uploads');

  drop policy if exists "Public delete uploads" on storage.objects;
  create policy "Public delete uploads" on storage.objects for
  delete using (bucket_id = 'uploads');
exception
  when insufficient_privilege then
    raise notice 'Skipping storage.objects policies for uploads (insufficient privilege).';
end $$;
