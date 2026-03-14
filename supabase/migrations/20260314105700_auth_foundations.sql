create type public.app_role as enum (
  'healthcare_worker',
  'facility_admin',
  'admin'
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'healthcare_worker',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_user_roles_updated_at
before update on public.user_roles
for each row
execute procedure public.set_updated_at();

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'healthcare_worker')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created_role
after insert on auth.users
for each row
execute procedure public.handle_new_user_role();

create or replace function public.is_admin()
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
      and ur.role = 'admin'
  );
$$;

create policy "users_can_view_own_role"
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "admins_can_view_all_roles"
on public.user_roles
for select
to authenticated
using (public.is_admin());

create policy "admins_can_update_roles"
on public.user_roles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
