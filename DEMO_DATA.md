# Demo Data Guide

This document contains reusable demo accounts and pre-seeded records for the hosted Supabase project.

## Project

- Supabase project ref: `ccyfoscnarbjlnbbskbn`
- Seed command: `corepack pnpm seed:demo`
- Seed script: `scripts/seed-demo-data.mjs`

The seed is idempotent (safe to run multiple times).

## Demo Credentials

Password for all demo users: `Demo@12345`

- Worker A: `demo.worker1@clipboardhealth.dev`
- Worker B: `demo.worker2@clipboardhealth.dev`
- Facility Admin: `demo.facility@clipboardhealth.dev`
- Admin: `demo.admin@clipboardhealth.dev`

## Fixed Demo Record IDs

- Facility: `11111111-1111-4111-8111-111111111111`
- Completed Shift: `55555555-5555-4555-8555-555555555551`
- Open Shift: `55555555-5555-4555-8555-555555555552`
- Accepted Application: `66666666-6666-4666-8666-666666666661`
- Applied Application: `66666666-6666-4666-8666-666666666662`
- Completed Assignment: `77777777-7777-4777-8777-777777777771`
- Conversation: `88888888-8888-4888-8888-888888888881`
- Review (Facility -> Worker): `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1`
- Review (Worker -> Facility): `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2`

## Seeded Data Coverage

The seed script inserts/updates related data in all implemented MVP tables:

- `user_roles`
- `worker_profiles`
- `facility_profiles`
- `facilities`
- `facility_users`
- `licenses`
- `certifications`
- `availability`
- `shifts`
- `applications`
- `assignments`
- `conversations`
- `conversation_participants`
- `messages`
- `timesheets`
- `reviews`

## Demo Walkthrough (UI)

### Worker Demo

1. Login with Worker A (`/login`)
2. Open `/shifts` to see seeded shifts
3. Open `/applications` to see accepted application
4. Open `/assignments` to see completed assignment
5. Open `/messages` and select seeded conversation
6. Open `/timesheets` to see worked hours
7. Open `/reviews` to see review history

### Facility Admin Demo

1. Login with Facility Admin (`/login`)
2. Open `/applications` and search by open shift ID
3. Open `/assignments` and search by completed shift ID
4. Open `/timesheets` and query by assignment ID
5. Open `/reviews` for historical feedback

## E2E Validation

Run the full suite:

```bash
corepack pnpm test:e2e
```

Includes:

- auth lifecycle tests
- protected route checks
- role-based profile redirect tests
- seeded dataset module smoke tests

## Security Note

These credentials are for demo/testing only. Rotate or delete demo users before production launch.
