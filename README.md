# MediConnect

MediConnect is a telehealth MVP built for the Whitecloak WC Launchpad Builder Round. It supports patient onboarding, doctor discovery, AI-assisted specialty recommendations, appointment booking, real-time notifications, video consultations, consultation notes, prescriptions, and patient medical records.

Live app: https://medi-connect-jade.vercel.app/

Repository: https://github.com/jules-pecaoco/medi-connect

## Features

- Patient and doctor registration/login with role-based routing.
- Patient and doctor profile onboarding.
- Doctor directory with specialization search and profile detail pages.
- Doctor schedule management with generated appointment slots.
- Patient appointment booking, cancellation, and rescheduling.
- Future-only booking guard so patients cannot book or reschedule into past time slots.
- Atomic slot locking to prevent double-booking.
- Gemini-powered symptom triage recommendations.
- Pusher real-time appointment notifications.
- Daily.co embedded video consultation rooms.
- Doctor consultation notes and prescription recording.
- Patient medical records/history page with prescription viewing/printing.
- Doctor prescription Tab autocomplete for common medication instructions.

## Tech Stack

- Next.js App Router 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM 6
- PostgreSQL via Neon
- Auth.js / NextAuth v5
- Gemini API via `@google/generative-ai`
- Daily.co
- Pusher Channels
- Vercel

## Project Structure

```txt
app/
  (auth)/       Login and registration
  (doctor)/     Doctor dashboard, schedule, onboarding, consultation room
  (patient)/    Patient dashboard, discovery, booking, records, symptoms
  api/          Route handlers
actions/        Server actions for auth, doctors, schedules, appointments
components/     Shared UI and feature components
lib/            Database, date, Daily.co, and Pusher helpers
prisma/         Prisma schema and migrations
validators/     Zod validation schemas
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` is not present, create `.env.local` with the variables listed below.

Generate the Prisma client:

```bash
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Environment Variables

```bash
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GEMINI_API_KEY=
DAILY_API_KEY=
PUSHER_APP_ID=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
BLOB_READ_WRITE_TOKEN=

# Testing only: join video consultation before the 10-minute pre-slot window
NEXT_PUBLIC_ALLOW_EARLY_CONSULT_JOIN=
```

For local development, `NEXTAUTH_URL` should usually be:

```bash
NEXTAUTH_URL=http://localhost:3000
```

To test early video join (both patient and doctor can enter the Daily room immediately):

```bash
NEXT_PUBLIC_ALLOW_EARLY_CONSULT_JOIN=true
```

### Real-time notification QA

Pusher toasts are delivered on **every authenticated route** (dashboard tabs, doctor listing, records, session pages, etc.) via the root layout `NotificationListener`. The sidebar does not control subscriptions.

**Local**

1. Set all four Pusher variables in `.env.local`.
2. Open two browsers (e.g. Chrome = patient, Firefox incognito = doctor) and log in as different roles.
3. Book, cancel, or reschedule from one side; the other should show a bottom-right toast.
4. Console should show: `[Pusher Client] Subscribed to channel: patient-…` or `doctor-…`.

**Production (Vercel)**

1. In Vercel → Project → Settings → Environment Variables, set all four vars for **Production** (not Preview-only):
   `PUSHER_APP_ID`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`.
2. **Redeploy** production after any env change (use **Clear build cache** if vars were added recently).
3. On the live site, open DevTools → Console while logged in:
   - Good: `[Pusher Client] Subscribed to channel: …`
   - Bad: `Missing key or cluster from server config` → Production env not set or deployment needs redeploy.
4. Book on production; in Vercel → Logs search for `[Pusher success]` or `[Pusher] Server credentials missing`.

The app passes Pusher key/cluster from the **server layout** at request time (not only from the client bundle), so production works once Vercel runtime env is correct.

| Test | Expected |
|------|----------|
| Local + Local | Toasts on both |
| Local + Live | Live tab still toasts when booking on localhost (live client subscribed) |
| Live + Live | Toasts on both; Vercel logs show `[Pusher success]` |

Events: `appointment.booked`, `appointment.cancelled`, `appointment.updated`, `appointment.completed`.

## Database

The app uses Prisma with PostgreSQL. The schema includes:

- `User`
- `PatientProfile`
- `DoctorProfile`
- `DoctorSchedule`
- `TimeSlot`
- `Appointment`

Apply migrations to your database:

```bash
npx prisma migrate deploy
```

For development, you can inspect the database with:

```bash
npx prisma studio
```

## Scripts

```bash
npm run dev      # Start local development server
npm run build    # Generate Prisma client and build Next.js
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

The project is designed for Vercel.

Build command:

```bash
npm run build
```

The configured build script runs:

```bash
prisma generate && next build
```

Before deploying, add the required environment variables in Vercel, including the production `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Gemini key, Daily.co key, and Pusher credentials.

## Notes

- Booking and rescheduling are protected on both UI and server action layers.
- Appointment slots are normalized by UTC date, while schedule start/end times are combined carefully for booking and consultation access windows.
- Prescription autocomplete is intentionally local and lightweight. It does not add a new database model; final prescriptions are still stored as editable text on the appointment record.
