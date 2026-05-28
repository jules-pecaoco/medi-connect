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

| Layer                    | Choice                                            |
| ------------------------ | ------------------------------------------------- |
| Frontend                 | Latest stable Next.js App Router + TypeScript     |
| UI                       | shadcn/ui + Tailwind CSS                          |
| Backend                  | Next.js Route Handlers + Server Actions           |
| Database                 | PostgreSQL via Neon                               |
| ORM                      | Prisma ORM                                        |
| Authentication           | Auth.js (NextAuth v5 stable)                      |
| Real-time Notifications  | Pusher Channels                                   |
| AI Recommendation Engine | Anthropic Claude API (latest stable Sonnet model) |
| Video Consultation       | Daily.co                                          |
| File Storage             | Vercel Blob                                       |
| Deployment               | Vercel                                            |

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

Use the latest stable Claude Sonnet production model available via the Anthropic SDK.

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
- [ ] Appointment booking
- [ ] Reschedule/cancel
- [ ] Real-time notifications
- [x] Video consultation
- [ ] Consultation notes
- [ ] Prescription records
- [ ] Patient medical records
- [ ] Public deployment
- [ ] Public Git repository
- [ ] Clear README

---

# Environment Variables

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ANTHROPIC_API_KEY=
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

STATUS: Not started

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

- [ ] Consultation notes
- [ ] Patient records

---

## Decisions Locked In

- Next.js App Router architecture
- Prisma ORM
- Neon PostgreSQL
- Auth.js authentication
- Pusher real-time notifications
- Daily.co video consultations
- Gemini-based recommendation engine (replacing Claude as per user specifications using gemini-1.5-flash)
- Downgraded to Prisma 6 to maintain standard env var datasource URL patterns in schema.prisma
- UTC date standardizations (all date searches/seeding normalize to midnight UTC to maintain absolute consistency across local node, database query parameters, and Vercel edge times)
- Suspense Boundaries for client side bails (useSearchParams wrapped in `<Suspense>` inside auth routes to satisfy static compilation during optimized production builds)
- Atomic transaction-level booking locks to prevent double-booking.
- Global toast provider-based message dispatcher mounted at layout level.
- Multi-client subscription model for patient-{id} and doctor-{id} real-time Pusher listener channels.

---

## Known Issues

None currently.

---

## Current File Tree

```
./.env
./.env.local
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
./app/(patient)/patient/symptoms/page.tsx
./app/(patient)/patient/symptoms/SymptomsClient.tsx
./app/api/recommend/route.ts
./app/favicon.ico
./app/globals.css
./app/layout.tsx
./app/page.tsx
./auth.ts
./CLAUDE.md
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
| DATABASE_URL               | ☑     | ☐      |
| NEXTAUTH_SECRET            | ☑     | ☐      |
| NEXTAUTH_URL               | ☑     | ☐      |
| GEMINI_API_KEY             | ☑     | ☐      |
| DAILY_API_KEY              | ☑     | ☐      |
| PUSHER_APP_ID              | ☑     | ☐      |
| PUSHER_SECRET              | ☑     | ☐      |
| NEXT_PUBLIC_PUSHER_KEY     | ☑     | ☐      |
| NEXT_PUBLIC_PUSHER_CLUSTER | ☑     | ☐      |
| BLOB_READ_WRITE_TOKEN      | ☑     | ☐      |

---

## Repo & Deploy

Repo URL: [fill in]

Deployed URL: [fill in]

---

# Session Update Rules

At the end of each completed milestone:

- update SESSION STATE
- summarize completed work
- list modified files
- list unresolved issues
- append important implementation decisions

Only output changed sections unless explicitly asked for the full file.
