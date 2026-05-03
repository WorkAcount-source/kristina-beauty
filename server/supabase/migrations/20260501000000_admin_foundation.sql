-- =============================================================================
-- Admin Foundation
-- Storage buckets, audit logging, soft-delete helpers, additional columns.
-- =============================================================================

-- ---------- Storage buckets ---------------------------------------------------
-- Two public-read buckets. Write is restricted to authenticated admins via RLS
-- on storage.objects (below).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media-images', 'media-images', true, 5242880,   array['image/jpeg','image/png','image/webp','image/avif','image/gif']),
  ('media-videos', 'media-videos', true, 52428800,  array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------- Storage RLS -------------------------------------------------------
-- Reads are public (the `public` flag on the bucket is enough — Supabase auto-
-- generates a public read policy). For writes we add admin-only policies.

drop policy if exists "media_admin_insert"  on storage.objects;
drop policy if exists "media_admin_update"  on storage.objects;
drop policy if exists "media_admin_delete"  on storage.objects;

create policy "media_admin_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('media-images','media-videos')
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('media-images','media-videos')
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('media-images','media-videos')
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ---------- updated_at columns + trigger -------------------------------------
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'profiles','services','service_categories','products','courses',
      'portfolio_items','instagram_posts','contact_messages','site_settings',
      'business_hours','blocked_slots','bookings','orders','enrollments'
    ])
  loop
    execute format(
      'alter table public.%I add column if not exists updated_at timestamptz not null default now()',
      t
    );
  end loop;
end $$;

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'profiles','services','service_categories','products','courses',
      'portfolio_items','instagram_posts','contact_messages','site_settings',
      'business_hours','blocked_slots','bookings','orders','enrollments'
    ])
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.tg_set_updated_at()',
      t
    );
  end loop;
end $$;

-- ---------- contact_messages: read/archive workflow --------------------------
alter table public.contact_messages
  add column if not exists read_at      timestamptz,
  add column if not exists archived_at  timestamptz;

-- Allow admins to update messages (mark read / archive) and delete them.
drop policy if exists "contact_admin_update" on public.contact_messages;
drop policy if exists "contact_admin_delete" on public.contact_messages;

create policy "contact_admin_update" on public.contact_messages
  for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "contact_admin_delete" on public.contact_messages
  for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ---------- courses: add video_url for embeds (YouTube/Vimeo/Mux) ------------
alter table public.courses
  add column if not exists video_url text;

-- ---------- audit_logs --------------------------------------------------------
create table if not exists public.audit_logs (
  id          bigserial primary key,
  actor_id    uuid references auth.users(id) on delete set null,
  actor_email text,
  action      text not null check (action in ('insert','update','delete')),
  table_name  text not null,
  record_id   text,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_logs_table_idx       on public.audit_logs(table_name);
create index if not exists audit_logs_actor_idx       on public.audit_logs(actor_id);
create index if not exists audit_logs_created_at_idx  on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_admin_read"   on public.audit_logs;
drop policy if exists "audit_admin_insert" on public.audit_logs;

-- Only admins can read the audit log.
create policy "audit_admin_read" on public.audit_logs
  for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- The audit trigger runs as `security definer` so it bypasses RLS for inserts;
-- no permissive insert policy is needed.

-- ---------- audit trigger -----------------------------------------------------
create or replace function public.tg_audit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text;
  v_id    text;
begin
  begin
    select email into v_email from auth.users where id = auth.uid();
  exception when others then v_email := null;
  end;

  if tg_op = 'DELETE' then
    v_id := coalesce(old.id::text, null);
    insert into public.audit_logs(actor_id, actor_email, action, table_name, record_id, before, after)
    values (auth.uid(), v_email, 'delete', tg_table_name, v_id, to_jsonb(old), null);
    return old;
  elsif tg_op = 'UPDATE' then
    v_id := coalesce(new.id::text, old.id::text, null);
    insert into public.audit_logs(actor_id, actor_email, action, table_name, record_id, before, after)
    values (auth.uid(), v_email, 'update', tg_table_name, v_id, to_jsonb(old), to_jsonb(new));
    return new;
  else -- INSERT
    v_id := coalesce(new.id::text, null);
    insert into public.audit_logs(actor_id, actor_email, action, table_name, record_id, before, after)
    values (auth.uid(), v_email, 'insert', tg_table_name, v_id, null, to_jsonb(new));
    return new;
  end if;
end;
$$;

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'services','service_categories','products','courses','portfolio_items',
      'instagram_posts','contact_messages','site_settings','business_hours',
      'blocked_slots','bookings','orders','enrollments','profiles'
    ])
  loop
    execute format('drop trigger if exists audit_trg on public.%I', t);
    execute format(
      'create trigger audit_trg after insert or update or delete on public.%I
       for each row execute function public.tg_audit()',
      t
    );
  end loop;
end $$;

-- ---------- helpful index on bookings.start_at --------------------------------
create index if not exists bookings_start_at_idx on public.bookings(start_at);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
