-- =====================================================================
-- Bountix Tencent Chat identity mapping
-- =====================================================================
--
-- Adds a stable Tencent Chat user ID to profiles so the Supabase user
-- remains the source of truth while Tencent Chat uses a valid IM user ID
-- format.
--
-- The Tencent user ID is a deterministic, non-secret hash of the
-- Supabase profile id, prefixed with "bx_". This keeps it immutable,
-- unique, and valid for Tencent Chat's userID constraints.
-- =====================================================================

create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists tencent_user_id text;

comment on column public.profiles.tencent_user_id is
  'Deterministic Tencent Chat user ID derived from the Supabase profile id.';

update public.profiles
set tencent_user_id = 'bx_' || left(encode(digest(id::text, 'sha256'), 'hex'), 24)
where tencent_user_id is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_tencent_user_id_format_ck'
  ) then
    alter table public.profiles
      add constraint profiles_tencent_user_id_format_ck
      check (tencent_user_id ~ '^bx_[a-f0-9]{24}$');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_tencent_user_id_key'
  ) then
    alter table public.profiles
      add constraint profiles_tencent_user_id_key
      unique (tencent_user_id);
  end if;
end;
$$;

alter table public.profiles
  alter column tencent_user_id set not null;

create index if not exists profiles_tencent_user_id_idx
  on public.profiles (tencent_user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
  suffix int := 0;
  tencent_id text;
begin
  candidate := 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8);
  tencent_id := 'bx_' || left(encode(digest(NEW.id::text, 'sha256'), 'hex'), 24);

  -- Guard against the extremely rare prefix collision.
  while exists (select 1 from public.profiles where username = candidate) loop
    suffix := suffix + 1;
    candidate := 'user_'
      || substr(replace(NEW.id::text, '-', ''), 1, 8)
      || suffix::text;
  end loop;

  insert into public.profiles (id, username, tencent_user_id)
  values (NEW.id, candidate, tencent_id)
  on conflict (id) do nothing;

  return NEW;
end;
$$;

