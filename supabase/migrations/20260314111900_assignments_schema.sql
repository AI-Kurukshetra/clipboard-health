create type public.assignment_status as enum (
  'assigned',
  'in_progress',
  'completed',
  'cancelled'
);

create or replace function public.is_shift_manager_for_assignment(target_shift_id uuid)
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

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.shifts(id) on delete cascade,
  worker_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  assignment_status public.assignment_status not null default 'assigned',
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shift_id, worker_id)
);

create index idx_assignments_shift_id on public.assignments(shift_id);
create index idx_assignments_worker_id on public.assignments(worker_id);

create trigger trg_assignments_updated_at
before update on public.assignments
for each row
execute procedure public.set_updated_at();

alter table public.assignments enable row level security;

create policy "workers_view_own_assignments"
on public.assignments
for select
to authenticated
using (worker_id = (select auth.uid()));

create policy "facility_admins_view_assignments"
on public.assignments
for select
to authenticated
using (public.is_shift_manager_for_assignment(shift_id));

create policy "facility_admins_manage_assignments"
on public.assignments
for all
to authenticated
using (public.is_shift_manager_for_assignment(shift_id))
with check (public.is_shift_manager_for_assignment(shift_id));
