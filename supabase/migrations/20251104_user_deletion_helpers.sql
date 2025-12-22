-- Minimal helpers to preview and delete user-related public data
-- Creates two functions in public schema:
-- - public.preview_user_deletion(uuid)
-- - public.delete_user_cascade(uuid)
-- These only touch public tables and do NOT delete from auth.users

create or replace function public.preview_user_deletion(p_user_id uuid)
returns table (
  schema_name text,
  table_name text,
  column_name text,
  affected_rows bigint
) language plpgsql security definer set search_path = public as $$
begin
  for schema_name, table_name, column_name in
    with fk as (
      select n.nspname as schema_name, c.relname as table_name, a.attname as column_name
      from pg_constraint co
      join pg_class c on co.conrelid = c.oid
      join pg_namespace n on c.relnamespace = n.oid
      join pg_attribute a on a.attrelid = c.oid and a.attnum = any(co.conkey)
      join pg_class rc on co.confrelid = rc.oid
      join pg_namespace rn on rc.relnamespace = rn.oid
      join pg_attribute ra on ra.attrelid = rc.oid and ra.attnum = any(co.confkey)
      where co.contype = 'f' and n.nspname = 'public' and (
        (rn.nspname = 'public' and rc.relname = 'profiles' and ra.attname = 'id') or
        (rn.nspname = 'auth' and rc.relname = 'users' and ra.attname = 'id')
      )
    )
    select schema_name, table_name, column_name from fk
  loop
    return query execute format('select %L::text, %L::text, %L::text, count(*)::bigint from %I.%I where %I = $1',
                               schema_name, table_name, column_name, schema_name, table_name, column_name)
      using p_user_id;
  end loop;
end;
$$;

comment on function public.preview_user_deletion(uuid) is 'Preview counts of rows referencing a user UUID via FKs to public.profiles(id) or auth.users(id).';

create or replace function public.delete_user_cascade(p_user_id uuid)
returns table (
  schema_name text,
  table_name text,
  column_name text,
  deleted_rows bigint
) language plpgsql security definer set search_path = public as $$
declare
  r record;
  v_deleted bigint;
begin
  for r in
    with fk as (
      select n.nspname as schema_name, c.relname as table_name, a.attname as column_name, co.confdeltype as on_delete_action
      from pg_constraint co
      join pg_class c on co.conrelid = c.oid
      join pg_namespace n on c.relnamespace = n.oid
      join pg_attribute a on a.attrelid = c.oid and a.attnum = any(co.conkey)
      join pg_class rc on co.confrelid = rc.oid
      join pg_namespace rn on rc.relnamespace = rn.oid
      join pg_attribute ra on ra.attrelid = rc.oid and ra.attnum = any(co.confkey)
      where co.contype = 'f' and n.nspname = 'public' and (
        (rn.nspname = 'public' and rc.relname = 'profiles' and ra.attname = 'id') or
        (rn.nspname = 'auth' and rc.relname = 'users' and ra.attname = 'id')
      )
    )
    select * from fk
  loop
    if r.on_delete_action <> 'c' then
      execute format('delete from %I.%I where %I = $1', r.schema_name, r.table_name, r.column_name)
      using p_user_id;
      get diagnostics v_deleted = row_count;
      return next (r.schema_name, r.table_name, r.column_name, v_deleted);
    else
      execute format('select count(*) from %I.%I where %I = $1', r.schema_name, r.table_name, r.column_name)
      into v_deleted using p_user_id;
      return next (r.schema_name, r.table_name, r.column_name, v_deleted);
    end if;
  end loop;

  execute 'delete from public.profiles where id = $1' using p_user_id;
  get diagnostics v_deleted = row_count;
  return