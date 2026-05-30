# AGENT_CONTEXT.md

# Paste this entire file at the start of EVERY new agent session before giving any instruction.

---

# Project Brief

## MediConnect — Telehealth MVP for WC Launchpad Builder Round (Whitecloak)

Deadline: May 30, 2026 11:59 PM

Track: Software Engineer

Submission:
https://forms.gle/2QrDQ17KBhHqWqBK9

---

# Mission

Build a clean, deployable, production-safe MVP that fully satisfies all required features.

Prioritize:

1. Working end-to-end functionality
2. Modern implementation patterns
3. Clean UX
4. Maintainable architecture
5. Fast iteration speed
6. Simplicity over overengineering

Complete all required features before building extras.

---

# Scoring Priorities

| Competency                    | Weight |
| ----------------------------- | ------ |
| Functionality & Scope Covered | 40%    |
| Design & Product Sense        | 40%    |
| Adherence & Code Quality      | 10%    |
| Presentation & Communication  | 10%    |

---

# Tech Stack (Latest Stable)

| Layer                    | Choice                                        |
| ------------------------ | --------------------------------------------- |
| Frontend                 | Latest stable Next.js App Router + TypeScript |
| UI                       | shadcn/ui + Tailwind CSS                      |
| Backend                  | Next.js Route Handlers + Server Actions       |
| Database                 | PostgreSQL via Neon                           |
| ORM                      | Prisma ORM                                    |
| Authentication           | Auth.js (NextAuth v5 stable)                  |
| Real-time Notifications  | Pusher Channels                               |
| AI Recommendation Engine | Gemini (latest stable model)                  |
| Video Consultation       | Daily.co                                      |
| File Storage             | Vercel Blob                                   |
| Deployment               | Vercel                                        |

---

# Dependency & API Freshness Rules

Always use:

- latest stable package versions
- latest stable APIs
- latest official SDK syntax
- latest production-safe patterns

Avoid:

- deprecated APIs
- beta-only implementations unless necessary
- outdated tutorials
- Pages Router patterns
- legacy NextAuth examples
- obsolete React patterns

Before implementing any feature:

1. Verify official documentation first
2. Prefer App Router-native patterns
3. Prefer Server Actions where appropriate
4. Prefer official examples over tutorials
5. Avoid assumptions from older ecosystem versions

---

# Architecture Rules

Use:

- Route Handlers for external/public APIs
- Server Actions for internal mutations and forms
- Prisma transactions for multi-table writes
- Shared validation schemas using Zod
- React Server Components by default
- Client Components only when interactivity is required

Avoid:

- unnecessary REST endpoints
- duplicated validation logic
- excessive client-side fetching
- premature abstractions
- overengineered enterprise structure

Guiding principle:
Build the thinnest implementation that fully satisfies the MVP requirements while remaining maintainable and production-safe.

---

# Official Documentation References

Next.js:
https://nextjs.org/docs

Auth.js:
https://authjs.dev

Prisma:
https://www.prisma.io/docs

Neon:
https://neon.com/docs

Anthropic:
https://docs.anthropic.com

Daily.co:
https://docs.daily.co

Pusher:
https://pusher.com/docs

shadcn/ui:
https://ui.shadcn.com

Tailwind:
https://tailwindcss.com/docs

---

# Monorepo Structure

```txt
/
├── app/
│   ├── (auth)/
│   ├── (patient)/
│   ├── (doctor)/
│   ├── api/
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── shared/
│   ├── patient/
│   └── doctor/
│
├── actions/
├── lib/
├── hooks/
├── types/
├── validators/
├── prisma/
├── public/
├── middleware.ts
├── .env.local
└── AGENT_CONTEXT.md
```

---

# Backend Conventions

## Route Handlers

Use Route Handlers only for:

- public APIs
- webhook endpoints
- external integrations
- AI endpoints
- upload handlers

## Server Actions

Prefer Server Actions for:

- form submissions
- CRUD operations
- authenticated mutations
- dashboard interactions

---

# Database Standards

Use:

- Prisma schema relations
- transactions for atomic writes
- proper indexing
- enums for statuses
- server-side validation

Avoid:

- raw SQL unless necessary
- duplicated schemas
- untyped database responses

---

# Auth Standards

Use:

- Auth.js latest stable patterns
- Credentials provider
- bcrypt password hashing
- role-based middleware protection
- secure session handling

Roles:

- PATIENT
- DOCTOR

Unauthenticated users:

- redirect to /login

---

# UI/UX Standards

Use:

- shadcn/ui components
- accessible patterns
- responsive layouts
- loading states
- skeleton loaders
- toast feedback
- optimistic UX where appropriate

Design direction:

- clean healthcare aesthetic
- teal/green primary accents
- neutral backgrounds
- dashboard-first UX

---

# Code Quality Rules

Required:

- TypeScript strict mode
- No any types
- Zod validation
- try/catch in all async handlers
- proper HTTP status codes
- reusable utilities
- modular components

Prefer:

- components under ~200 lines
- composable architecture
- readable code over clever abstractions

Avoid:

- premature optimization
- deeply nested abstractions
- unnecessary state libraries

---

# AI Recommendation Engine

Use the latest stable Gemini production model available via the Google Gemini API.

Prompt:

```txt
You are a medical triage assistant.

A patient describes their symptoms below.

Return JSON only — no markdown, no explanation.

{
  "specialties": ["Cardiology"],
  "reasoning": "One sentence explanation"
}

Symptoms:
{{symptoms}}
```

---

# Daily.co Session Rules

When appointment status becomes CONFIRMED:

1. Create Daily.co room
2. Save room URL to appointment
3. Allow join within 10 minutes before session

Use embedded iframe consultation UI.

---

# Notification Rules

Use Pusher Channels for:

- appointment.booked
- appointment.cancelled
- appointment.reminder
- appointment.updated

Channels:

- patient-{userId}
- doctor-{userId}

---

# Feature Build Order

Do NOT skip phases.

Do NOT build future phases early.

Only proceed after current phase is manually verified working.

## Phase 1 — Auth & Profiles

1. Registration
2. Login
3. Patient profile
4. Doctor profile

## Phase 2 — Doctor Discovery & Scheduling

5. Doctor listing
6. Doctor detail page
7. Search/filter by specialization
8. Doctor schedule management

## Phase 3 — AI Recommendation

9. Symptom input
10. AI recommendation endpoint
11. Recommendation results UI

## Phase 4 — Appointment Booking

12. Appointment booking
13. Slot locking
14. Cancel/reschedule
15. Real-time notifications

## Phase 5 — Consultation Session

16. Daily.co room creation
17. Join session flow
18. Embedded consultation session

## Phase 6 — Medical Records

19. Doctor consultation notes
20. Prescription handling
21. Patient records/history page

---

# MVP Completion Checklist

- [x] Patient registration/login
- [x] Doctor registration/login
- [x] Profile onboarding
- [x] Doctor discovery
- [x] Search/filter
- [x] AI recommendations
- [x] Appointment booking
- [x] Reschedule/cancel
- [x] Real-time notifications
- [x] Video consultation
- [x] Consultation notes
- [x] Prescription records
- [x] Patient medical records
- [ ] Public deployment
- [ ] Public Git repository
- [x] Clear README

---

# Environment Variables

```bash
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
AUTH_TRUST_HOST=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GEMINI_API_KEY=
DAILY_API_KEY=
PUSHER_APP_ID=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
BLOB_READ_WRITE_TOKEN=
```

---

# Deployment Rules

Deployment target:

- Vercel

Build command:

```bash
npx prisma generate && next build
```

---

# What NOT To Build Yet

Do NOT build unless all MVP requirements are completed:

- Chat/messaging
- Payments
- Email notifications
- Admin dashboard
- Mobile app
- Analytics
- Multi-language support
- Advanced RBAC
- Complex state management
- Microservices

---

# Agent Operating Rules

You are acting as a senior production engineer building a real deployable MVP.

Priorities:

1. Working implementation
2. Modern ecosystem conventions
3. Fast iteration
4. Maintainability
5. Simplicity

DO:

- Prefer official documentation
- Prefer stable APIs
- Verify package syntax
- Use latest stable conventions
- Keep implementations thin and composable

DO NOT:

- Scaffold enterprise architecture prematurely
- Introduce unnecessary abstractions
- Use deprecated syntax
- Invent undocumented APIs
- Add features outside MVP scope

When conflicts occur:

1. Prioritize official documentation
2. Prioritize latest stable conventions
3. Prioritize working implementation

# SESSION STATE

## Current Phase

PHASE: 6 — Medical Records

STATUS: Completed

---

## Completed Items

### Phase 1

- [x] Registration
- [x] Login
- [x] Patient profile
- [x] Doctor profile

### Phase 2

- [x] Doctor listing
- [x] Doctor detail
- [x] Search/filter
- [x] Schedule management

### Phase 3

- [x] Symptom input
- [x] AI recommendation route
- [x] Recommendation results UI

### Phase 4

- [x] Appointment booking
- [x] Cancel/reschedule
- [x] Notifications

### Phase 5

- [x] Daily.co room creation
- [x] Join session flow
- [x] Embedded consultation

### Phase 6

- [x] Consultation notes
- [x] Prescription handling
- [x] Patient records

---

## Changes Made Outside MVP Scope

These are deliberate product/UX improvements added after the required MVP medical-records scope was already completed. They extend the experience but should be described as enhancements, not core MVP requirements.

- Doctor prescription Tab autocomplete during live consultation:
  - Added local medication templates for common prescriptions.
  - Doctors can type at least 2 letters in the prescription textarea and press `Tab` to expand the current line into a full dosage/SIG instruction.
  - Prescriptions remain editable plain text on the appointment record, so no database migration or new API surface was introduced.
  - Implemented in `app/(doctor)/doctor/appointments/[id]/session/DoctorSessionClient.tsx`.
- Visual/UX refinement pass:
  - Added clinical-warmth design tokens, shadcn-style primitives, light-mode enforcement, route fades, list staggers, card lift states, modal scale-in, status pulse dots, skeleton motion, and Gemini typing dots.
  - Refined auth pages, onboarding, doctor listing, schedule, records, symptoms, session screens, and dashboard surfaces without changing backend contracts.
- Dashboard workspace shell experiment:
  - Patient and doctor dashboards were restructured into local tabbed workspace shells with sidebar/mobile navigation.
  - TypeScript reportedly passed in the previous thread before interruption.
  - Treat this as a recent UI change that still needs browser QA and lint/build confirmation before final polish.

---

## Decisions Locked In

- Next.js App Router architecture
- Prisma ORM
- Neon PostgreSQL
- Auth.js authentication
- Pusher real-time notifications
- Daily.co video consultations
- Gemini-based recommendation engine (replacing Claude/Anthropic as per user specifications using gemini-1.5-flash)
- Downgraded to Prisma 6 to maintain standard env var datasource URL patterns in schema.prisma
- UTC date standardizations (all date searches/seeding normalize to midnight UTC to maintain absolute consistency across local node, database query parameters, and Vercel edge times)
- Suspense Boundaries for client side bails (useSearchParams wrapped in `<Suspense>` inside auth routes to satisfy static compilation during optimized production builds)
- Atomic transaction-level booking locks to prevent double-booking.
- Global toast provider-based message dispatcher mounted at layout level.
- Multi-client subscription model for patient-{id} and doctor-{id} real-time Pusher listener channels.
- Global light-mode enforcement by disabling Tailwind's media-query dark mode via `@custom-variant dark (&:not(*))`.
- Doctor consultation prescriptions use local, client-side medication templates with Tab completion; prescriptions remain stored as editable plain text on the appointment record.
- Patient booking and rescheduling now enforce future-only appointment slots at both availability-fetch and mutation layers.
- Production Vercel auth uses uploaded environment variables, including `AUTH_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.
- `.vercelignore` excludes local `.env` files from future CLI deployments.

---

## Known Issues

- Latest dashboard workspace-shell refactor was interrupted after code changes and TypeScript success, before a final lint/build/browser verification pass was recorded.
- `.vercelignore` was added after the successful env-var redeploy; the follow-up redeploy to apply that ignore file was not approved, so it will apply on the next deployment.

---

## Latest Milestone Update

Uploaded production environment variables to Vercel and restored the live deployment auth flow at `https://medi-connect-jade.vercel.app`.

Added `.vercelignore` to keep local `.env` files out of future CLI deployments.

Applied visual/UX refinements across the app, including design tokens, shadcn-style primitives, motion utilities, auth/onboarding polish, doctor listing refinements, schedule/records/symptoms polish, and status/loading feedback.

Fixed compressed Active Consulting Blocks in doctor schedule and normalized Patient Dashboard "Find & Schedule Doctor" card styling.

Started a patient/doctor dashboard workspace-shell restructure with local tabs and sidebar/mobile navigation. Code was changed and TypeScript reportedly passed, but the thread was interrupted before final verification was recorded.

Completed doctor prescription Tab autocomplete during live consultation.

Fixed patient booking/rescheduling so appointments can only be made for future slot start times. Same-day slots whose start time has already passed are filtered out of patient availability and rejected by server-side booking mutations.

Added a dedicated "Changes Made Outside MVP Scope" section to distinguish extra enhancements from required MVP checklist items.

Replaced the default Next.js README with a submission-ready project README covering product overview, feature list, tech stack, setup, environment variables, database commands, scripts, deployment, and implementation notes.

Modified files:

- `actions/appointments.ts`
- `actions/schedule.ts`
- `app/globals.css`
- `app/layout.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(doctor)/doctor/dashboard/DoctorDashboardClient.tsx`
- `app/(doctor)/doctor/schedule/DoctorScheduleClient.tsx`
- `app/(patient)/patient/dashboard/PatientDashboardClient.tsx`
- `app/(patient)/patient/doctors/DoctorListingClient.tsx`
- `app/(patient)/patient/doctors/[id]/DoctorDetailClient.tsx`
- `app/(patient)/patient/records/PatientRecordsClient.tsx`
- `app/(patient)/patient/symptoms/SymptomsClient.tsx`
- `app/(patient)/patient/appointments/[id]/session/PatientSessionClient.tsx`
- `app/(doctor)/doctor/appointments/[id]/session/DoctorSessionClient.tsx`
- `.vercelignore`
- `AGENT_CONTEXT.md`
- `components/ui/avatar.tsx`
- `components/ui/badge.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/toast.tsx`
- `lib/date-utils.ts`
- `lib/utils.ts`
- `README.md`
- `tailwind.config.ts`

Verification:

- `npx tsc --noEmit` passed.
- `npx eslint actions/appointments.ts actions/schedule.ts lib/date-utils.ts "app/(patient)/patient/doctors/[id]/DoctorDetailClient.tsx"` passed.
- `npx tsc --noEmit` reportedly passed after the latest dashboard workspace-shell changes.
- Full `npm run lint` was previously blocked by generated `.vercel/.next` output and pre-existing project lint issues unrelated to these changes.

---

## Current File Tree

```
./.env
./.env.local
./actions/appointments.ts
./actions/auth.ts
./actions/doctors.ts
./actions/schedule.ts
./AGENT_CONTEXT.md
./AGENTS.md
./app/(auth)/login/page.tsx
./app/(auth)/register/page.tsx
./app/(doctor)/doctor/dashboard/DoctorDashboardClient.tsx
./app/(doctor)/doctor/dashboard/page.tsx
./app/(doctor)/doctor/onboarding/DoctorOnboardingForm.tsx
./app/(doctor)/doctor/onboarding/page.tsx
./app/(doctor)/doctor/schedule/DoctorScheduleClient.tsx
./app/(doctor)/doctor/schedule/page.tsx
./app/(patient)/patient/dashboard/page.tsx
./app/(patient)/patient/dashboard/PatientDashboardClient.tsx
./app/(patient)/patient/doctors/[id]/DoctorDetailClient.tsx
./app/(patient)/patient/doctors/[id]/page.tsx
./app/(patient)/patient/doctors/DoctorListingClient.tsx
./app/(patient)/patient/doctors/page.tsx
./app/(patient)/patient/onboarding/page.tsx
./app/(patient)/patient/onboarding/PatientOnboardingForm.tsx
./app/(patient)/patient/records/page.tsx
./app/(patient)/patient/records/PatientRecordsClient.tsx
./app/(patient)/patient/symptoms/page.tsx
./app/(patient)/patient/symptoms/SymptomsClient.tsx
./app/api/recommend/route.ts
./app/favicon.ico
./app/globals.css
./app/layout.tsx
./app/page.tsx
./auth.ts
./Gemini.md
./eslint.config.mjs
./lib/date-utils.ts
./lib/daily.ts
./lib/db.ts
./app/(patient)/patient/appointments/[id]/session/page.tsx
./app/(patient)/patient/appointments/[id]/session/PatientSessionClient.tsx
./app/(doctor)/doctor/appointments/[id]/session/page.tsx
./app/(doctor)/doctor/appointments/[id]/session/DoctorSessionClient.tsx
./middleware.ts
./package.json
./package-lock.json
./postcss.config.mjs
./prisma/migrations/20260528164541_phase2_schedule/migration.sql
./prisma/migrations/migration_lock.toml
./prisma/schema.prisma
./public/file.svg
./public/globe.svg
./public/vercel.svg
./public/window.svg
./README.md
./tsconfig.json
./validators/auth.ts
```

---

## Env Vars Status

| Variable                   | Local | Vercel |
| -------------------------- | ----- | ------ |
| DATABASE_URL               | ☑     | ☑      |
| AUTH_SECRET                | ☑     | ☑      |
| AUTH_URL                   | ☑     | ☑      |
| AUTH_TRUST_HOST            | ☑     | ☑      |
| NEXTAUTH_SECRET            | ☑     | ☑      |
| NEXTAUTH_URL               | ☑     | ☑      |
| GEMINI_API_KEY             | ☑     | ☑      |
| DAILY_API_KEY              | ☑     | ☑      |
| PUSHER_APP_ID              | ☑     | ☑      |
| PUSHER_SECRET              | ☑     | ☑      |
| NEXT_PUBLIC_PUSHER_KEY     | ☑     | ☑      |
| NEXT_PUBLIC_PUSHER_CLUSTER | ☑     | ☑      |
| BLOB_READ_WRITE_TOKEN      | ☑     | ☑      |

---

## Repo & Deploy

Repo URL: https://github.com/jules-pecaoco/medi-connect

Deployed URL: https://medi-connect-jade.vercel.app/

---

# Session Update Rules

At the end of each completed milestone:

- update SESSION STATE
- summarize completed work
- list modified files
- list unresolved issues
- append important implementation decisions

Only output changed sections unless explicitly asked for the full file.
