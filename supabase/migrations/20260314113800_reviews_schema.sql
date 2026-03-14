create or replace function public.is_assignment_participant_or_manager(target_assignment_id uuid)
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
      and (
        a.worker_id = (select auth.uid())
        or public.is_facility_admin(s.facility_id)
      )
  );
$$;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewee_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_reviewer_not_reviewee check (reviewer_id <> reviewee_id),
  unique (assignment_id, reviewer_id, reviewee_id)
);

create index idx_reviews_assignment_id on public.reviews(assignment_id);
create index idx_reviews_reviewee_id on public.reviews(reviewee_id);

create trigger trg_reviews_updated_at
before update on public.reviews
for each row
execute procedure public.set_updated_at();

alter table public.reviews enable row level security;

create policy "participants_view_reviews"
on public.reviews
for select
to authenticated
using (
  reviewer_id = (select auth.uid())
  or reviewee_id = (select auth.uid())
  or public.is_assignment_participant_or_manager(assignment_id)
);

create policy "participants_create_reviews"
on public.reviews
for insert
to authenticated
with check (
  reviewer_id = (select auth.uid())
  and public.is_assignment_participant_or_manager(assignment_id)
);

create policy "reviewers_update_own_reviews"
on public.reviews
for update
to authenticated
using (reviewer_id = (select auth.uid()))
with check (reviewer_id = (select auth.uid()));
