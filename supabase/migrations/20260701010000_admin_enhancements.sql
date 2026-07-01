-- Migration: Admin Dashboard Enhancements (Phase 5.0.5)

-- ==========================================
-- 1. FEATURE FLAGS
-- ==========================================
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;

-- Policies: Read-only for authenticated, full management for admins
create policy "feature_flags_select_all" on public.feature_flags 
  for select to authenticated using (true);

create policy "feature_flags_all_admin" on public.feature_flags 
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

grant select on table public.feature_flags to authenticated;
grant select, insert, update, delete on table public.feature_flags to service_role;

-- Seed default feature flags
insert into public.feature_flags (key, enabled, description) values
  ('voice_chat', false, 'Enable real-time voice chat and text-to-speech tutoring responses.'),
  ('image_analysis', true, 'Enable diagram understanding and image scanning features.'),
  ('ocr', true, 'Enable screenshot text extraction processes.'),
  ('premium_features', false, 'Unlock advanced RAG filters and customized billing limits.'),
  ('android_beta', false, 'Expose Android beta application installer download channels.'),
  ('whatsapp_bot', false, 'Enable study integrations with WhatsApp chatbot services.')
on conflict (key) do nothing;


-- ==========================================
-- 2. REFERRAL SYSTEM
-- ==========================================
create table if not exists public.referral_codes (
  code text primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid not null unique references auth.users(id) on delete cascade,
  code_used text references public.referral_codes(code) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'rewarded')),
  created_at timestamptz not null default now()
);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  referral_id uuid references public.referrals(id) on delete set null,
  reward_type text not null,
  status text not null default 'active' check (status in ('active', 'used', 'expired')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;

-- Policies: Users manage their own code/rewards; admins manage everything
create policy "referral_codes_select_own" on public.referral_codes for select to authenticated using (auth.uid() = user_id);
create policy "referral_codes_insert_own" on public.referral_codes for insert to authenticated with check (auth.uid() = user_id);
create policy "referral_codes_select_admin" on public.referral_codes for select to authenticated using (public.is_admin(auth.uid()));

create policy "referrals_select_own" on public.referrals for select to authenticated using (auth.uid() = referrer_id or auth.uid() = referred_id);
create policy "referrals_select_admin" on public.referrals for select to authenticated using (public.is_admin(auth.uid()));

create policy "referral_rewards_select_own" on public.referral_rewards for select to authenticated using (auth.uid() = user_id);
create policy "referral_rewards_select_admin" on public.referral_rewards for select to authenticated using (public.is_admin(auth.uid()));

grant select, insert on table public.referral_codes to authenticated;
grant select on table public.referrals to authenticated;
grant select on table public.referral_rewards to authenticated;

grant select, insert, update, delete on table public.referral_codes to service_role;
grant select, insert, update, delete on table public.referrals to service_role;
grant select, insert, update, delete on table public.referral_rewards to service_role;


-- ==========================================
-- 3. ORGANIZATIONS (MULTI-TENANCY)
-- ==========================================
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_roles (
  role_name text primary key,
  permissions jsonb not null default '[]'::jsonb
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null references public.organization_roles(role_name),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.organization_roles enable row level security;
alter table public.organization_members enable row level security;

-- Policies: Members read org context, admins override
create policy "organizations_select_member" on public.organizations 
  for select to authenticated using (
    exists (
      select 1 from public.organization_members m 
      where m.organization_id = id and m.user_id = auth.uid()
    ) or public.is_admin(auth.uid())
  );

create policy "organizations_all_admin" on public.organizations 
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "organization_roles_select_all" on public.organization_roles 
  for select to authenticated using (true);

create policy "organization_members_select_member" on public.organization_members 
  for select to authenticated using (
    user_id = auth.uid() or 
    exists (
      select 1 from public.organization_members m 
      where m.organization_id = organization_id and m.user_id = auth.uid() and m.role = 'admin'
    ) or public.is_admin(auth.uid())
  );

create policy "organization_members_all_admin" on public.organization_members 
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

grant select on table public.organizations to authenticated;
grant select on table public.organization_roles to authenticated;
grant select on table public.organization_members to authenticated;

grant select, insert, update, delete on table public.organizations to service_role;
grant select, insert, update, delete on table public.organization_roles to service_role;
grant select, insert, update, delete on table public.organization_members to service_role;

-- Seed default roles
insert into public.organization_roles (role_name, permissions) values
  ('owner', '["org.manage", "members.invite", "members.remove", "billing.manage", "workspace.read", "workspace.write"]'::jsonb),
  ('admin', '["members.invite", "members.remove", "workspace.read", "workspace.write"]'::jsonb),
  ('member', '["workspace.read", "workspace.write"]'::jsonb),
  ('viewer', '["workspace.read"]'::jsonb)
on conflict (role_name) do nothing;
