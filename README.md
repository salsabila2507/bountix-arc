# Bountix

Phase 1 waitlist landing page for [bountix.xyz](https://bountix.xyz).

> **Read before contributing:** [`docs/constraints.md`](docs/constraints.md) —
> Supabase free-tier rules, payment direction (USDC on Base only),
> waitlist protection, migration policy, and design lock.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase waitlist storage
- Vercel-ready deployment

## Local Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported if your Supabase dashboard
uses the older key naming.

## Supabase Setup

Create this table in the Supabase SQL Editor:

```sql
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  telegram_username text not null,
  role text not null,
  specialty text,
  created_at timestamp with time zone default now()
);

alter table public.waitlist enable row level security;

create policy "Allow public waitlist inserts"
on public.waitlist
for insert
to anon
with check (true);
```

## Deploying to Vercel

1. Push this project to a Git repository.
2. Import the repository in Vercel.
3. Add the Supabase environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

4. Deploy.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```
