-- Idempotent re-statement of the billing migration so generated types include it.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','starter','pro','agency')),
  paddle_customer_id text,
  paddle_subscription_id text,
  status text not null default 'active',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.subscriptions (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;

alter table public.subscriptions enable row level security;

drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.get_owner_plan(_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select plan from public.subscriptions where user_id = _user_id
$$;

revoke all on function public.get_owner_plan(uuid) from public;
grant execute on function public.get_owner_plan(uuid) to anon, authenticated;

-- Multi-brand support: brands are no longer unique per user; layouts can reference a brand.
alter table public.brands drop constraint if exists brands_user_id_key;
alter table public.layouts add column if not exists brand_id uuid references public.brands(id) on delete set null;

-- New signups get a subscriptions row too.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), new.email)
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Keep trigger wiring intact.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();