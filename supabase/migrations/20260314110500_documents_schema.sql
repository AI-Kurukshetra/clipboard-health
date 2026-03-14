create or replace function public.has_staffing_privilege()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role in ('facility_admin', 'admin')
  );
$$;

create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references auth.users(id) on delete cascade,
  license_type text not null,
  license_number text,
  issuing_authority text,
  issue_date date,
  expiry_date date,
  storage_path text not null,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references auth.users(id) on delete cascade,
  certification_type text not null,
  issuer text,
  issue_date date,
  expiry_date date,
  storage_path text not null,
  verification_status public.verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_licenses_worker_id on public.licenses(worker_id);
create index idx_certifications_worker_id on public.certifications(worker_id);

create trigger trg_licenses_updated_at
before update on public.licenses
for each row
execute procedure public.set_updated_at();

create trigger trg_certifications_updated_at
before update on public.certifications
for each row
execute procedure public.set_updated_at();

alter table public.licenses enable row level security;
alter table public.certifications enable row level security;

create policy "workers_manage_own_licenses"
on public.licenses
for all
to authenticated
using (worker_id = (select auth.uid()))
with check (worker_id = (select auth.uid()));

create policy "staffing_roles_view_licenses"
on public.licenses
for select
to authenticated
using (public.has_staffing_privilege());

create policy "workers_manage_own_certifications"
on public.certifications
for all
to authenticated
using (worker_id = (select auth.uid()))
with check (worker_id = (select auth.uid()));

create policy "staffing_roles_view_certifications"
on public.certifications
for select
to authenticated
using (public.has_staffing_privilege());
