-- =============================================================================
-- Kristina Place Of Beauty — Complete Schema
-- Single consolidated migration covering the full database.
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- TYPES
-- =============================================================================
do $$ begin create type user_role        as enum ('customer','admin');            exception when duplicate_object then null; end $$;
do $$ begin create type booking_status   as enum ('pending','confirmed','cancelled','completed'); exception when duplicate_object then null; end $$;
do $$ begin create type order_status     as enum ('pending','paid','shipped','delivered','cancelled','refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type enrollment_status as enum ('pending','active','completed','cancelled');   exception when duplicate_object then null; end $$;

-- =============================================================================
-- TABLES
-- =============================================================================

-- ── profiles ──────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid       primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  role       user_role  not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── service_categories ────────────────────────────────────────────────────────
create table if not exists public.service_categories (
  id         uuid  primary key default gen_random_uuid(),
  name       text  not null,
  sort_order int   not null default 0,
  updated_at timestamptz not null default now()
);

-- ── services ──────────────────────────────────────────────────────────────────
create table if not exists public.services (
  id          uuid           primary key default gen_random_uuid(),
  name        text           not null,
  description text,
  duration_min int           not null,
  price       numeric(10,2)  not null,
  image_url   text,
  category_id uuid           references public.service_categories(id) on delete set null,
  active      boolean        not null default true,
  created_at  timestamptz    not null default now(),
  updated_at  timestamptz    not null default now()
);

-- ── business_hours ────────────────────────────────────────────────────────────
create table if not exists public.business_hours (
  weekday    smallint    primary key check (weekday between 0 and 6),
  open_time  time,
  close_time time,
  closed     boolean     not null default false,
  updated_at timestamptz not null default now()
);

-- ── blocked_slots ─────────────────────────────────────────────────────────────
create table if not exists public.blocked_slots (
  id         uuid        primary key default gen_random_uuid(),
  start_at   timestamptz not null,
  end_at     timestamptz not null,
  reason     text,
  updated_at timestamptz not null default now()
);

-- ── bookings ──────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id             uuid          primary key default gen_random_uuid(),
  user_id        uuid          references auth.users(id) on delete set null,
  service_id     uuid          not null references public.services(id),
  start_at       timestamptz   not null,
  end_at         timestamptz   not null,
  status         booking_status not null default 'confirmed',
  customer_name  text          not null,
  customer_phone text          not null,
  customer_email text,
  notes          text,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now(),
  constraint bookings_time_check check (end_at > start_at)
);
create index if not exists bookings_start_at_idx on public.bookings(start_at);
create index if not exists bookings_user_idx     on public.bookings(user_id);

-- ── products ──────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid          primary key default gen_random_uuid(),
  name        text          not null,
  description text,
  price       numeric(10,2) not null,
  image_url   text,
  category    text,
  stock       int           not null default 0,
  active      boolean       not null default true,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

-- ── orders ────────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid         primary key default gen_random_uuid(),
  user_id          uuid         references auth.users(id) on delete set null,
  total            numeric(10,2) not null,
  status           order_status  not null default 'pending',
  customer_name    text,
  customer_email   text,
  customer_phone   text,
  shipping_address jsonb,
  payment_intent_id text,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- ── order_items ───────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id         uuid          primary key default gen_random_uuid(),
  order_id   uuid          not null references public.orders(id) on delete cascade,
  product_id uuid          not null references public.products(id),
  qty        int           not null,
  unit_price numeric(10,2) not null,
  updated_at timestamptz   not null default now()
);

-- ── courses ───────────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id          uuid          primary key default gen_random_uuid(),
  title       text          not null,
  description text,
  content     text,
  duration_min int          not null,
  price       numeric(10,2) not null,
  image_url   text,
  video_url   text,
  active      boolean       not null default true,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

-- ── enrollments ───────────────────────────────────────────────────────────────
create table if not exists public.enrollments (
  id                uuid              primary key default gen_random_uuid(),
  user_id           uuid              not null references auth.users(id) on delete cascade,
  course_id         uuid              not null references public.courses(id),
  status            enrollment_status not null default 'active',
  stripe_session_id text,
  paid_at           timestamptz,
  created_at        timestamptz       not null default now(),
  updated_at        timestamptz       not null default now(),
  unique (user_id, course_id)
);

-- ── course_chapters ───────────────────────────────────────────────────────────
create table if not exists public.course_chapters (
  id           uuid        primary key default gen_random_uuid(),
  course_id    uuid        not null references public.courses(id) on delete cascade,
  title        text        not null,
  description  text,
  video_url    text,
  duration_min int,
  sort_order   int         not null default 0,
  is_free      boolean     not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists course_chapters_course_idx on public.course_chapters(course_id, sort_order);

-- ── portfolio_items ───────────────────────────────────────────────────────────
create table if not exists public.portfolio_items (
  id          uuid        primary key default gen_random_uuid(),
  title       text,
  description text,
  image_url   text        not null,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── instagram_posts ───────────────────────────────────────────────────────────
create table if not exists public.instagram_posts (
  id            uuid        primary key default gen_random_uuid(),
  post_url      text        not null,
  thumbnail_url text        not null,
  caption       text,
  sort_order    int         not null default 0,
  updated_at    timestamptz not null default now()
);

-- ── contact_messages ──────────────────────────────────────────────────────────
create table if not exists public.contact_messages (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text,
  phone       text,
  message     text        not null,
  read_at     timestamptz,
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── site_settings ─────────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  key        text  primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ── audit_logs ────────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id          bigserial   primary key,
  actor_id    uuid        references auth.users(id) on delete set null,
  actor_email text,
  action      text        not null check (action in ('insert','update','delete')),
  table_name  text        not null,
  record_id   text,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_logs_table_idx      on public.audit_logs(table_name);
create index if not exists audit_logs_actor_idx      on public.audit_logs(actor_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);

-- ── consent_log ───────────────────────────────────────────────────────────────
create table if not exists public.consent_log (
  id             bigserial   primary key,
  user_id        uuid        references auth.users(id) on delete set null,
  email          text,
  consent_type   text        not null check (consent_type in ('terms','privacy','marketing','accessibility')),
  accepted       boolean     not null,
  policy_version text        not null default 'v1.0',
  ip_address     inet,
  user_agent     text,
  source         text,
  created_at     timestamptz not null default now()
);
create index if not exists consent_log_user_idx  on public.consent_log(user_id);
create index if not exists consent_log_email_idx on public.consent_log(lower(email));
create index if not exists consent_log_type_idx  on public.consent_log(consent_type, created_at desc);
comment on table public.consent_log is 'Immutable log of user consent for compliance (Israeli Privacy Protection Law, Spam Law, Equal Rights Act).';

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- New auth user → create profile row
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end; $$;

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

-- Audit trigger (v2 — falls back to row's user_id when called via service role)
create or replace function public.tg_audit()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_actor_id uuid;
  v_email    text;
  v_id       text;
  v_row      jsonb;
begin
  v_actor_id := auth.uid();
  if v_actor_id is null then
    v_row := case tg_op when 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
    begin
      v_actor_id := nullif(v_row ->> 'user_id', '')::uuid;
    exception when others then v_actor_id := null; end;
  end if;
  if v_actor_id is not null then
    begin
      select email into v_email from auth.users where id = v_actor_id;
    exception when others then v_email := null; end;
  end if;
  if tg_op = 'DELETE' then
    v_id := to_jsonb(old) ->> 'id';
    insert into public.audit_logs(actor_id,actor_email,action,table_name,record_id,before,after)
    values (v_actor_id,v_email,'delete',tg_table_name,v_id,to_jsonb(old),null);
    return old;
  elsif tg_op = 'UPDATE' then
    v_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(old) ->> 'id');
    insert into public.audit_logs(actor_id,actor_email,action,table_name,record_id,before,after)
    values (v_actor_id,v_email,'update',tg_table_name,v_id,to_jsonb(old),to_jsonb(new));
    return new;
  else
    v_id := to_jsonb(new) ->> 'id';
    insert into public.audit_logs(actor_id,actor_email,action,table_name,record_id,before,after)
    values (v_actor_id,v_email,'insert',tg_table_name,v_id,null,to_jsonb(new));
    return new;
  end if;
end; $$;

-- Booking availability check
create or replace function public.check_booking_availability(p_start timestamptz, p_end timestamptz)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if exists(
    select 1 from public.bookings
    where status in ('pending','confirmed')
      and tstzrange(start_at, end_at, '[)') && tstzrange(p_start, p_end, '[)')
  ) then return false; end if;
  if exists(
    select 1 from public.blocked_slots
    where tstzrange(start_at, end_at, '[)') && tstzrange(p_start, p_end, '[)')
  ) then return false; end if;
  return true;
end; $$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- New user → profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at on all mutable tables
do $$
declare t text;
begin
  for t in select unnest(array[
    'profiles','services','service_categories','products','courses',
    'portfolio_items','instagram_posts','contact_messages','site_settings',
    'business_hours','blocked_slots','bookings','orders','order_items','enrollments'
  ]) loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.tg_set_updated_at()', t);
  end loop;
end $$;

-- audit on all tables
do $$
declare t text;
begin
  for t in select unnest(array[
    'profiles','services','service_categories','products','courses','course_chapters',
    'portfolio_items','instagram_posts','contact_messages','site_settings',
    'business_hours','blocked_slots','bookings','orders','order_items','enrollments'
  ]) loop
    execute format('drop trigger if exists audit_trg on public.%I', t);
    execute format(
      'create trigger audit_trg after insert or update or delete on public.%I
       for each row execute function public.tg_audit()', t);
  end loop;
end $$;

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('media-images', 'media-images', true, 5242880,  array['image/jpeg','image/png','image/webp','image/avif','image/gif']),
  ('media-videos', 'media-videos', true, 52428800, array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_admin_insert" on storage.objects;
drop policy if exists "media_admin_update" on storage.objects;
drop policy if exists "media_admin_delete" on storage.objects;

create policy "media_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('media-images','media-videos')
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id in ('media-images','media-videos')
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('media-images','media-videos')
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles           enable row level security;
alter table public.service_categories enable row level security;
alter table public.services           enable row level security;
alter table public.business_hours     enable row level security;
alter table public.blocked_slots      enable row level security;
alter table public.bookings           enable row level security;
alter table public.products           enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.courses            enable row level security;
alter table public.enrollments        enable row level security;
alter table public.course_chapters    enable row level security;
alter table public.portfolio_items    enable row level security;
alter table public.instagram_posts    enable row level security;
alter table public.contact_messages   enable row level security;
alter table public.site_settings      enable row level security;
alter table public.audit_logs         enable row level security;
alter table public.consent_log        enable row level security;

-- ── Profiles ──────────────────────────────────────────────────────────────────
drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "profiles_admin_all"   on public.profiles;

create policy "profiles_self_read"   on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_self_update" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles_admin_all"   on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Services & categories ─────────────────────────────────────────────────────
drop policy if exists "services_public_read"    on public.services;
drop policy if exists "services_admin_write"    on public.services;
drop policy if exists "service_cat_public_read" on public.service_categories;
drop policy if exists "service_cat_admin_write" on public.service_categories;

create policy "services_public_read"    on public.services           for select using (active or public.is_admin());
create policy "services_admin_write"    on public.services           for all    using (public.is_admin()) with check (public.is_admin());
create policy "service_cat_public_read" on public.service_categories for select using (true);
create policy "service_cat_admin_write" on public.service_categories for all    using (public.is_admin()) with check (public.is_admin());

-- ── Products ──────────────────────────────────────────────────────────────────
drop policy if exists "products_public_read" on public.products;
drop policy if exists "products_admin_write" on public.products;

create policy "products_public_read" on public.products for select using (active or public.is_admin());
create policy "products_admin_write" on public.products for all    using (public.is_admin()) with check (public.is_admin());

-- ── Courses ───────────────────────────────────────────────────────────────────
drop policy if exists "courses_public_read" on public.courses;
drop policy if exists "courses_admin_write" on public.courses;

create policy "courses_public_read" on public.courses for select using (active or public.is_admin());
create policy "courses_admin_write" on public.courses for all    using (public.is_admin()) with check (public.is_admin());

-- ── Course chapters ───────────────────────────────────────────────────────────
drop policy if exists "chapters_public_read" on public.course_chapters;
drop policy if exists "chapters_admin_write" on public.course_chapters;

create policy "chapters_public_read" on public.course_chapters
  for select using (
    exists (select 1 from public.courses where id = course_id and (active = true or public.is_admin()))
  );

create policy "chapters_admin_write" on public.course_chapters
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Portfolio & Instagram ─────────────────────────────────────────────────────
drop policy if exists "portfolio_public_read" on public.portfolio_items;
drop policy if exists "portfolio_admin_write" on public.portfolio_items;
drop policy if exists "instagram_public_read" on public.instagram_posts;
drop policy if exists "instagram_admin_write" on public.instagram_posts;

create policy "portfolio_public_read" on public.portfolio_items for select using (true);
create policy "portfolio_admin_write" on public.portfolio_items for all    using (public.is_admin()) with check (public.is_admin());
create policy "instagram_public_read" on public.instagram_posts for select using (true);
create policy "instagram_admin_write" on public.instagram_posts for all    using (public.is_admin()) with check (public.is_admin());

-- ── Business hours & blocked slots ───────────────────────────────────────────
drop policy if exists "hours_public_read"   on public.business_hours;
drop policy if exists "hours_admin_write"   on public.business_hours;
drop policy if exists "blocked_public_read" on public.blocked_slots;
drop policy if exists "blocked_admin_write" on public.blocked_slots;

create policy "hours_public_read"   on public.business_hours for select using (true);
create policy "hours_admin_write"   on public.business_hours for all    using (public.is_admin()) with check (public.is_admin());
create policy "blocked_public_read" on public.blocked_slots  for select using (true);
create policy "blocked_admin_write" on public.blocked_slots  for all    using (public.is_admin()) with check (public.is_admin());

-- ── Site settings ─────────────────────────────────────────────────────────────
drop policy if exists "settings_public_read" on public.site_settings;
drop policy if exists "settings_admin_write" on public.site_settings;

create policy "settings_public_read" on public.site_settings for select using (true);
create policy "settings_admin_write" on public.site_settings for all    using (public.is_admin()) with check (public.is_admin());

-- ── Bookings ──────────────────────────────────────────────────────────────────
drop policy if exists "bookings_insert_any"   on public.bookings;
drop policy if exists "bookings_insert_self"  on public.bookings;
drop policy if exists "bookings_select_own"   on public.bookings;
drop policy if exists "bookings_update_own"   on public.bookings;
drop policy if exists "bookings_admin_delete" on public.bookings;

create policy "bookings_insert_self"  on public.bookings for insert to authenticated with check (auth.uid() = user_id);
create policy "bookings_select_own"   on public.bookings for select using (auth.uid() = user_id or public.is_admin());
create policy "bookings_update_own"   on public.bookings for update using (auth.uid() = user_id or public.is_admin());
create policy "bookings_admin_delete" on public.bookings for delete using (public.is_admin());

-- ── Orders ────────────────────────────────────────────────────────────────────
drop policy if exists "orders_insert_any"      on public.orders;
drop policy if exists "orders_insert_self"     on public.orders;
drop policy if exists "orders_select_own"      on public.orders;
drop policy if exists "orders_admin_update"    on public.orders;
drop policy if exists "order_items_insert_any" on public.order_items;
drop policy if exists "order_items_insert_own" on public.order_items;
drop policy if exists "order_items_select_own" on public.order_items;

create policy "orders_insert_self"  on public.orders
  for insert to authenticated with check (auth.uid() = user_id);
create policy "orders_select_own"   on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin());

create policy "order_items_insert_own" on public.order_items
  for insert to authenticated
  with check (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_select_own" on public.order_items
  for select using (
    exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

-- ── Enrollments ───────────────────────────────────────────────────────────────
drop policy if exists "enroll_insert_self" on public.enrollments;
drop policy if exists "enroll_select_own"  on public.enrollments;
drop policy if exists "enroll_admin_all"   on public.enrollments;

create policy "enroll_insert_self" on public.enrollments for insert with check (auth.uid() = user_id);
create policy "enroll_select_own"  on public.enrollments for select using (auth.uid() = user_id or public.is_admin());
create policy "enroll_admin_all"   on public.enrollments for all   using (public.is_admin()) with check (public.is_admin());

-- ── Contact messages ──────────────────────────────────────────────────────────
drop policy if exists "contact_insert_any"   on public.contact_messages;
drop policy if exists "contact_admin_read"   on public.contact_messages;
drop policy if exists "contact_admin_update" on public.contact_messages;
drop policy if exists "contact_admin_delete" on public.contact_messages;

create policy "contact_insert_any" on public.contact_messages
  for insert to anon, authenticated with check (true);
create policy "contact_admin_read" on public.contact_messages
  for select using (public.is_admin());
create policy "contact_admin_update" on public.contact_messages
  for update to authenticated
  using  ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "contact_admin_delete" on public.contact_messages
  for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ── Audit logs ────────────────────────────────────────────────────────────────
drop policy if exists "audit_admin_read"   on public.audit_logs;
drop policy if exists "audit_admin_insert" on public.audit_logs;

create policy "audit_admin_read" on public.audit_logs
  for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ── Consent log ───────────────────────────────────────────────────────────────
drop policy if exists "consent_log_self_read"  on public.consent_log;
drop policy if exists "consent_log_admin_read" on public.consent_log;

create policy "consent_log_self_read" on public.consent_log
  for select using (auth.uid() is not null and user_id = auth.uid());
create policy "consent_log_admin_read" on public.consent_log
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
