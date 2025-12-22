-- Create table to store per-clinic integration credentials for Clinicorp
create extension if not exists pgcrypto;

create table if not exists public.clinic_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  clinic_id uuid,
  provider text not null check (provider <> ''),
  api_user text not null,
  api_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

-- Enable RLS
alter table public.clinic_integrations enable row level security;

-- Policies: users can manage their own integration credentials
create policy if not exists "Users can view their own integration credentials"
  on public.clinic_integrations
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own integration credentials"
  on public.clinic_integrations
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own integration credentials"
  on public.clinic_integrations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own integration credentials"
  on public.clinic_integrations
  for delete
  using (auth.uid() = user_id);

-- Update timestamp trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_clinic_integrations_updated_at
before update on public.clinic_integrations
for each row execute function public.update_updated_at_column();

-- Helpful index
create index if not exists idx_clinic_integrations_provider on public.clinic_integrations(provider);
