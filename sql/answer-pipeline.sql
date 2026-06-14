-- ============================================================================
-- Answer endpoint support: rate limiting + monthly token accounting.
-- Run once in the Supabase SQL editor.
-- All objects are touched only by server code on the service_role key.
-- ============================================================================

-- Per-key request counter (key = "answer:<site_id>:<ip_hash>").
create table if not exists public.rate_limits (
  key          text primary key,
  count        int not null default 0,
  window_start timestamptz not null default now()
);

grant select, insert, update, delete on public.rate_limits to service_role;
alter table public.rate_limits enable row level security;
-- No anon/authenticated policies on purpose: only service_role (BYPASSRLS)
-- ever reads or writes this table.

-- Atomic increment-and-check. Returns true if the request is allowed.
-- Resets the window when it has expired.
create or replace function public.check_rate_limit(
  p_key text,
  p_limit int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.rate_limits (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set count = case
          when public.rate_limits.window_start
               < now() - make_interval(secs => p_window_seconds)
          then 1
          else public.rate_limits.count + 1
        end,
        window_start = case
          when public.rate_limits.window_start
               < now() - make_interval(secs => p_window_seconds)
          then now()
          else public.rate_limits.window_start
        end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

grant execute on function public.check_rate_limit(text, int, int) to service_role;

-- Add token usage to a site, resetting the counter at the start of a new month.
create or replace function public.add_site_token_usage(
  p_site_id uuid,
  p_tokens int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.sites
    set tokens_used_period = case
          when period_start < date_trunc('month', now())::date then p_tokens
          else tokens_used_period + p_tokens
        end,
        period_start = case
          when period_start < date_trunc('month', now())::date
          then date_trunc('month', now())::date
          else period_start
        end
  where id = p_site_id;
end;
$$;

grant execute on function public.add_site_token_usage(uuid, int) to service_role;
