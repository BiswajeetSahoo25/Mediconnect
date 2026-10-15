# MediConnect

MediConnect is a healthcare web application for patients, doctors, and administrators. Patients can discover doctors and healthcare facilities, book appointments, manage their profile, and keep medical documents in one place. Doctors can manage their professional profile and appointments, while administrators review doctor applications.

> MediConnect is an actively developed project. It is intended as a product and engineering project, not as a substitute for professional medical advice or emergency care.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Application structure](#application-structure)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [Database and development data](#database-and-development-data)
- [Available commands](#available-commands)
- [Main routes](#main-routes)
- [API overview](#api-overview)
- [Troubleshooting](#troubleshooting)

## Features

### Patients

- Sign up, sign in, session refresh, and account settings
- Profile onboarding, addresses, and emergency contacts
- Patient dashboard with appointment and medical-record summaries
- Search doctors by details and specialization; view profiles and availability
- Book and manage appointments
- Upload, preview, download, and remove medical records (PDF, JPG, PNG, and WEBP; up to 5 MB)
- Discover healthcare facilities by location
- Read health articles and browse medicine information
- Apply to become a doctor

### Doctors

- Doctor application and administrator review workflow
- Doctor workspace with professional profile and practice locations
- Manage specializations and appointments

### Administrators

- Review, approve, revoke, and re-verify doctor applications
- Manage article content through the API

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Axios |
| Backend | Node.js, Express 5, TypeScript, Zod |
| Database | PostgreSQL with Prisma ORM |
| Authentication | JWT access tokens, HTTP-only refresh cookie, Argon2 password hashing |
| Location and facility search | Geoapify |
| Medicine information | openFDA (API key optional) |

Medical record file contents are currently stored in PostgreSQL (`BYTEA`) alongside their record metadata. The app does not currently require a separate file-storage provider.

## Application structure

```text
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Committed PostgreSQL migrations
│   │   └── seed/dev/         # Development-only seed scripts
│   └── src/
│       ├── config/           # Environment and Prisma setup
│       ├── middleware/       # Authentication, roles, validation, errors
│       └── modules/          # Auth, patients, doctors, appointments, etc.
└── frontend/
    └── src/
        ├── components/       # Shared UI and route guards
        ├── context/          # Authentication and location state
        ├── features/         # Feature pages, services, and types
        ├── layouts/          # Public, patient, auth, and doctor layouts
        └── pages/            # Shared and informational pages
```

The backend uses a layered structure: **routes → controllers → services → repositories → Prisma/PostgreSQL**. The frontend is a Vite single-page application; its API client sends credentialed requests to the backend.

## Requirements

- Node.js **22.12 or newer** (Node 24 LTS also works with the current toolchain)
- npm
- PostgreSQL and a database named `mediconnect`
- A Geoapify API key for facility/location search

Check installed versions:

```bash
node --version
npm --version
```

## Run locally

### 1. Get the code

```bash
git clone https://github.com/BiswajeetSahoo25/Mediconnect.git
cd Mediconnect
```

### 2. Create the PostgreSQL database

Create a PostgreSQL database named `mediconnect`. For example, if `psql` is installed:

```bash
psql -U postgres -c "CREATE DATABASE mediconnect;"
```

If the database already exists, keep it and continue. The database user in `DATABASE_URL` must be allowed to connect and run migrations.

### 3. Configure and start the backend

In one terminal, from the repository root:

```bash
cd backend
npm install
```

Create `backend/.env` from the example and edit its values. PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Set `DATABASE_URL` to your PostgreSQL credentials and database, and set a real `GEOAPIFY_API_KEY`. See [Environment variables](#environment-variables) below.

Apply the committed migrations and generate the Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Start the API:

```bash
npm run dev
```

The API listens on `http://localhost:3000` by default. Check that it is running at <http://localhost:3000/health>.

### 4. Configure and start the frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Start Vite:

```bash
npm run dev
```

Open the URL printed by Vite, usually <http://localhost:5173>. Keep both development servers running.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | One of `development`, `test`, or `production`; use `development` locally. |
| `PORT` | Yes | Integer from `1` to `65535`; normally `3000`. |
| `DATABASE_URL` | Yes | PostgreSQL connection string, for example `postgresql://postgres:password@localhost:5432/mediconnect`. |
| `FRONTEND_URL` | Yes | Exact frontend origin allowed by CORS; normally `http://localhost:5173`. |
| `JWT_ACCESS_SECRET` | Yes | Secret used to sign access tokens. In production it must be at least 32 UTF-8 bytes and cannot be an obvious placeholder or low-variety default. |
| `JWT_ACCESS_EXPIRES_IN` | Yes | Positive access-token lifetime; use a JOSE time span such as `15m`, `2 hours`, or `1 day`. |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Yes | Positive integer number of days, for example `30`. |
| `GEOAPIFY_API_KEY` | Yes | Geoapify key used by healthcare-facility and location search. |
| `OPENFDA_API_KEY` | No | Optional key for openFDA requests; the code can call openFDA without it. |
| `SEED_ADMIN_EMAIL` | For admin/article/doctor seeds | Email for the local development admin created or reused by those seeds. |
| `SEED_ADMIN_PASSWORD` | For admin/article/doctor seeds | Local development admin password. Choose your own value. |
| `SEED_DOCTOR_PASSWORD` | For doctor seeds | Password for fictional seeded doctors. Set a private local value before running the seed; the template value is only a reminder. |

Keep real `.env` files and credentials out of Git. Only use development seed accounts and credentials with local development data.

`backend/.env.example` is a development template, not a production configuration. The runtime rejects placeholder values for production credentials and requires a strong access-token secret. Generate a secret, then put it directly into your deployment secret manager (do not commit it):

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

The generated value is 48 random bytes encoded as text. Keep `OPENFDA_API_KEY` empty when you do not use that optional service.

For local setup, copy `backend/.env.example` to `backend/.env`, then replace its database password, Geoapify key, JWT secret, and seed credential placeholders with private development values. The seed scripts reject missing or placeholder passwords. Seed passwords are examples only; do not use them outside a disposable local database.

### Frontend (`frontend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Backend API base URL, normally `http://localhost:3000/api/v1`. |

Vite exposes `VITE_*` values to the browser. Never put server secrets or database credentials in frontend environment variables.

## Database and development data

The Prisma schema is in `backend/prisma/schema.prisma`; the migration history is in `backend/prisma/migrations/`.

- **Fresh/local setup:** `npx prisma migrate deploy` applies all committed migrations to the configured database.
- **After changing the Prisma schema during development:** create a migration with `npx prisma migrate dev --name describe_change`, then run `npx prisma generate`.
- **Check migration state:** `npx prisma migrate status`.

Optional development seeds (run from `backend/`):

```bash
npm run seed:specializations
npm run seed:doctors
npm run seed:articles
```

`seed:doctors` creates fictional doctors, facilities, departments, and availability for local discovery/booking flows. `seed:articles` creates/reuses the admin specified by `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, then seeds articles. These scripts write to the connected database: use a development database, never a production database. You can also register a patient through the frontend rather than seeding one.

## Available commands

Run commands from the relevant package directory.

### Backend (`backend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Run the API with TypeScript watch/restart. |
| `npm run build` | Compile TypeScript into `backend/dist`. |
| `npm start` | Run the compiled API. Build first. |
| `npm run typecheck` | Type-check without emitting files. |
| `npm run test:env` | Run isolated environment-validation tests; no database is required. |
| `npm run test:error-middleware` | Run HTTP error response regression tests. |
| `npm run test:security` | Run authentication and security regression tests; database cases are skipped unless explicitly enabled. |
| `npm run test:appointment-time` | Run deterministic appointment timezone and slot-generation tests. |
| `npx prisma migrate deploy` | Apply committed migrations. |
| `npx prisma generate` | Generate the Prisma client. |
| `npm run seed:specializations` | Seed the specialization catalog. |
| `npm run seed:doctors` | Seed fictional doctor and facility data. |
| `npm run seed:articles` | Seed articles and the development admin. |
| `npm run test:appointment-integrity` | Run appointment integrity tests; database cases require explicit opt-in and a dedicated local PostgreSQL database whose name contains `test`. |

### Frontend (`frontend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Run the Vite development server. |
| `npm run build` | Type-check and create the production build in `frontend/dist`. |
| `npm run preview` | Serve the last production build locally. |
| `npm run typecheck` | Type-check without creating a production bundle. |
| `npm run lint` | Run ESLint. |
| `npm run test:homepage-navigation` | Run homepage navigation and search URL tests. |

Database integration tests must never target a production or shared database. For appointment integrity tests, set `NODE_ENV=test`, point `DATABASE_URL` at a dedicated local database with `test` in its name, and set `RUN_APPOINTMENT_INTEGRATION_TESTS=1`. Medical-record database tests use the same safeguards with `RUN_SECURITY_INTEGRATION_TESTS=1`. Both suites skip database work by default.

The root `npm test` script is currently a placeholder; use the package-level commands above.

## Main routes

### Public

| Route | Page |
| --- | --- |
| `/` | Home |
| `/about` | About MediConnect |
| `/doctors` | Doctor discovery |
| `/doctors/:id` | Doctor profile and availability |
| `/healthcare` | Healthcare facility discovery |
| `/healthcare/:placeId` | Facility details |
| `/health-articles` | Health articles |
| `/health-articles/:slug` | Article details |
| `/medicines` | Medicine search |
| `/medicines/:id` | Medicine details |
| `/faq`, `/help`, `/contact` | Help and information |
| `/privacy`, `/terms` | Policies |
| `/login`, `/signup` | Authentication |

### Signed-in application

| Route | Access |
| --- | --- |
| `/onboarding` | Signed-in users completing patient setup |
| `/dashboard` | Patient dashboard |
| `/appointments` | Patient appointment list |
| `/appointments/:id` | Appointment details |
| `/doctors/:id/book` | Patient appointment booking |
| `/records` | Patient medical records |
| `/account` | Account settings |
| `/apply-as-doctor` | Eligible patients applying as a doctor |
| `/doctor-dashboard` | Doctor dashboard |
| `/doctor-dashboard/profile` | Doctor profile and practice |
| `/doctor-dashboard/appointments` | Doctor appointment management |
| `/admin/doctor-applications` | Admin doctor-application review |

Protected routes enforce authentication, role, and onboarding/application rules in the frontend and backend.

## API overview

The backend API is versioned under `/api/v1`. Useful route groups include:

| Prefix | Purpose |
| --- | --- |
| `/api/v1/auth` | Signup, login, logout, refresh, current user |
| `/api/v1/users` | User profile, onboarding, and account operations |
| `/api/v1/patients` | Patient profile and medical records |
| `/api/v1/patients/me/emergency-contacts` | Patient emergency contacts |
| `/api/v1/users/me/addresses` | User addresses |
| `/api/v1/doctors` | Doctor discovery, applications, profiles, and availability |
| `/api/v1/specializations` | Specialization catalog |
| `/api/v1/appointments` | Booking and appointment management |
| `/api/v1/articles` | Health articles |
| `/api/v1/facilities` | Healthcare facility discovery |
| `/api/v1/medicines` | Medicine information |

`GET /health` is a basic service health check. Authenticated endpoints use the app’s access-token and refresh-cookie flow.

## Troubleshooting

### Backend exits with “Missing required environment variable”

Confirm that `backend/.env` exists and includes all required variables listed above. `NODE_ENV` must be `development`, `test`, or `production`; `PORT` must be an integer from `1` to `65535`; and `REFRESH_TOKEN_EXPIRES_IN_DAYS` must be a positive integer day count, for example `30`. Restart the backend after changing environment variables.

For production startup, replace all template credentials. `JWT_ACCESS_SECRET` must contain at least 32 UTF-8 bytes and have varied characters; obvious placeholders in production credentials are rejected. Generate and store secrets in the deployment platform, not in Git.

### Database connection or Prisma migration errors

- Make sure PostgreSQL is running, `mediconnect` exists, and `DATABASE_URL` has the right host, port, user, password, and database name.
- From `backend/`, run `npx prisma migrate status` to see whether migrations are pending.
- Apply committed migrations with `npx prisma migrate deploy`, then run `npx prisma generate`.

### Browser reports a CORS or network error

Check that the backend is listening on the configured port, `VITE_API_BASE_URL` points to its `/api/v1` URL, and `FRONTEND_URL` exactly matches the frontend origin (including port). Restart both servers after changing `.env` files.

### Facility search does not return results

`GEOAPIFY_API_KEY` is required by the backend configuration and must be a valid Geoapify key. Check the backend console and the key’s service/usage settings.

### Port is already in use

Stop the other process using the port or change `PORT` in `backend/.env`. If the backend port changes, update `VITE_API_BASE_URL` in `frontend/.env` to match.

## Contributing

Keep database schema changes in Prisma migrations, validate request data at the API boundary, and preserve patient/doctor/admin authorization checks when changing protected flows. Keep credentials and real patient information out of commits, logs, screenshots, and development seeds.
