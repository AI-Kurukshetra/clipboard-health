# TASKS

Legend: `[ ]` todo, `[~]` in-progress, `[x]` done, `[!]` blocked

## Phase 1 - Infrastructure

### [x] T0.1 Initialize `/doc` context set (2026-03-14 10:48)
- Description: Create required project context files and mirror canonical PRD into `/doc/PRD.md`.
- Files affected: `doc/PRD.md`, `doc/TASKS.md`, `doc/PROGRESS.md`, `doc/BLOCKERS.md`, `doc/CHANGELOG.md`, `doc/DECISIONS.md`, `doc/SCHEMA.md`
- Agent responsible: coordinator
- Dependencies: none

### [x] T0.2 Bootstrap Next.js + TypeScript strict + Tailwind stack (2026-03-14 10:55)
- Description: Scaffold project structure for Next.js 15 App Router, strict TypeScript, Tailwind, baseline lint/typecheck/test scripts.
- Files affected: `package.json`, `tsconfig.json`, `next.config.ts`, `app/*`, `components/*`, `lib/*`, `tests/*`
- Agent responsible: frontend
- Dependencies: T0.1

### [x] T0.3 Supabase integration baseline (2026-03-14 10:56)
- Description: Add server/browser Supabase clients, session middleware wiring, env typing and examples.
- Files affected: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `types/env.d.ts`, `.env.example`
- Agent responsible: backend
- Dependencies: T0.2

## Phase 2 - Authentication

### [x] T2.1 Auth database foundations (2026-03-14 10:57)
- Description: Add migrations for role-aware user metadata and access-control support tables/policies.
- Files affected: `supabase/migrations/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration (backend)
- Dependencies: T0.3

### [x] T2.2 Auth APIs and server actions (2026-03-14 10:58)
- Description: Implement signup, login, logout, role bootstrap, and auth guards using Supabase SSR auth.
- Files affected: `app/api/auth/*`, `app/actions/auth/*`, `lib/validations/auth.ts`
- Agent responsible: api-endpoint (backend)
- Dependencies: T2.1

### [x] T2.3 Auth UI (2026-03-14 11:00)
- Description: Build auth pages with validation, loading/error states, and role-aware redirects.
- Files affected: `app/(auth)/*`, `app/(dashboard)/layout.tsx`, `components/auth/*`
- Agent responsible: frontend-design (frontend)
- Dependencies: T2.2

## Phase 3 - Profiles

### [x] T3.1 Worker profile schema and RLS (2026-03-14 11:01)
- Description: Add worker profiles table with verification state and ownership RLS.
- Files affected: `supabase/migrations/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration (backend)
- Dependencies: T2.3

### [x] T3.2 Facility profile, facilities, and membership schema (2026-03-14 11:01)
- Description: Add facility profiles, facilities, and facility_users for multi-facility management.
- Files affected: `supabase/migrations/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration (backend)
- Dependencies: T2.3

### [x] T3.3 Profile APIs (2026-03-14 11:02)
- Description: Implement worker/facility profile read-update APIs with Zod validation.
- Files affected: `app/api/workers/me/*`, `app/api/facilities/me/*`, `lib/validations/worker-profile.ts`, `lib/validations/facility-profile.ts`
- Agent responsible: api-endpoint (backend)
- Dependencies: T3.1, T3.2

### [x] T3.4 Profile UIs (2026-03-14 11:04)
- Description: Build profile forms for worker and facility users with RHF + Zod + optimistic update handling.
- Files affected: `app/(dashboard)/profile/*`, `components/profile/*`
- Agent responsible: frontend-design (frontend)
- Dependencies: T3.3

### [x] T3.5 Documents schema (licenses/certifications) (2026-03-14 11:05)
- Description: Add document metadata tables and RLS for worker uploads and facility/admin read permissions.
- Files affected: `supabase/migrations/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration (backend)
- Dependencies: T3.4

### [x] T3.6 Documents API and storage integration (2026-03-14 11:06)
- Description: Implement upload metadata endpoints and signed URL flow against Supabase Storage.
- Files affected: `app/api/documents/*`, `lib/validations/documents.ts`
- Agent responsible: api-endpoint (backend)
- Dependencies: T3.5

### [x] T3.7 Availability schema, API, and UI (2026-03-14 11:07)
- Description: Implement worker weekly availability management end-to-end.
- Files affected: `supabase/migrations/*`, `app/api/availability/*`, `app/(dashboard)/availability/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration -> api-endpoint -> frontend-design
- Dependencies: T3.4

## Phase 4 - Shift System

### [x] T4.1 Shifts schema and RLS (2026-03-14 11:08)
- Description: Add shifts table, status enum, and policies for facility-admin create/update and worker browse.
- Files affected: `supabase/migrations/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration (backend)
- Dependencies: T3.7

### [x] T4.2 Shifts API (2026-03-14 11:10)
- Description: Implement create/list/detail APIs with filter and sort support for MVP (location text, pay, date, specialty, urgency).
- Files affected: `app/api/shifts/*`, `lib/validations/shifts.ts`
- Agent responsible: api-endpoint (backend)
- Dependencies: T4.1

### [x] T4.3 Shift posting and browsing UI (2026-03-14 11:12)
- Description: Build facility shift creation and worker shift search pages with loading/error skeleton states.
- Files affected: `app/(dashboard)/shifts/*`, `components/shifts/*`
- Agent responsible: frontend-design (frontend)
- Dependencies: T4.2

## Phase 5 - Applications

### [x] T5.1 Applications schema and RLS (2026-03-14 11:14)
- Description: Add applications table and constraints for one active application per worker/shift.
- Files affected: `supabase/migrations/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration (backend)
- Dependencies: T4.3

### [x] T5.2 Applications API (2026-03-14 11:17)
- Description: Implement worker apply flow and list endpoints for worker and facility-side review.
- Files affected: `app/api/applications/*`, `lib/validations/applications.ts`
- Agent responsible: api-endpoint (backend)
- Dependencies: T5.1

### [x] T5.3 Applications UI (2026-03-14 11:18)
- Description: Add apply button flow, application status display, and facility applicant review screens.
- Files affected: `app/(dashboard)/applications/*`, `components/applications/*`
- Agent responsible: frontend-design (frontend)
- Dependencies: T5.2

## Phase 6 - Assignments

### [x] T6.1 Assignments schema and RLS (2026-03-14 11:19)
- Description: Add assignments table and assignment status lifecycle policies.
- Files affected: `supabase/migrations/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration (backend)
- Dependencies: T5.3

### [x] T6.2 Assignments API (2026-03-14 11:21)
- Description: Implement facility assign/reassign endpoints and worker assignment listing.
- Files affected: `app/api/assignments/*`, `lib/validations/assignments.ts`
- Agent responsible: api-endpoint (backend)
- Dependencies: T6.1

### [x] T6.3 Assignments UI (2026-03-14 11:23)
- Description: Build assignment management views for facilities and assignment status views for workers.
- Files affected: `app/(dashboard)/assignments/*`, `components/assignments/*`
- Agent responsible: frontend-design (frontend)
- Dependencies: T6.2

## Phase 7 - Messaging

### [x] T7.1 Messaging schema + realtime setup (2026-03-14 11:24)
- Description: Add conversations/messages tables with RLS and realtime publication for message events.
- Files affected: `supabase/migrations/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration (backend)
- Dependencies: T6.3

### [x] T7.2 Messaging API (2026-03-14 11:29)
- Description: Implement list/send message endpoints with participant authorization checks.
- Files affected: `app/api/messages/*`, `lib/validations/messages.ts`
- Agent responsible: api-endpoint (backend)
- Dependencies: T7.1

### [x] T7.3 Messaging UI (2026-03-14 11:31)
- Description: Build conversation list and message thread screens with realtime updates.
- Files affected: `app/(dashboard)/messages/*`, `components/messages/*`
- Agent responsible: frontend-design (frontend)
- Dependencies: T7.2

## Phase 8 - Time Tracking

### [x] T8.1 Timesheets schema and RLS (2026-03-14 11:33)
- Description: Add timesheets table for clock in/out linked to assignments.
- Files affected: `supabase/migrations/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration (backend)
- Dependencies: T6.3

### [x] T8.2 Time tracking API (2026-03-14 11:35)
- Description: Implement clock-in and clock-out endpoints with assignment-status checks.
- Files affected: `app/api/timesheets/*`, `lib/validations/timesheets.ts`
- Agent responsible: api-endpoint (backend)
- Dependencies: T8.1

### [x] T8.3 Time tracking UI (2026-03-14 11:37)
- Description: Build worker clock controls and facility visibility for worked hours.
- Files affected: `app/(dashboard)/timesheets/*`, `components/timesheets/*`
- Agent responsible: frontend-design (frontend)
- Dependencies: T8.2

## Phase 9 - Reviews

### [x] T9.1 Reviews schema and RLS (2026-03-14 11:40)
- Description: Add bidirectional reviews table (worker<->facility) after shift completion.
- Files affected: `supabase/migrations/*`, `doc/SCHEMA.md`
- Agent responsible: db-migration (backend)
- Dependencies: T8.3

### [x] T9.2 Reviews API (2026-03-14 11:42)
- Description: Implement create/list review endpoints with completion and uniqueness checks.
- Files affected: `app/api/reviews/*`, `lib/validations/reviews.ts`
- Agent responsible: api-endpoint (backend)
- Dependencies: T9.1

### [x] T9.3 Reviews UI (2026-03-14 11:44)
- Description: Build review submission and display screens for both worker and facility actors.
- Files affected: `app/(dashboard)/reviews/*`, `components/reviews/*`
- Agent responsible: frontend-design (frontend)
- Dependencies: T9.2

## Phase 10 - Testing and Final Review

### [x] T10.1 Unit tests (Vitest) (2026-03-14 11:46)
- Description: Add tests for Zod schemas, API handlers, and critical auth/authorization behavior.
- Files affected: `**/*.test.ts`, `vitest.config.ts`
- Agent responsible: tester
- Dependencies: T9.3

### [x] T10.2 E2E tests (Playwright) (2026-03-14 12:26)
- Description: Add critical end-to-end flows (auth, profile, shifts, apply, assign, messaging, clocking, reviews).
- Files affected: `tests/e2e/*`, `playwright.config.ts`
- Agent responsible: agent-browser / tester
- Dependencies: T10.1

### [x] T10.3 Code review gate (2026-03-14 12:26)
- Description: Run reviewer pass on diffs for correctness, type safety, security, and conventions.
- Files affected: `doc/CHANGELOG.md` (review entry)
- Agent responsible: pr-review (reviewer)
- Dependencies: T10.2

### [x] T10.4 Final documentation and release handoff (2026-03-14 12:26)
- Description: Ensure all docs updated (`TASKS`, `PROGRESS`, `CHANGELOG`, `DECISIONS`, `SCHEMA`) and produce release summary.
- Files affected: `doc/TASKS.md`, `doc/PROGRESS.md`, `doc/CHANGELOG.md`, `doc/DECISIONS.md`, `doc/SCHEMA.md`
- Agent responsible: coordinator
- Dependencies: T10.3

## Phase 11 - Hosted Supabase Sync

### [x] T11.1 Apply migrations to hosted Supabase project (2026-03-14 12:53)
- Description: Link CLI to hosted project ccyfoscnarbjlnbbskbn, run supabase db push, and verify all MVP tables in Supabase Table Editor.
- Files affected: supabase/migrations/*, doc/SCHEMA.md
- Agent responsible: db-migration (backend) via coordinator
- Dependencies: T10.4

## Phase 12 - Auth Flow Verification

### [x] T12.1 Align post-auth redirect target to protected route (2026-03-14 14:10)
- Description: Update login and register clients to navigate to an existing protected route after successful auth.
- Files affected: `components/auth/register-form.tsx`, `components/auth/login-form.tsx`
- Agent responsible: frontend-design (frontend)
- Dependencies: T11.1

### [x] T12.2 Validate real signup+login with Playwright agent-browser (2026-03-14 14:15)
- Description: Add and execute end-to-end auth flow (signup, signout, login) against local Supabase runtime due hosted email signup throttling.
- Files affected: `tests/e2e/auth-flow.spec.ts`, `doc/PROGRESS.md`, `doc/BLOCKERS.md`
- Agent responsible: agent-browser / tester
- Dependencies: T12.1

