-- Kristina Place Of Beauty — Auth/Authorization hardening
-- ============================================================
-- This migration tightens RLS so authenticated clients cannot impersonate
-- another user when inserting bookings, orders or order_items. Server-side
-- code that legitimately needs to bypass these constraints (e.g. the
-- /api/checkout route) uses the service-role key.

-- ---------- bookings ----------
drop policy if exists "bookings_insert_any" on public.bookings;
-- Only allow inserts where the authenticated user owns the row.
create policy "bookings_insert_self"
  on public.bookings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------- orders ----------
drop policy if exists "orders_insert_any" on public.orders;
-- Authenticated users may only insert orders that belong to themselves.
-- The /api/checkout route uses the service role to insert, which bypasses RLS.
create policy "orders_insert_self"
  on public.orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------- order_items ----------
drop policy if exists "order_items_insert_any" on public.order_items;
create policy "order_items_insert_own"
  on public.order_items
  for insert
  to authenticated
  with check (
    exists(
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- ---------- contact_messages ----------
-- Anonymous visitors are allowed to submit a contact form, but rate-limiting
-- belongs at the application/edge layer. We re-create the policy explicitly
-- so future audits see it.
drop policy if exists "contact_insert_any" on public.contact_messages;
create policy "contact_insert_any"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- ---------- profiles: prevent privilege escalation ----------
-- Users may update their own profile, but MUST NOT be able to change their
-- role (which would let them grant themselves admin). We replace the old
-- update policy with a check that pins the role to its current value.
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );
