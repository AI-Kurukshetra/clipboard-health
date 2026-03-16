# CLAUDE.md — Clipboard Health Marketplace Clone

## Project Overview
Healthcare workforce marketplace connecting facilities with healthcare workers. Clone of Clipboard Health built for a hackathon demo. Live at https://clipboard-health.vercel.app.

## Tech Stack
- **Framework:** Next.js 15 (App Router, React Server Components by default)
- **Database / Auth:** Supabase (Postgres + Auth + Realtime)
- **UI:** shadcn/ui + Tailwind CSS
- **Data Fetching:** TanStack Query v5
- **Forms:** React Hook Form + Zod validation
- **Testing:** Vitest (unit) + Playwright (e2e)

## Key Commands
```bash
npx pnpm dev          # Start dev server
npx pnpm build        # Production build (type-check + lint)
npx pnpm test         # Run unit tests
npx pnpm test:e2e     # Run Playwright e2e tests
```

## Architecture
- App Router with RSC by default; add `"use client"` only for state/events
- `@/` alias maps to project root
- Zod schemas in `lib/validations/` are the source of truth for types
- `cn()` utility from `lib/utils.ts` for conditional Tailwind classes
- Feature components live in `components/<feature>/` (e.g., `components/shifts/`)

## Role System
Three roles stored in `user_metadata.role`:
- `healthcare_worker` — browse shifts, apply, clock in/out, view own data
- `facility_admin` — post shifts, review applicants, manage assignments
- `admin` — full access to all views

## Supabase Patterns
- **Server components:** `import { createClient } from "@/lib/supabase/server"` (cookie-based)
- **Client components:** `import { createClient } from "@/lib/supabase/client"` (browser client)
- RLS policies on every table — never bypass with service role in app code
- Count queries: `supabase.from('table').select('*', { count: 'exact', head: true })`

## Context & Documentation
- See `/doc` folder for PRD, tasks, schema, and decision log
- See `AGENTS.md` for multi-agent workflow and skill system
