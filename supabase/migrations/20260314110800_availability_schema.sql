create table public.availability (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references auth.users(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  preference_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_time_range check (start_time < end_time)
);

create index idx_availability_worker_id on public.availability(worker_id);

create trigger trg_availability_updated_at
before update on public.availability
for each row
execute procedure public.set_updated_at();

alter table public.availability enable row level security;

create policy "workers_manage_own_availability"
on public.availability
for all
to authenticated
using (worker_id = (select auth.uid()))
with check (worker_id = (select auth.uid()));

create policy "staffing_roles_view_availability"
on public.availability
for select
to authenticated
using (public.has_staffing_privilege());
