-- Fikr uzunligi: 10..300 belgi
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.pride_messages'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%message%240%'
  loop
    execute format('alter table public.pride_messages drop constraint %I', c);
  end loop;
end $$;

alter table public.pride_messages
  add constraint pride_message_len check (char_length(btrim(message)) between 10 and 300);
