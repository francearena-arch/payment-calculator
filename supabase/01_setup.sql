-- Run once in the payment-calculator project. No existing tables are modified.
begin;
create table public.pcc_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text not null,
 is_admin boolean not null default false,
 active boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.pcc_cases (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references public.pcc_profiles(user_id) on delete set null,
 channel text not null check(channel in ('Remote Sales','Field Sales','Key Account')),
 purpose text not null check(purpose in ('acquisition','retention')),
 quote_date date not null,
 turnover_band text not null,
 competitor text not null,
 payload jsonb not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 outcome text not null default 'open' check(outcome in ('open','retained','lost')),
 offered_option integer,
 closed_date date,
 reviewed_by uuid references public.pcc_profiles(user_id) on delete set null,
 reviewed_at timestamptz,
 created_at timestamptz not null default now()
);
create index pcc_cases_date_idx on public.pcc_cases(quote_date);
create index pcc_cases_owner_idx on public.pcc_cases(owner_id);
create table public.pcc_audit (
 id bigint generated always as identity primary key,
 actor_id uuid references public.pcc_profiles(user_id) on delete set null,
 action text not null,
 target_id text,
 created_at timestamptz not null default now()
);
alter table public.pcc_profiles enable row level security;
alter table public.pcc_cases enable row level security;
alter table public.pcc_audit enable row level security;
-- All application data travels through the authenticated server API.
revoke all on public.pcc_profiles, public.pcc_cases, public.pcc_audit from public, anon, authenticated;
grant all on public.pcc_profiles, public.pcc_cases, public.pcc_audit to service_role;
grant usage, select on sequence public.pcc_audit_id_seq to service_role;
create function public.pcc_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.pcc_profiles(user_id,email,is_admin,active)
 values(new.id,lower(new.email),lower(new.email) in ('france.arena@googlemail.com','francesco.arena@nexigroup.com'),lower(new.email) in ('france.arena@googlemail.com','francesco.arena@nexigroup.com'));
 return new;
end;
$$;
revoke all on function public.pcc_new_user() from public, anon, authenticated;
create trigger pcc_user_created after insert on auth.users for each row execute function public.pcc_new_user();
-- Existing users, if the first admin was already created before this script.
insert into public.pcc_profiles(user_id,email,is_admin,active)
select id,lower(email),lower(email) in ('france.arena@googlemail.com','francesco.arena@nexigroup.com'),lower(email) in ('france.arena@googlemail.com','francesco.arena@nexigroup.com') from auth.users
where email is not null on conflict(user_id) do nothing;
commit;
