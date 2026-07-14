-- 002_orchestration.sql
-- Adds multi-model fusion support: per-user fusion quota, and per-message
-- orchestration metadata (which models were used, the fused vs single mode,
-- raw per-model responses for transparency, and failed models).
-- Also adds token/cost columns to usage_logs for cost visibility.
--
-- Additive only — safe to run against the existing production schema.
-- Run this in the Supabase SQL editor for the project referenced by
-- backend/.env SUPABASE_URL (see SETUP.md for the standard workflow).

alter table users
  add column if not exists fusion_daily_usage int default 0,
  add column if not exists fusion_daily_limit int default 3; -- free tier default; raised for pro/premium on payment approval

alter table messages
  add column if not exists mode text check (mode in ('single','fuse')),
  add column if not exists models_used text[],
  add column if not exists fusion_model text,
  add column if not exists raw_responses jsonb,
  add column if not exists failed_models jsonb;

alter table usage_logs
  add column if not exists prompt_tokens int,
  add column if not exists completion_tokens int,
  add column if not exists cost_usd numeric(10,6);

comment on column users.fusion_daily_usage is 'Number of fused (multi-model) chat messages sent today; resets daily via the same lazy-reset pattern as daily_usage.';
comment on column users.fusion_daily_limit is 'Max fused messages per day; default 3 for free tier, raised for pro/premium at payment approval.';
comment on column messages.mode is 'single = one model (existing auto-fallback behavior); fuse = multi-model fan-out + synthesis.';
comment on column messages.raw_responses is 'Per-model raw answers when mode=fuse, for the "see what each model said" transparency panel. Null otherwise.';
