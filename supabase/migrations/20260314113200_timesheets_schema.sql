create or replace function public.is_assignment_worker(target_assignment_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.assignments a
    where a.id = target_assignment_id
      and a.worker_id = (select auth.uid())
  );
$$;

create or replace function public.is_assignment_manager(target_assignment_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.assignments a
    join public.shifts s on s.id = a.shift_id
    where a.id = target_assignment_id
      and public.is_facility_admin(s.facility_id)
  );
$$;

create table public.timesheets (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references public.assignments(id) on delete cascade,
  clock_in_time timestamptz,
  clock_out_time timestamptz,
  hours_worked numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_timesheets_updated_at
before update on public.timesheets
for each row
execute procedure public.set_updated_at();

create or replace function public.compute_timesheet_hours()
returns trigger
language plpgsql
as $$
begin
  if new.clock_in_time is not null and new.clock_out_time is not null then
    new.hours_worked := round((extract(epoch from (new.clock_out_time - new.clock_in_time)) / 3600)::numeric, 2);
  end if;

  return new;
end;
$$;

create trigger trg_compute_timesheet_hours
before insert or update on public.timesheets
for each row
execute procedure public.compute_timesheet_hours();

alter table public.timesheets enable row level security;

create policy "workers_manage_own_timesheets"
on public.timesheets
for all
to authenticated
using (public.is_assignment_worker(assignment_id))
with check (public.is_assignment_worker(assignment_id));

create policy "facility_managers_view_timesheets"
on public.timesheets
for select
to authenticated
using (public.is_assignment_manager(assignment_id));
