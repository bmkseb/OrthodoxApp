-- Run once in Supabase SQL editor before syncing mezmur descriptions.
alter table public.mezmur
  add column if not exists description text;
