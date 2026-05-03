-- ============================================================
-- Consent Log
-- Records explicit user consent for legally-required policies
-- (Israeli Privacy Protection Law, Spam Law (s. 30A), and the
-- Equal Rights for Persons with Disabilities Act / IS 5568).
--
-- Stores: who consented, to what document version, when, from
-- which IP and user-agent. Records are immutable and append-only.
-- ============================================================

create table if not exists public.consent_log (
  id              bigserial primary key,
  user_id         uuid references auth.users(id) on delete set null,
  email           text,
  consent_type    text not null check (consent_type in ('terms','privacy','marketing','accessibility')),
  accepted        boolean not null,
  policy_version  text not null default 'v1.0',
  ip_address      inet,
  user_agent      text,
  source          text,                 -- e.g. 'register', 'oauth', 'account-settings'
  created_at      timestamptz not null default now()
);

create index if not exists consent_log_user_idx     on public.consent_log(user_id);
create index if not exists consent_log_email_idx    on public.consent_log(lower(email));
create index if not exists consent_log_type_idx     on public.consent_log(consent_type, created_at desc);

alter table public.consent_log enable row level security;

-- Users can read only their own consent records
drop policy if exists "consent_log_self_read" on public.consent_log;
create policy "consent_log_self_read"
  on public.consent_log for select
  using (auth.uid() is not null and user_id = auth.uid());

-- Admins can read everything
drop policy if exists "consent_log_admin_read" on public.consent_log;
create policy "consent_log_admin_read"
  on public.consent_log for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Inserts are performed by the API route via service-role; no public insert.
-- We deliberately do NOT add update/delete policies — log is immutable.

comment on table public.consent_log is
  'Immutable log of user consent (terms/privacy/marketing/accessibility) including IP and user-agent for compliance.';
