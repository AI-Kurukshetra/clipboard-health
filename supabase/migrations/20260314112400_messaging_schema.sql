create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid references public.shifts(id) on delete set null,
  facility_id uuid references public.facilities(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index idx_messages_conversation_created_at on public.messages(conversation_id, created_at desc);
create index idx_conversation_participants_user_id on public.conversation_participants(user_id);

create or replace function public.is_conversation_participant(target_conversation_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = target_conversation_id
      and cp.user_id = (select auth.uid())
  );
$$;

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy "participants_view_conversations"
on public.conversations
for select
to authenticated
using (public.is_conversation_participant(id));

create policy "authenticated_create_conversations"
on public.conversations
for insert
to authenticated
with check (created_by = (select auth.uid()));

create policy "participants_view_memberships"
on public.conversation_participants
for select
to authenticated
using (public.is_conversation_participant(conversation_id));

create policy "users_join_self_to_conversation"
on public.conversation_participants
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "participants_view_messages"
on public.messages
for select
to authenticated
using (public.is_conversation_participant(conversation_id));

create policy "participants_send_messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and public.is_conversation_participant(conversation_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
