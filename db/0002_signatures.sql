-- Signatures library (saved signatures per user)
-- Run this in your Supabase SQL editor.

create table if not exists public.signatures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  image_data text not null,
  created_at timestamptz not null default now()
);

alter table public.signatures enable row level security;

-- Users can read their own signatures
create policy "signatures_select_own"
on public.signatures
for select
using (auth.uid() = user_id);

-- Users can insert their own signatures
create policy "signatures_insert_own"
on public.signatures
for insert
with check (auth.uid() = user_id);

-- Users can delete their own signatures
create policy "signatures_delete_own"
on public.signatures
for delete
using (auth.uid() = user_id);


