# SCHEMA

Status: baseline schema migrations in progress.

## Migration History

### 20260314105700_auth_foundations.sql
- Created `public.app_role` enum: `healthcare_worker`, `facility_admin`, `admin`
- Created `public.user_roles` table:
  - `user_id uuid primary key references auth.users(id)`
  - `role app_role not null default healthcare_worker`
  - `created_at`, `updated_at`
- Added `public.set_updated_at()` trigger helper for `updated_at`
- Added `public.handle_new_user_role()` trigger on `auth.users` to auto-create default role
- Added `public.is_admin()` helper function for RLS checks
- Enabled RLS on `public.user_roles`
- Policies:
  - users can read own role (`(select auth.uid()) = user_id`)
  - admins can read all roles
  - admins can update roles

### 20260314110200_profiles_and_facilities.sql
- Added enums:
  - `public.verification_status`: `pending`, `verified`, `rejected`
  - `public.facility_membership_role`: `owner`, `admin`, `member`
- Added tables:
  - `public.worker_profiles`
  - `public.facility_profiles`
  - `public.facilities`
  - `public.facility_users`
- Added `public.is_facility_admin(target_facility_id uuid)` helper for RLS authorization
- Enabled RLS on all new tables
- Added ownership/admin access policies for worker and facility profiles
- Added facility membership-based policies for facilities and facility_users

## Planned Core Tables (Upcoming Phases)
- marketplace: `shifts`, `applications`, `assignments`
- operations: `timesheets`, `availability`
- trust and compliance: `licenses`, `certifications`, `notifications`
- collaboration: `conversations`, `messages`
- reputation: `reviews`

### 20260314110500_documents_schema.sql
- Added `public.has_staffing_privilege()` helper for facility/admin document visibility
- Added tables:
  - `public.licenses`
  - `public.certifications`
- Enabled RLS on both tables
- Policies:
  - workers can manage own records
  - facility_admin/admin roles can read records

### 20260314110800_availability_schema.sql
- Added `public.availability` table for weekly worker schedule preferences
- Added RLS policies:
  - workers manage own availability
  - facility/admin staffing roles can read availability

### 20260314110900_shifts_schema.sql
- Added `public.shift_status` enum: `open`, `assigned`, `completed`, `cancelled`
- Added `public.shifts` table with pay, schedule, urgency, and lifecycle fields
- Enabled RLS policies:
  - authenticated users can browse shifts
  - facility admins can create/update/delete shifts for managed facilities

### 20260314111300_applications_schema.sql
- Added `public.application_status` enum: `applied`, `accepted`, `rejected`, `cancelled`
- Added `public.applications` table with unique `(shift_id, worker_id)` constraint
- Added helper `public.is_shift_facility_admin(target_shift_id uuid)`
- Enabled RLS policies for worker-owned application flow and facility-admin review flow

### 20260314111900_assignments_schema.sql
- Added `public.assignment_status` enum: `assigned`, `in_progress`, `completed`, `cancelled`
- Added `public.assignments` table and optional `application_id` reference
- Added helper `public.is_shift_manager_for_assignment(target_shift_id uuid)`
- Enabled RLS policies for worker self-visibility and facility-admin assignment management

### 20260314112400_messaging_schema.sql
- Added messaging tables:
  - `public.conversations`
  - `public.conversation_participants`
  - `public.messages`
- Added helper `public.is_conversation_participant(target_conversation_id uuid)`
- Enabled participant-scoped RLS for conversation and message access
- Added `public.messages` to `supabase_realtime` publication

### 20260314113200_timesheets_schema.sql
- Added helper functions:
  - `public.is_assignment_worker(target_assignment_id uuid)`
  - `public.is_assignment_manager(target_assignment_id uuid)`
- Added `public.timesheets` table linked one-to-one with assignments
- Added `public.compute_timesheet_hours()` trigger to derive `hours_worked`
- Enabled RLS policies for worker-managed timesheets and facility-manager read access

### 20260314113800_reviews_schema.sql
- Added helper `public.is_assignment_participant_or_manager(target_assignment_id uuid)`
- Added `public.reviews` table with rating range and reviewer/reviewee constraints
- Enabled RLS for participant/manager visibility and reviewer-owned writes

## Hosted Deployment Sync (2026-03-14 12:53)
- Linked hosted project: `ccyfoscnarbjlnbbskbn`
- Applied migrations on hosted DB:
  - `20260314105700_auth_foundations.sql`
  - `20260314110200_profiles_and_facilities.sql`
  - `20260314110500_documents_schema.sql`
  - `20260314110800_availability_schema.sql`
  - `20260314110900_shifts_schema.sql`
  - `20260314111300_applications_schema.sql`
  - `20260314111900_assignments_schema.sql`
  - `20260314112400_messaging_schema.sql`
  - `20260314113200_timesheets_schema.sql`
  - `20260314113800_reviews_schema.sql`
- Core public tables now expected in Supabase Table Editor:
  - `user_roles`, `worker_profiles`, `facility_profiles`, `facilities`, `facility_users`
  - `licenses`, `certifications`, `availability`
  - `shifts`, `applications`, `assignments`
  - `conversations`, `conversation_participants`, `messages`
  - `timesheets`, `reviews`



