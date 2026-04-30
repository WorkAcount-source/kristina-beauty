-- Kristina Place Of Beauty - Initial Schema
-- ============================================================

create extension if not exists "pgcrypto";

-- =========================
-- PROFILES (extends auth.users)
-- =========================
create type user_role as enum ('customer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- helper: is current user admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- =========================
-- SERVICES
-- =========================
create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_min int not null,
  price numeric(10,2) not null,
  image_url text,
  category_id uuid references public.service_categories(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================
-- BUSINESS HOURS / BLOCKED SLOTS
-- =========================
create table public.business_hours (
  weekday smallint primary key check (weekday between 0 and 6),
  open_time time,
  close_time time,
  closed boolean not null default false
);

create table public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text
);

-- =========================
-- BOOKINGS
-- =========================
create type booking_status as enum ('pending','confirmed','cancelled','completed');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  service_id uuid not null references public.services(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status booking_status not null default 'confirmed',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  notes text,
  created_at timestamptz not null default now(),
  constraint bookings_time_check check (end_at > start_at)
);
create index bookings_start_at_idx on public.bookings(start_at);
create index bookings_user_idx on public.bookings(user_id);

-- =========================
-- PRODUCTS / ORDERS
-- =========================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  category text,
  stock int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create type order_status as enum ('pending','paid','shipped','delivered','cancelled','refunded');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  total numeric(10,2) not null,
  status order_status not null default 'pending',
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address jsonb,
  payment_intent_id text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  qty int not null,
  unit_price numeric(10,2) not null
);

-- =========================
-- COURSES / ENROLLMENTS
-- =========================
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  content text,
  duration_min int not null,
  price numeric(10,2) not null,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create type enrollment_status as enum ('pending','active','completed','cancelled');

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id),
  status enrollment_status not null default 'active',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- =========================
-- PORTFOLIO / INSTAGRAM / CONTACT / SETTINGS
-- =========================
create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  post_url text not null,
  thumbnail_url text not null,
  caption text,
  sort_order int not null default 0
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null
);

-- =========================
-- ROW LEVEL SECURITY
-- =========================
alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.business_hours enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;

-- Profiles
create policy "profiles_self_read" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- Public-readable catalogs
create policy "services_public_read" on public.services for select using (active or public.is_admin());
create policy "services_admin_write" on public.services for all using (public.is_admin()) with check (public.is_admin());
create policy "service_cat_public_read" on public.service_categories for select using (true);
create policy "service_cat_admin_write" on public.service_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products_public_read" on public.products for select using (active or public.is_admin());
create policy "products_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "courses_public_read" on public.courses for select using (active or public.is_admin());
create policy "courses_admin_write" on public.courses for all using (public.is_admin()) with check (public.is_admin());

create policy "portfolio_public_read" on public.portfolio_items for select using (true);
create policy "portfolio_admin_write" on public.portfolio_items for all using (public.is_admin()) with check (public.is_admin());

create policy "instagram_public_read" on public.instagram_posts for select using (true);
create policy "instagram_admin_write" on public.instagram_posts for all using (public.is_admin()) with check (public.is_admin());

create policy "hours_public_read" on public.business_hours for select using (true);
create policy "hours_admin_write" on public.business_hours for all using (public.is_admin()) with check (public.is_admin());

create policy "blocked_public_read" on public.blocked_slots for select using (true);
create policy "blocked_admin_write" on public.blocked_slots for all using (public.is_admin()) with check (public.is_admin());

create policy "settings_public_read" on public.site_settings for select using (true);
create policy "settings_admin_write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- Bookings: anyone can create, owner can read, admin all
create policy "bookings_insert_any" on public.bookings for insert with check (true);
create policy "bookings_select_own" on public.bookings for select using (auth.uid() = user_id or public.is_admin());
create policy "bookings_update_own" on public.bookings for update using (auth.uid() = user_id or public.is_admin());
create policy "bookings_admin_delete" on public.bookings for delete using (public.is_admin());

-- Orders
create policy "orders_insert_any" on public.orders for insert with check (true);
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_admin_update" on public.orders for update using (public.is_admin());
create policy "order_items_insert_any" on public.order_items for insert with check (true);
create policy "order_items_select_own" on public.order_items for select using (
  exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);

-- Enrollments
create policy "enroll_insert_self" on public.enrollments for insert with check (auth.uid() = user_id);
create policy "enroll_select_own" on public.enrollments for select using (auth.uid() = user_id or public.is_admin());
create policy "enroll_admin_all" on public.enrollments for all using (public.is_admin()) with check (public.is_admin());

-- Contact
create policy "contact_insert_any" on public.contact_messages for insert with check (true);
create policy "contact_admin_read" on public.contact_messages for select using (public.is_admin());

-- =========================
-- BOOKING CONFLICT FUNCTION
-- =========================
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
