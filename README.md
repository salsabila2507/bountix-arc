# Bountix

Public soft-open task marketplace for [bountix.xyz](https://bountix.xyz).

> **Read before contributing:** [`docs/constraints.md`](docs/constraints.md) —
> Supabase free-tier rules, payment direction (USDC on Base only),
> legacy waitlist protection, migration policy, and design lock.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase auth, profiles, tasks, applications, submissions, messages, and
  legacy waitlist storage
- Tencent Chat UIKit React for realtime chat
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
TENCENT_CHAT_SDK_APP_ID=
TENCENT_CHAT_SECRET_KEY=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is also supported if your Supabase dashboard
uses the older key naming.

`TENCENT_CHAT_SDK_APP_ID` and `TENCENT_CHAT_SECRET_KEY` are required for the
dashboard chat route. `SDKSecretKey` stays server-only and is never exposed to
the browser.

## Supabase Setup

Apply SQL files from `supabase/migrations/` in order. The old
`public.waitlist` table is retained for history, but signup is the active
public access path.

## Deploying to Vercel

1. Push this project to a Git repository.
2. Import the repository in Vercel.
3. Add the Supabase environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
TENCENT_CHAT_SDK_APP_ID=
TENCENT_CHAT_SECRET_KEY=
```

4. Deploy.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```
