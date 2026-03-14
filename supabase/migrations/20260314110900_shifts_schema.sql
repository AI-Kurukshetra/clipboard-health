create type public.shift_status as enum (
  'open',
  'assigned',
  'completed',
  'cancelled'
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  title text not null,
  department text,
  specialty_required text,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  hourly_rate numeric(10, 2) not null check (hourly_rate > 0),
  workers_needed integer not null check (workers_needed > 0),
  location text,
  description text,
  urgent_flag boolean not null default false,
  status public.shift_status not null default 'open',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shifts_time_range check (start_time < end_time)
);

create index idx_shifts_facility_id on public.shifts(facility_id);
create index idx_shifts_shift_date on public.shifts(shift_date);
create index idx_shifts_status on public.shifts(status);

create trigger trg_shifts_updated_at
before update on public.shifts
for each row
execute procedure public.set_updated_at();

alter table public.shifts enable row level security;

create policy "authenticated_users_view_shifts"
on public.shifts
for select
to authenticated
using (true);

create policy "facility_admins_create_shifts"
on public.shifts
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and public.is_facility_admin(facility_id)
);

create policy "facility_admins_update_shifts"
on public.shifts
for update
to authenticated
using (public.is_facility_admin(facility_id))
with check (public.is_facility_admin(facility_id));

create policy "facility_admins_delete_shifts"
on public.shifts
for delete
to authenticated
using (public.is_facility_admin(facility_id));
