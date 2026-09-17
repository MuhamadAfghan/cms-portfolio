create extension if not exists "pgcrypto";

create table if not exists public.review (
    id uuid primary key default gen_random_uuid (),
    name text,
    role text not null,
    company_name text,
    rating numeric(2, 1) not null default 5 check (
        rating >= 0
        and rating <= 5
    ),
    review text not null,
    is_private boolean not null default false,
    sort_order integer not null default 0,
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

drop trigger if exists trg_review_updated_at on public.review;

create trigger trg_review_updated_at
before update on public.review
for each row execute function public.set_updated_at();

alter table public.review enable row level security;

drop policy if exists "Public read review" on public.review;

create policy "Public read review" on public.review for
select using (true);

drop policy if exists "Public insert review" on public.review;

create policy "Public insert review" on public.review for
insert
with
    check (true);

drop policy if exists "Public update review" on public.review;

create policy "Public update review" on public.review for
update using (true)
with
    check (true);

drop policy if exists "Public delete review" on public.review;

create policy "Public delete review" on public.review for delete using (true);

-- Seed initial reviews (only when the table is empty).
insert into
    public.review (
        name,
        role,
        company_name,
        rating,
        review,
        is_private,
        sort_order
    )
select *
from (
        values (
                'Raihan', 'CEO & Founder', 'Travel Agency', 5.0, 'Hasil kerja melebihi ekspektasi. Kemampuan teknis yang solid, pengerjaan tepat waktu, dan harga yang sangat terjangkau. Fokus pada UX dan keamanan sangat kami hargai.', false, 0
            ),
            (
                'Adzka', 'Mahasiswa', 'Universitas Pakuan', 5.0, 'Membantu saya menyelesaikan project sempro dengan sangat baik. Responnya cepat dan sabar dalam menjelaskan konsep-konsep yang sulit.', false, 1
            ),
            (
                'Thufa', 'HR Manager', 'Travel Agency', 5.0, 'Keren banget, harga murah, pengerjaannya cepet banget, minta hosting 3 hari, gada sehari udah kelar. pake dukun ya?, hahaha', false, 2
            ),
            (
                null, 'Mahasiswa', null, 4.8, 'Secara keseluruhan baik-baik saja, perlu peningkatan dalam hal efisiensi kode agar lebih terukur.', true, 3
            ),
            (
                null, 'Mahasiswa', null, 5.0, 'Dapat mencari solusi dengan budget terbatas dan waktu yang singkat. Minta zoom berkali-kali buat minta jelasin tetep sabar, Makasi banyak mas.', true, 4
            ),
            (
                'Anya', 'Pelajar', null, 4.8, 'Harga bersahabat dan kualitas tetap terjaga. Ketika ada revisi atau ada error, responsnya cepat dan solutif. Good service, thank u.', true, 5
            )
    ) as seed (
        name,
        role,
        company_name,
        rating,
        review,
        is_private,
        sort_order
    )
where not exists (
        select 1
        from public.review
    );
