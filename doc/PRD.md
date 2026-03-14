# Healthcare Workforce Marketplace Platform --- Product Requirement Document (PRD)

Generated: 2026-03-14

------------------------------------------------------------------------

# 1. Product Overview

## Vision

Build a digital marketplace that connects **healthcare facilities** with
**qualified healthcare workers** (nurses, CNAs, medical assistants,
etc.) for **temporary, contract, and shift-based staffing**.

Healthcare organizations frequently face staff shortages and
unpredictable scheduling needs. Healthcare workers want flexible
opportunities and reliable payments. The platform bridges this gap by
enabling:

-   Facilities to post shifts quickly
-   Workers to find shifts easily
-   Automated or rule-based matching
-   Secure verification and credential management
-   Messaging between facilities and workers
-   Time tracking and shift completion
-   Ratings and reviews

The system is conceptually similar to workforce marketplaces such as
Clipboard Health.

------------------------------------------------------------------------

# 2. Target Users

## Healthcare Workers

Examples:

-   Registered Nurses (RN)
-   Licensed Practical Nurses (LPN)
-   Certified Nursing Assistants (CNA)
-   Medical technicians
-   Healthcare assistants

Needs:

-   Find flexible shifts
-   Control availability
-   Earn reliable payments
-   Work with verified healthcare facilities

------------------------------------------------------------------------

## Healthcare Facilities

Examples:

-   Hospitals
-   Clinics
-   Nursing homes
-   Rehabilitation centers
-   Assisted living facilities

Needs:

-   Fill staffing shortages quickly
-   Find verified professionals
-   Track worker performance
-   Manage multiple facilities and shifts

------------------------------------------------------------------------

# 3. Tech Stack

## Frontend

-   Next.js 15 (App Router)
-   TypeScript (strict mode)
-   TailwindCSS
-   shadcn/ui
-   TanStack Query
-   React Hook Form
-   Zod validation

## Backend

-   Supabase
-   PostgreSQL
-   Supabase Auth
-   Row Level Security (RLS)
-   Supabase Realtime

## File Storage

-   Supabase Storage

Used for:

-   licenses
-   certifications
-   identity documents
-   compliance documents

## Maps

-   Google Maps API

Used for:

-   distance calculation
-   nearby shift search

------------------------------------------------------------------------

# 4. MVP Scope

Only implement these features for MVP:

1 Authentication 2 Worker profile creation 3 Facility profile creation 4
Shift posting 5 Shift search 6 Apply to shift 7 Assign worker 8
Messaging system 9 Clock in / clock out 10 Ratings and reviews 11 Worker
availability management 12 License & certification verification

Not required for MVP:

-   AI matching
-   dynamic pricing
-   predictive analytics
-   EMR integrations
-   VR or AR features

------------------------------------------------------------------------

# 5. Core Features

## 5.1 Authentication & User Roles

Roles:

-   healthcare_worker
-   facility_admin
-   admin

Authentication methods:

-   Email + password
-   Magic link (optional)

------------------------------------------------------------------------

## 5.2 Worker Profile

Workers create detailed profiles including:

-   full name
-   phone
-   location
-   specialty
-   years of experience
-   bio
-   certifications
-   licenses

Verification status:

-   pending
-   verified
-   rejected

------------------------------------------------------------------------

## 5.3 Facility Profile

Facilities register and manage:

-   facility name
-   facility type
-   address
-   contact details
-   departments
-   staffing requirements

Facilities may manage **multiple locations**.

------------------------------------------------------------------------

## 5.4 Multi-Facility Management

Organizations can manage multiple facilities.

Example:

Hospital group may operate:

-   Hospital A
-   Clinic B
-   Nursing home C

Each facility may post shifts independently.

------------------------------------------------------------------------

## 5.5 License & Certification Verification

Workers must upload:

-   nursing license
-   certifications
-   identity documents

Documents stored in Supabase Storage.

Fields:

-   document type
-   issue date
-   expiry date
-   verification status

------------------------------------------------------------------------

## 5.6 Compliance Tracking

Healthcare compliance requires tracking:

-   license expiration
-   training expiration
-   certification validity

System should notify workers when documents are close to expiration.

------------------------------------------------------------------------

## 5.7 Worker Availability Management

Workers set preferred working hours.

Example:

Monday: 8AM--4PM\
Wednesday: night shifts\
Weekends only

Facilities can search workers based on availability.

------------------------------------------------------------------------

## 5.8 Shift Management

Facilities can create shift postings.

Shift fields:

-   title
-   facility_id
-   department
-   specialty_required
-   shift_date
-   start_time
-   end_time
-   hourly_rate
-   workers_needed
-   location
-   description
-   urgent_flag

Shift statuses:

-   open
-   assigned
-   completed
-   cancelled

------------------------------------------------------------------------

## 5.9 Emergency Shift Coverage

Facilities may mark shifts as **urgent**.

Urgent shifts trigger notifications to nearby workers.

------------------------------------------------------------------------

## 5.10 Shift Search

Workers browse shifts with filters:

-   location
-   distance
-   pay rate
-   specialty
-   date
-   urgency

Sorting options:

-   highest pay
-   nearest
-   newest

------------------------------------------------------------------------

## 5.11 Shift Applications

Workers apply for shifts.

Application fields:

-   worker_id
-   shift_id
-   application_status
-   applied_at

Status:

-   applied
-   accepted
-   rejected
-   cancelled

------------------------------------------------------------------------

## 5.12 Shift Assignment

Facilities select a worker and assign the shift.

Assignment includes:

-   worker_id
-   shift_id
-   assigned_at
-   assignment_status

------------------------------------------------------------------------

## 5.13 Messaging System

Workers and facilities communicate through in-app messaging.

Features:

-   real-time chat
-   conversation history
-   notifications

------------------------------------------------------------------------

## 5.14 Time Tracking

Workers clock in and clock out.

Fields:

-   clock_in_time
-   clock_out_time
-   hours_worked

Optional:

-   GPS validation

------------------------------------------------------------------------

## 5.15 Ratings & Reviews

After shift completion:

Facility rates worker.\
Worker rates facility.

Fields:

-   rating (1--5)
-   review text
-   reviewer_id
-   reviewee_id

------------------------------------------------------------------------

# 6. Data Model

## Core Tables

users

worker_profiles

facility_profiles

facilities

facility_users

shifts

applications

assignments

timesheets

reviews

certifications

licenses

availability

messages

notifications

------------------------------------------------------------------------

## Example Relationships

User ├── WorkerProfile └── FacilityProfile

Facility └── Shifts

Shift └── Applications └── Assignment └── Timesheet

Worker └── Certifications

Users └── Messages

------------------------------------------------------------------------

# 7. API Endpoints

Auth

POST /auth/signup\
POST /auth/login\
POST /auth/logout

Workers

GET /workers/me\
PUT /workers/profile

Facilities

GET /facilities/me\
PUT /facilities/profile

Shifts

GET /shifts\
POST /shifts\
GET /shifts/:id

Applications

POST /applications\
GET /applications/my

Assignments

POST /assignments\
GET /assignments/my

Messaging

GET /messages\
POST /messages

------------------------------------------------------------------------

# 8. User Flows

## Worker Flow

1 Register 2 Create profile 3 Upload certifications 4 Set availability 5
Browse shifts 6 Apply for shift 7 Get assigned 8 Work shift 9 Clock out
10 Leave review

------------------------------------------------------------------------

## Facility Flow

1 Register facility 2 Create facility profile 3 Post shift 4 Review
applicants 5 Assign worker 6 Track shift completion 7 Rate worker

------------------------------------------------------------------------

# 9. Metrics to Track

Platform metrics:

-   Monthly active workers
-   Monthly active facilities
-   Shift fill rate
-   Time to fill shift
-   Worker retention rate
-   Facility retention rate
-   Average shift value
-   Worker utilization rate

------------------------------------------------------------------------

# 10. Security

-   Supabase Row Level Security enabled on all tables
-   Role-based access control
-   Secure document storage
-   Input validation with Zod
-   Service role keys never exposed to client

------------------------------------------------------------------------

# 11. Hackathon Build Scope

Focus only on:

-   authentication
-   profiles
-   shifts
-   applications
-   assignments
-   messaging
-   clock in/out
-   reviews

Everything else is optional.

------------------------------------------------------------------------
