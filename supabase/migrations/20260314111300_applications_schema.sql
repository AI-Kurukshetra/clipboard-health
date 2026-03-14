create type public.application_status as enum (
  'applied',
  'accepted',
  'rejected',
  'cancelled'
);

create or replace function public.is_shift_facility_admin(target_shift_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.shifts s
    where s.id = target_shift_id
      and public.is_facility_admin(s.facility_id)
  );
$$;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.shifts(id) on delete cascade,
  worker_id uuid not null references auth.users(id) on delete cascade,
  application_status public.application_status not null default 'applied',
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shift_id, worker_id)
);

create index idx_applications_shift_id on public.applications(shift_id);
create index idx_applications_worker_id on public.applications(worker_id);

create trigger trg_applications_updated_at
before update on public.applications
for each row
execute procedure public.set_updated_at();

alter table public.applications enable row level security;

create policy "workers_create_own_applications"
on public.applications
for insert
to authenticated
with check (worker_id = (select auth.uid()));

create policy "workers_view_own_applications"
on public.applications
for select
to authenticated
using (worker_id = (select auth.uid()));

create policy "workers_cancel_own_applications"
on public.applications
for update
to authenticated
using (worker_id = (select auth.uid()))
with check (
  worker_id = (select auth.uid())
  and application_status in ('applied', 'cancelled')
);

create policy "facility_admins_view_shift_applications"
on public.applications
for select
to authenticated
using (public.is_shift_facility_admin(shift_id));

create policy "facility_admins_update_shift_applications"
on public.applications
for update
to authenticated
using (public.is_shift_facility_admin(shift_id))
with check (public.is_shift_facility_admin(shift_id));
