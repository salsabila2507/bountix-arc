-- =====================================================================
-- BountixEscrowV2: FCFS (first-come, first-served) escrow support
-- =====================================================================
--
-- Adds FCFS-specific columns to public.tasks. Reuses existing
-- release_tx_hash / released_at on task_submissions for payout tracking.
-- =====================================================================

alter table public.tasks
  add column if not exists fcfs_budget numeric(12, 2)
    check (fcfs_budget is null or fcfs_budget >= 0),
  add column if not exists fcfs_reward_per_winner numeric(12, 2)
    check (fcfs_reward_per_winner is null or fcfs_reward_per_winner >= 0),
  add column if not exists fcfs_max_winners integer
    check (fcfs_max_winners is null or fcfs_max_winners > 0),
  add column if not exists fcfs_winner_count integer not null default 0
    check (fcfs_winner_count >= 0),
  add column if not exists fcfs_refund_tx_hash text;

comment on column public.tasks.fcfs_budget is
  'Total USDC budget for FCFS escrow (BountixEscrowV2).';

comment on column public.tasks.fcfs_reward_per_winner is
  'Gross USDC reward per winner in an FCFS escrow (before platform fee).';

comment on column public.tasks.fcfs_max_winners is
  'Maximum number of unique winners for FCFS escrow.';

comment on column public.tasks.fcfs_winner_count is
  'Number of FCFS winners paid so far (tracked off-chain for display).';

comment on column public.tasks.fcfs_refund_tx_hash is
  'Transaction hash of FCFS escrow refund (set when remaining budget is returned).';

comment on column public.tasks.reward_mode is
  'Reward mode: fixed (standard), raffle (random winners), or fcfs (first-come first-served).';

-- ---------------------------------------------------------------------
-- Helper: increment_fcfs_winner_count
-- Called by payFCFSWinnerAction to track off-chain winner count.
-- Returns the new count.
-- ---------------------------------------------------------------------

create or replace function public.increment_fcfs_winner_count(p_task_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_count integer;
begin
  update public.tasks
  set fcfs_winner_count = fcfs_winner_count + 1
  where id = p_task_id
    and reward_mode = 'fcfs'
  returning fcfs_winner_count into v_new_count;

  if not found then
    raise exception 'task not found or not an FCFS task';
  end if;

  return v_new_count;
end;
$$;

revoke all on function public.increment_fcfs_winner_count(uuid) from public;
grant execute on function public.increment_fcfs_winner_count(uuid) to authenticated;
