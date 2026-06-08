# Bountix Project Hand-off

This repo is the Bountix public soft-open marketplace. It is a Next.js App Router app backed by Supabase, with a small Hardhat-based smart contract suite for Base mainnet escrow.

## What lives where

### `app/`
Next.js routes, server actions, and page-level UI.

- `app/page.tsx` is the landing page.
- `app/tasks/`, `app/services/`, `app/creators/`, `app/notifications/`, `app/dashboard/` are the main product areas.
- `app/auth/`, `app/login/`, `app/signup/`, `app/forgot-password/`, `app/tasks/actions.ts`, `app/services/actions.ts`, etc. contain server actions and auth flow glue.
- `app/layout.tsx` and `app/globals.css` define the shared shell and global styling.
- Static/legal pages live under `app/about/`, `app/contact/`, `app/privacy/`, `app/terms/`, `app/disclaimer/`, and `app/task-policy/`.

### `components/`
Reusable UI building blocks.

- `components/landing/` holds the marketing/landing sections.
- `components/marketplace/` contains task, service, escrow, submission, and creator UI.
- `components/dashboard/` contains dashboard shell and shared dashboard UI.
- `components/auth/`, `components/profile/`, `components/ui/`, `components/site-header.tsx`, and `components/site-footer.tsx` are shared layout/forms/components.

### `lib/`
Business logic, helpers, and Supabase wiring.

- `lib/supabase/` has client/server/middleware helpers.
- `lib/tasks.ts`, `lib/services.ts`, `lib/applications.ts`, `lib/notifications.ts`, `lib/task-messages.ts`, `lib/waitlist.ts`, etc. are the data-access helpers for each feature area.
- `lib/payments.ts` and `lib/escrow.ts` define payment/escrow constants and contract integration.
- `lib/*-form-state.ts` files contain server-side form state / validation helpers.
- `lib/i18n.ts` and `lib/i18n/server.ts` handle localization.

### `supabase/migrations/`
Ordered SQL migrations. This is the source of truth for schema changes.

- Files are UTC timestamped and meant to be applied in order.
- Key domains covered here: profiles, tasks, applications/submissions, messages, notifications, referrals, service offers, waitlist, and soft-open access gating.

### `contracts/`
Solidity contracts for Base mainnet escrow.

- `contracts/BountixEscrowV0.sol` is the legacy escrow contract.
- `contracts/BountixEscrowV1.sol` is the current escrow contract.
- `contracts/mocks/MockUSDC.sol` is for tests.

### `test/`
Hardhat tests for the escrow contracts.

- `test/BountixEscrowV0.test.cjs`
- `test/BountixEscrowV1.test.cjs`

### `scripts/`
Deployment and gas-estimation scripts for the contracts.

- `scripts/deploy.cjs`, `scripts/estimate.cjs` for V0.
- `scripts/deploy-v1.cjs`, `scripts/estimate-v1.cjs` for V1.

### `public/`
Static assets.

- `public/logo.png` and `public/bountix-comic/` are the main brand assets.

### `docs/`
Project constraints and contract notes.

- `docs/constraints.md` is the most important guardrail file.
- `docs/escrow-contract.md` documents the V1 escrow contract.
- `docs/history/` contains historical notes, including the V0 escrow history.

## App structure in practice

This project is organized around a few main flows:

1. Public marketing / landing pages.
2. Marketplace browsing and posting tasks/services.
3. Authenticated dashboard flows for creators and task owners.
4. Supabase-backed persistence for profiles, tasks, applications, submissions, messages, notifications, and referrals.
5. Optional Base mainnet escrow via the Hardhat contracts.

## Important conventions

- Keep Supabase migrations lightweight and append-only.
- Do not introduce Supabase Storage or Realtime for MVP.
- Payment flow is USDC only on Base.
- The visual system is locked to the comic/pop-art style defined in `app/globals.css`.

## Fast orientation for future edits

- Change page layout or route behavior: start in `app/`.
- Change reusable UI: start in `components/`.
- Change data fetching or business logic: start in `lib/`.
- Change schema: add a migration in `supabase/migrations/`.
- Change escrow behavior: inspect `contracts/`, `test/`, and `scripts/`.

