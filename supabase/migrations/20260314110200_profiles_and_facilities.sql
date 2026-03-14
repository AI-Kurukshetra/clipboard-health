create type public.verification_status as enum (
  'pending',
  'verified',
  'rejected'
);

create type public.facility_membership_role as enum (
  'owner',
  'admin',
  'member'
);

create table public.worker_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  location text,
  specialty text,
  years_experience integer check (years_experience >= 0),
  bio text,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facility_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  contact_name text,
  phone text,
  organization_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  facility_type text not null,
  address text not null,
  city text,
  state text,
  postal_code text,
  contact_email text,
  contact_phone text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facility_users (
  facility_id uuid not null references public.facilities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_role public.facility_membership_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (facility_id, user_id)
);

create index idx_facility_users_user_id on public.facility_users(user_id);

create trigger trg_worker_profiles_updated_at
before update on public.worker_profiles
for each row
execute procedure public.set_updated_at();

create trigger trg_facility_profiles_updated_at
before update on public.facility_profiles
for each row
execute procedure public.set_updated_at();

create trigger trg_facilities_updated_at
before update on public.facilities
for each row
execute procedure public.set_updated_at();

create or replace function public.is_facility_admin(target_facility_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.facility_users fu
      where fu.facility_id = target_facility_id
        and fu.user_id = (select auth.uid())
        and fu.membership_role in ('owner', 'admin')
    );
$$;

alter table public.worker_profiles enable row level security;
alter table public.facility_profiles enable row level security;
alter table public.facilities enable row level security;
alter table public.facility_users enable row level security;

create policy "workers_manage_own_profile"
on public.worker_profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "admins_view_worker_profiles"
on public.worker_profiles
for select
to authenticated
using (public.is_admin());

create policy "facility_users_manage_own_profile"
on public.facility_profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "admins_view_facility_profiles"
on public.facility_profiles
for select
to authenticated
using (public.is_admin());

create policy "facility_admins_create_facilities"
on public.facilities
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role in ('facility_admin', 'admin')
  )
);

create policy "facility_members_can_view_facilities"
on public.facilities
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.facility_users fu
    where fu.facility_id = id
      and fu.user_id = (select auth.uid())
  )
);

create policy "facility_admins_update_facilities"
on public.facilities
for update
to authenticated
using (public.is_facility_admin(id))
with check (public.is_facility_admin(id));

create policy "facility_admins_delete_facilities"
on public.facilities
for delete
to authenticated
using (public.is_facility_admin(id));

create policy "facility_users_view_memberships"
on public.facility_users
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_facility_admin(facility_id)
);

create policy "facility_admins_manage_memberships"
on public.facility_users
for all
to authenticated
using (public.is_facility_admin(facility_id))
with check (public.is_facility_admin(facility_id));
