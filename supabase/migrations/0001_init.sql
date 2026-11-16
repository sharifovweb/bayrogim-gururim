-- ============================================================================
-- BAYROG‘IM — G‘URURIM · boshlang‘ich sxema
-- Supabase SQL Editor'da yoki `supabase db push` orqali ishga tushiriladi.
-- Tamoyillar:
--   * anonim foydalanuvchi faqat QO‘SHA oladi, shaxsiy qatorlarni O‘QIY olmaydi;
--   * ommaviy statistika faqat yig‘ma (agregat) ko‘rinishda funksiya orqali beriladi;
--   * fikrlar faqat administrator tasdig‘idan keyin ko‘rinadi;
--   * viktorina va karta uchun ism bazaga umuman yozilmaydi.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Yordamchi: hudud kodlari
-- ---------------------------------------------------------------------------
create or replace function public.valid_region(r text)
returns boolean
language sql
immutable
as $$
  select r = any (array[
    'qoraqalpogiston','andijon','buxoro','fargona','jizzax','xorazm','namangan',
    'navoiy','qashqadaryo','samarqand','sirdaryo','surxondaryo','toshkent_v','toshkent_sh'
  ]);
$$;

-- ---------------------------------------------------------------------------
-- Administratorlar
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- Siyosat yo‘q: jadvalni faqat service_role (SQL Editor) boshqaradi.
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Jadvallar
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_results (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  region     text not null check (public.valid_region(region)),
  score      smallint not null check (score between 0 and 15)
);
create index if not exists quiz_results_session_idx on public.quiz_results (session_id, created_at desc);
create index if not exists quiz_results_region_idx  on public.quiz_results (region);

create table if not exists public.cards (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null,
  region     text not null check (public.valid_region(region)),
  template   text not null check (template in ('tun','oq','yashil','uchrang'))
);
create index if not exists cards_session_idx on public.cards (session_id, created_at desc);
create index if not exists cards_region_idx  on public.cards (region);

create table if not exists public.pride_messages (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  session_id   uuid not null,
  name         text not null check (char_length(btrim(name)) between 2 and 60),
  region       text not null check (public.valid_region(region)),
  message      text not null check (char_length(btrim(message)) between 10 and 240),
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  moderated_at timestamptz,
  moderated_by uuid references auth.users (id) on delete set null
);
create index if not exists pride_status_idx  on public.pride_messages (status, created_at desc);
create index if not exists pride_session_idx on public.pride_messages (session_id, created_at desc);

create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

insert into public.site_content (key, value) values
  ('announcement', '{"text": "", "active": false}'::jsonb),
  ('wall_open',    '{"value": true}'::jsonb)
on conflict (key) do nothing;

-- Spam so‘zlari ro‘yxati (administrator SQL Editor orqali to‘ldiradi)
create table if not exists public.blocked_words (
  word text primary key check (word = lower(word) and char_length(word) >= 3)
);
alter table public.blocked_words enable row level security;
revoke all on public.blocked_words from anon, authenticated;

insert into public.blocked_words (word) values
  ('kazino'), ('casino'), ('1xbet'), ('stavka'), ('bukmeker'), ('kredit ber'), ('obuna bo')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Triggerlar: tezlik cheklovi va kontent filtri
-- ---------------------------------------------------------------------------
-- TG_ARGV[0] = ruxsat etilgan yozuvlar soni, TG_ARGV[1] = vaqt oralig‘i
create or replace function public.enforce_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  lim int := tg_argv[0]::int;
  win interval := tg_argv[1]::interval;
  cnt int;
begin
  execute format(
    'select count(*) from public.%I where session_id = $1 and created_at > now() - $2',
    tg_table_name
  ) into cnt using new.session_id, win;

  if cnt >= lim then
    raise exception 'rate_limit' using errcode = 'P0001';
  end if;

  new.id := gen_random_uuid();
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists quiz_rate_limit on public.quiz_results;
create trigger quiz_rate_limit before insert on public.quiz_results
  for each row execute function public.enforce_rate_limit('5', '1 hour');

drop trigger if exists cards_rate_limit on public.cards;
create trigger cards_rate_limit before insert on public.cards
  for each row execute function public.enforce_rate_limit('20', '1 hour');

drop trigger if exists pride_rate_limit on public.pride_messages;
create trigger pride_rate_limit before insert on public.pride_messages
  for each row execute function public.enforce_rate_limit('3', '1 day');

create or replace function public.pride_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  txt text;
begin
  if not coalesce((select (value ->> 'value')::boolean from public.site_content where key = 'wall_open'), true) then
    raise exception 'wall_closed' using errcode = 'P0001';
  end if;

  new.name    := regexp_replace(btrim(new.name), '\s+', ' ', 'g');
  new.message := regexp_replace(btrim(new.message), '\s+', ' ', 'g');
  new.status  := 'pending';
  new.moderated_at := null;
  new.moderated_by := null;

  txt := lower(new.name || ' ' || new.message);

  -- havolalar, telefon raqamlari va foydalanuvchi nomlari — reklama belgisi
  if txt ~ '(https?://|www\.|t\.me/|@[a-z0-9_]{4,}|\.(com|ru|uz|net|org|io)\M|\+?\d[\d \-()]{8,}\d)' then
    raise exception 'blocked_content' using errcode = 'P0001';
  end if;

  -- bir xil belgini ketma-ket takrorlash
  if txt ~ '(.)\1{6,}' then
    raise exception 'blocked_content' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.blocked_words w where position(w.word in txt) > 0) then
    raise exception 'blocked_content' using errcode = 'P0001';
  end if;

  -- shu sessiyadan aynan shu matn avval yuborilganmi
  if exists (
    select 1 from public.pride_messages p
    where p.session_id = new.session_id and lower(p.message) = lower(new.message)
  ) then
    raise exception 'duplicate' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists pride_validate on public.pride_messages;
create trigger pride_validate before insert on public.pride_messages
  for each row execute function public.pride_before_insert();

-- Moderatsiya: faqat status o‘zgaradi, matnni administrator ham tahrirlay olmaydi
create or replace function public.pride_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  new.id := old.id;
  new.created_at := old.created_at;
  new.session_id := old.session_id;
  new.name := old.name;
  new.region := old.region;
  new.message := old.message;
  new.moderated_at := now();
  new.moderated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists pride_moderate on public.pride_messages;
create trigger pride_moderate before update on public.pride_messages
  for each row execute function public.pride_before_update();

create or replace function public.site_content_touch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before insert or update on public.site_content
  for each row execute function public.site_content_touch();

-- ---------------------------------------------------------------------------
-- RLS va ustun darajasidagi huquqlar
-- ---------------------------------------------------------------------------
alter table public.quiz_results   enable row level security;
alter table public.cards          enable row level security;
alter table public.pride_messages enable row level security;
alter table public.site_content   enable row level security;

revoke all on public.quiz_results, public.cards, public.pride_messages, public.site_content
  from anon, authenticated;

-- Viktorina natijalari: faqat qo‘shish. Hech kim (administrator ham) alohida
-- qatorlarni brauzerdan o‘qimaydi — statistika funksiyalar orqali olinadi.
grant insert (session_id, region, score) on public.quiz_results to anon, authenticated;
drop policy if exists quiz_insert on public.quiz_results;
create policy quiz_insert on public.quiz_results for insert to anon, authenticated with check (true);

grant insert (session_id, region, template) on public.cards to anon, authenticated;
drop policy if exists cards_insert on public.cards;
create policy cards_insert on public.cards for insert to anon, authenticated with check (true);

-- Fikrlar: session_id ustuni tashqariga chiqmaydi
grant insert (session_id, name, region, message) on public.pride_messages to anon, authenticated;
grant select (id, created_at, name, region, message, status, moderated_at)
  on public.pride_messages to anon, authenticated;
grant update (status) on public.pride_messages to authenticated;
grant delete on public.pride_messages to authenticated;

drop policy if exists pride_insert on public.pride_messages;
create policy pride_insert on public.pride_messages for insert to anon, authenticated with check (true);

drop policy if exists pride_select on public.pride_messages;
create policy pride_select on public.pride_messages for select to anon, authenticated
  using (status = 'approved' or public.is_admin());

drop policy if exists pride_update on public.pride_messages;
create policy pride_update on public.pride_messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists pride_delete on public.pride_messages;
create policy pride_delete on public.pride_messages for delete to authenticated
  using (public.is_admin());

-- Sayt kontenti: hamma o‘qiydi, faqat administrator o‘zgartiradi
grant select (key, value, updated_at) on public.site_content to anon, authenticated;
grant insert (key, value), update (value) on public.site_content to authenticated;

drop policy if exists content_select on public.site_content;
create policy content_select on public.site_content for select to anon, authenticated using (true);

drop policy if exists content_insert on public.site_content;
create policy content_insert on public.site_content for insert to authenticated with check (public.is_admin());

drop policy if exists content_update on public.site_content;
create policy content_update on public.site_content for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Ommaviy statistika (faqat yig‘ma sonlar)
-- ---------------------------------------------------------------------------
create or replace function public.get_public_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with acts as (
    select session_id, region, 'quiz'::text as kind, true as visible from public.quiz_results
    union all
    select session_id, region, 'card', true from public.cards
    union all
    select session_id, region, 'wall', status = 'approved' from public.pride_messages where status <> 'rejected'
  ),
  by_region as (
    select
      region,
      count(distinct session_id)                         as participants,
      count(*) filter (where kind = 'quiz')              as quiz,
      count(*) filter (where kind = 'card')              as cards,
      count(*) filter (where kind = 'wall' and visible)  as messages
    from acts
    group by region
  ),
  dist as (
    select s.score, count(q.id) as n
    from generate_series(0, 15) as s(score)
    left join public.quiz_results q on q.score = s.score
    group by s.score
  )
  select jsonb_build_object(
    'participants',  (select count(distinct session_id) from acts),
    'quiz_attempts', (select count(*) from public.quiz_results),
    'quiz_average',  (select round(avg(score)::numeric, 1) from public.quiz_results),
    'quiz_perfect',  (select count(*) from public.quiz_results where score = 15),
    'cards',         (select count(*) from public.cards),
    'messages',      (select count(*) from public.pride_messages where status = 'approved'),
    'distribution',  (select coalesce(jsonb_agg(jsonb_build_object('score', score, 'count', n) order by score), '[]'::jsonb) from dist),
    'regions',       (select coalesce(jsonb_agg(to_jsonb(r) order by r.participants desc, r.region), '[]'::jsonb) from by_region r),
    'generated_at',  now()
  );
$$;
grant execute on function public.get_public_stats() to anon, authenticated;

-- Administrator uchun qo‘shimcha ko‘rsatkichlar
create or replace function public.get_admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'pending',  (select count(*) from public.pride_messages where status = 'pending'),
    'approved', (select count(*) from public.pride_messages where status = 'approved'),
    'rejected', (select count(*) from public.pride_messages where status = 'rejected'),
    'today', jsonb_build_object(
      'quiz',     (select count(*) from public.quiz_results   where created_at >= date_trunc('day', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent'),
      'cards',    (select count(*) from public.cards          where created_at >= date_trunc('day', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent'),
      'messages', (select count(*) from public.pride_messages where created_at >= date_trunc('day', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent')
    ),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'count', d.n) order by d.day), '[]'::jsonb)
      from (
        select (created_at at time zone 'Asia/Tashkent')::date as day, count(*) as n
        from (
          select created_at from public.quiz_results
          union all select created_at from public.cards
          union all select created_at from public.pride_messages where status <> 'rejected'
        ) a
        where created_at > now() - interval '14 days'
        group by 1
      ) d
    )
  );
end;
$$;
grant execute on function public.get_admin_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- Birinchi administratorni tayinlash (Authentication → Users'da foydalanuvchi
-- yaratilgach, SQL Editor'da bir marta bajaring):
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'admin@example.uz';
-- ---------------------------------------------------------------------------
