-- Create helper functions to preview and delete user-related data safely
-- This migration defines:
-- 1) public.preview_user_deletion(user_id uuid)
-- 2) public.delete_user_cascade(user_id uuid)
--
-- Both functions are SECURITY DEFINER and attempt to bypass RLS by running as their owner.
-- They operate on public tables that reference either public.profiles(id) or auth.users(id).
-- The deletion function removes child rows first, then the public.profiles row.
-- It DOES NOT delete from auth.users; use Admin API for that step.

create or replace function public.preview_user_deletion(p_user_id uuid)
returns table (
  schema_name text,
  table_name text,
  column_name text,
  affected_rows bigint
) language plpgsql security definer set search_path = public as $$
begin
  -- Profile presence check
  -- Optional: ensure profile exists, but preview continues regardless
  -- Loop over all FKs referencing public.profiles(id) or auth.users(id)
  for schema_name, table_name, column_name in
    with fk as (
      -- FKs referencing public.profiles(id)
      select
        n.nspname as schema_name,
        c.relname as table_name,
        a.attname as column_name
      from pg_constraint co
      join pg_class c on co.conrelid = c.oid
      join pg_namespace n on c.relnamespace = n.oid
      join pg_attribute a on a.attrelid = c.oid and a.attnum = any(co.conkey)
      join pg_class rc on co.confrelid = rc.oid
      join pg_namespace rn on rc.relnamespace = rn.oid
      join pg_attribute ra on ra.attrelid = rc.oid and ra.attnum = any(co.confkey)
      where co.contype = 'f'
        and rn.nspname = 'public'
        and rc.relname = 'profiles'
        and ra.attname = 'id'
        and n.nspname = 'public'
      union all
      -- FKs referencing auth.users(id)
      select
        n.nspname as schema_name,
        c.relname as table_name,
        a.attname as column_name
      from pg_constraint co
      join pg_class c on co.conrelid = c.oid
      join pg_namespace n on c.relnamespace = n.oid
      join pg_attribute a on a.attrelid = c.oid and a.attnum = any(co.conkey)
      join pg_class rc on co.confrelid = rc.oid
      join pg_namespace rn on rc.relnamespace = rn.oid
      join pg_attribute ra on ra.attrelid = rc.oid and ra.attnum = any(co.confkey)
      where co.contype = 'f'
        and rn.nspname = 'auth'
        and rc.relname = 'users'
        and ra.attname = 'id'
        and n.nspname = 'public'
    )
    select schema_name, table_name, column_name from fk
  loop
    return query execute format('select %L::text, %L::text, %L::text, count(*)::bigint from %I.%I where %I = $1',
                               schema_name, table_name, column_name, schema_name, table_name, column_name)
      using p_user_id;
  end loop;
end;
$$;

comment on function public.preview_user_deletion(uuid) is 'Preview counts of rows referencing a given user UUID via FKs to public.profiles(id) or auth.users(id).';

-- Delete children first, then the public.profiles row. Does NOT delete auth.users.
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
  -- 1) Delete rows from all tables that reference public.profiles(id) or auth.users(id)
  for r in
    with fk as (
      -- FKs referencing public.profiles(id)
      select
        n.nspname as schema_name,
        c.relname as table_name,
        a.attname as column_name,
        co.oid as constraint_oid,
        co.confdeltype as on_delete_action
      from pg_constraint co
      join pg_class c on co.conrelid = c.oid
      join pg_namespace n on c.relnamespace = n.oid
      join pg_attribute a on a.attrelid = c.oid and a.attnum = any(co.conkey)
      join pg_class rc on co.confrelid = rc.oid
      join pg_namespace rn on rc.relnamespace = rn.oid
      join pg_attribute ra on ra.attrelid = rc.oid and ra.attnum = any(co.confkey)
      where co.contype = 'f'
        and rn.nspname = 'public'
        and rc.relname = 'profiles'
        and ra.attname = 'id'
        and n.nspname = 'public'
      union all
      -- FKs referencing auth.users(id)
      select
        n.nspname as schema_name,
        c.relname as table_name,
        a.attname as column_name,
        co.oid as constraint_oid,
        co.confdeltype as on_delete_action
      from pg_constraint co
      join pg_class c on co.conrelid = c.oid
      join pg_namespace n on c.relnamespace = n.oid
      join pg_attribute a on a.attrelid = c.oid and a.attnum = any(co.conkey)
      join pg_class rc on co.confrelid = rc.oid
      join pg_namespace rn on rc.relnamespace = rn.oid
      join pg_attribute ra on ra.attrelid = rc.oid and ra.attnum = any(co.confkey)
      where co.contype = 'f'
        and rn.nspname = 'auth'
        and rc.relname = 'users'
        and ra.attname = 'id'
        and n.nspname = 'public'
    )
    select * from fk
  loop
    -- Delete only where FK is not CASCADE; otherwise child rows will be removed automatically when deleting parent
    -- co.confdeltype: 'a' = NO ACTION/RESTRICT, 'c' = CASCADE, 'n' = SET NULL, 'd' = SET DEFAULT
    if r.on_delete_action <> 'c' then
      execute format('delete from %I.%I where %I = $1', r.schema_name, r.table_name, r.column_name)
      using p_user_id;
      get diagnostics v_deleted = row_count;
      return next (r.schema_name, r.table_name, r.column_name, v_deleted);
    else
      -- For CASCADE constraints, we only report what would be deleted by parent removal
      execute format('select count(*) from %I.%I where %I = $1', r.schema_name, r.table_name, r.column_name)
      into v_deleted using p_user_id;
      return next (r.schema_name, r.table_name, r.column_name, v_deleted);
    end if;
  end loop;

  -- 2) Delete profile row (this will cascade where defined)
  execute 'delete from public.profiles where id = $1' using p_user_id;
  get diagnostics v_deleted = row_count;
  return next ('public', 'profiles', 'id', v_deleted);

  -- Note: Do NOT delete from auth.users here; use Admin API after running this function.
end;
$$;

comment on function public.delete_user_cascade(uuid) is 'Delete user-related public rows referencing profiles/users, then delete public.pro