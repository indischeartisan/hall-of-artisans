create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('customer','reviewer','admin','super_admin');
create type public.artisan_id_status as enum ('active','suspended','revoked');

create sequence public.artisan_public_number_seq as bigint start with 1 increment by 1 no cycle;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.next_artisan_public_id()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'HA-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.artisan_public_number_seq')::text, 6, '0');
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.next_artisan_public_id() from public, anon, authenticated;
