-- Fikrlar moderatsiyasiz darhol devorda chiqadi (spam filtrlari saqlanadi).
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
  new.status  := 'approved';
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
