# DECISIONS

## 2026-03-14
- Canonical PRD source is root `prd.md`; synchronized copy maintained at `doc/PRD.md`.
- MVP boundary excludes compliance-expiry reminders and geolocation-based urgent notifications in this delivery.
- Coordinator enforces gate order: db-migration -> api-endpoint -> frontend-design -> agent-browser -> pr-review.
- RLS helper `public.is_admin()` introduced for admin-only role management.
- Facility access control is enforced through `facility_users` membership and `is_facility_admin()` helper function.
- E2E execution is gated by runtime Supabase env presence because middleware requires NEXT_PUBLIC_SUPABASE_URL at startup.
- Dashboard route group maps protected pages to paths like `/profile`, `/shifts`; `/dashboard` is not a canonical protected page path.
- E2E runtime requires `.env.local` presence; `.env.example` remains template-only and should be copied for local execution.
- Hosted migration deployment will use Supabase CLI (`supabase link` + `supabase db push`) against project ref `ccyfoscnarbjlnbbskbn`; execution is gated on CLI auth (`SUPABASE_ACCESS_TOKEN` or `supabase login`).
- Hosted schema source-of-truth is now synchronized: all migrations through `20260314113800_reviews_schema.sql` are applied on project `ccyfoscnarbjlnbbskbn`.
- Playwright signup/login verification will run against local Supabase when hosted auth returns `email rate limit exceeded`; this keeps auth E2E deterministic while preserving hosted schema sync for deployment.
- Project onboarding standard is codified in `README.md` with dual setup modes (hosted Supabase for deployment parity, local Supabase for deterministic E2E/auth validation).
- Post-profile-completion navigation is role-driven: workers proceed to shift discovery (`/shifts`), while facility/admin users proceed to applicant workflow (`/applications`).
- Client redirect logic relies on authenticated role lookup endpoint (`/api/auth/me`) backed by `user_roles`, with safe metadata fallback for resiliency.
- Demo environment strategy uses deterministic seeded entities with fixed UUIDs plus stable credentials, enabling repeatable end-to-end walkthroughs without manual data setup.
- Full demo validation now includes seeded cross-module E2E smoke coverage (worker + facility admin paths) in addition to auth and route-guard tests.
- Client Supabase initialization must avoid dynamic env key lookup (`requireEnv` pattern) in browser bundles; use direct `NEXT_PUBLIC_*` references instead.
- Demo readiness now requires seeded edge-case regression checks in CI-grade E2E, not only happy-path journeys.
- Post-save navigation is fail-safe: persistence success is preserved even if role-based redirect lookup fails, with explicit user-visible fallback guidance.

