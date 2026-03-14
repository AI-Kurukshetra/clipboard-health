# Clipboard Health - Healthcare Workforce Marketplace (MVP)

A marketplace platform where healthcare workers (nurses, CNAs) discover and apply to shifts, and healthcare facilities post shifts, manage applications, assign workers, message participants, track time, and leave reviews.

## What This Project Includes

This repository implements the MVP for a multi-sided healthcare staffing workflow:

- Authentication (worker and facility admin roles)
- Worker and facility profile management
- Shift creation, browsing, and filtering
- Shift applications and assignment lifecycle
- In-app messaging between participants
- Timesheet clock-in/clock-out tracking
- Post-assignment reviews
- Unit and E2E test coverage

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Supabase (Auth + Postgres + RLS)
- Tailwind CSS
- React Hook Form + Zod
- TanStack Query v5
- Vitest (unit tests)
- Playwright (E2E tests)
- pnpm (package manager)

## Repository Structure

- `app/` - App Router pages, route handlers, and server actions
- `components/` - Feature UI components
- `lib/` - Supabase clients, validation schemas, utilities
- `supabase/migrations/` - SQL migrations
- `tests/e2e/` - Playwright E2E specs
- `doc/` - Product docs, task tracking, progress, schema, decisions, blockers

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop (required for local Supabase)
- Supabase CLI (can be run via `pnpm dlx`)

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Important:

- Never commit real keys.
- Keep `.env.local` local-only.

## Setup Option A - Hosted Supabase (recommended for deployment parity)

1. Install dependencies:

```bash
corepack pnpm install
```

2. Fill `.env.local` with your hosted Supabase project values.

3. Link CLI to your project:

```bash
corepack pnpm dlx supabase link --project-ref <your-project-ref>
```

4. Push migrations:

```bash
corepack pnpm dlx supabase db push --linked --yes
```

5. Start app:

```bash
corepack pnpm dev
```

App URL: `http://localhost:3000`

## Setup Option B - Local Supabase (best for deterministic auth/E2E)

1. Start local stack:

```bash
corepack pnpm dlx supabase start
```

2. Apply all local migrations:

```bash
corepack pnpm dlx supabase db reset
```

3. Print local env values:

```bash
corepack pnpm dlx supabase status -o env
```

4. Copy `API_URL`, `ANON_KEY`, and `SERVICE_ROLE_KEY` values into `.env.local` as:

- `NEXT_PUBLIC_SUPABASE_URL=<API_URL>`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>`
- `SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>`

5. Start app:

```bash
corepack pnpm dev
```

## Run Checks and Tests

Lint:

```bash
corepack pnpm lint
```

Typecheck:

```bash
corepack pnpm typecheck
```

Unit tests:

```bash
corepack pnpm test
```

E2E tests:

```bash
corepack pnpm test:e2e
```

If Playwright browser binaries are missing:

```bash
corepack pnpm exec playwright install chromium
```

## Auth Testing Notes

- Hosted Supabase can throttle signup attempts (`email rate limit exceeded`) during rapid E2E runs.
- For reliable signup/login E2E, prefer local Supabase runtime.
- Current auth UI redirects successful login/register flows to `/profile`.

## Key NPM Scripts

- `dev` - Start Next.js dev server
- `build` - Build production bundle
- `start` - Start production server
- `lint` - Run ESLint
- `typecheck` - TypeScript no-emit check
- `test` - Run Vitest suite
- `test:e2e` - Run Playwright E2E suite

## API and Database

- Auth/API routes: `app/api/**`
- Supabase schema migrations: `supabase/migrations/*.sql`
- Schema and RLS documentation: `doc/SCHEMA.md`

## Project Documentation

Read these first before contributing:

- `doc/PRD.md` - Product requirements
- `doc/TASKS.md` - Task plan and status
- `doc/PROGRESS.md` - Execution history
- `doc/BLOCKERS.md` - Open/closed blockers
- `doc/DECISIONS.md` - Architecture decisions
- `doc/SCHEMA.md` - DB schema + migration history

## Security

- Do not expose service role keys in client code.
- Keep RLS enabled on all app tables.
- Validate all mutation payloads via Zod schemas.

## License

Internal project repository for MVP delivery.
