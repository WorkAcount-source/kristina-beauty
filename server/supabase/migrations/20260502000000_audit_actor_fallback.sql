-- =============================================================================
-- Audit trigger v2: capture user_id from the row itself when the trigger
-- runs under the service role (auth.uid() is null in that context).
-- Tables affected: bookings, orders, enrollments — all have a user_id column.
-- =============================================================================

create or replace function public.tg_audit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid;
  v_email    text;
  v_id       text;
  v_row      jsonb;
begin
  -- 1) Prefer the authenticated caller (works for normal RLS-protected
  --    operations done from the browser via the cookie session).
  v_actor_id := auth.uid();

  -- 2) Fallback: when the action came from the service role (e.g. /api/checkout
  --    creating an order on behalf of the logged-in user), pick up the row's
  --    own user_id. Wrapped in a block because not every audited table has it.
  if v_actor_id is null then
    v_row := case tg_op when 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
    begin
      v_actor_id := nullif(v_row ->> 'user_id', '')::uuid;
    exception when others then
      v_actor_id := null;
    end;
  end if;

  if v_actor_id is not null then
    begin
      select email into v_email from auth.users where id = v_actor_id;
    exception when others then v_email := null;
    end;
  end if;

  if tg_op = 'DELETE' then
    v_id := coalesce(old.id::text, null);
    insert into public.audit_logs(actor_id, actor_email, action, table_name, record_id, before, after)
    values (v_actor_id, v_email, 'delete', tg_table_name, v_id, to_jsonb(old), null);
    return old;
  elsif tg_op = 'UPDATE' then
    v_id := coalesce(new.id::text, old.id::text, null);
    insert into public.audit_logs(actor_id, actor_email, action, table_name, record_id, before, after)
    values (v_actor_id, v_email, 'update', tg_table_name, v_id, to_jsonb(old), to_jsonb(new));
    return new;
  else -- INSERT
    v_id := coalesce(new.id::text, null);
    insert into public.audit_logs(actor_id, actor_email, action, table_name, record_id, before, after)
    values (v_actor_id, v_email, 'insert', tg_table_name, v_id, null, to_jsonb(new));
    return new;
  end if;
end;
$$;
