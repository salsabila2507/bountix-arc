-- Allow arc-testnet in the tasks.chain CHECK constraint.
-- Also drop base-sepolia which has no corresponding network config.
alter table tasks drop constraint if exists tasks_chain_check;
alter table tasks add constraint tasks_chain_check
  check (chain in ('base', 'arc-testnet'));
