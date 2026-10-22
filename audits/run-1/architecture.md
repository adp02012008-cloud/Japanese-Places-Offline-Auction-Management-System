# System Architecture & Trust Boundaries

### 1. Product & Purpose
The **Japanese Places Offline Auction Management System** is a full-stack event management and auction execution platform built for offline live auctions. Participating teams bid on Japanese landmarks/places. Each place has a starting bid price and a confidential `actual_worth` evaluation known exclusively to event administrators until the official winner calculation.

### 2. Principals and Roles
- **Unauthenticated Public / Attendees**: View public landmark catalogues (`/api/places`) and live presentation projector feeds (`/api/presentation`). Can submit new team registrations (`/api/registration`) and attempt login (`/api/auth/login`).
- **Team Accounts**: Authenticated participating teams possessing a session token (`role: 'TEAM'`). Authorized to view their own remaining budget, acquired landmarks, and team roster (`/api/team/dashboard`). Strictly prohibited from accessing confidential actual worth valuations or other teams' private financials.
- **Administrators**: Privileged operators (`role: 'ADMIN'`). Authorized to manage landmarks, approve/reject teams, set starting budgets, execute sale confirmations (`/api/admin/sales`), calculate rankings (`/api/admin/results`), toggle public winner announcements, and inspect audit trails (`/api/admin/audit`).

### 3. Tech Stack & Local Execution Model
- **Framework**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS.
- **Database & Storage**: Supabase (PostgreSQL with PostgREST gateway, Supabase Storage buckets).
- **Authentication**: JWT edge session cookies (`ja_session_token`, HS256 via `jose`), Argon2id password hashing with scrypt fallback.
- **Local Sandbox Policy**: Sandboxed local execution with zero live external network probing, read-only target mounts, and dummy credentials.

### 4. Key Entry Surfaces & Sinks
- `POST /api/auth/login`: Accepts credentials, issues signed `ja_session_token` HTTP-only cookie.
- `GET /api/places`: Queries catalogue landmarks with strict column projection excluding `actual_worth`.
- `GET /api/presentation`: Real-time projector data feed with withheld financial calculations until admin announcement.
- `POST /api/registration`: Public team registration with duplicate name and enrollment number checks.
- `POST /api/admin/sales`: Admin endpoint to confirm offline purchases, deduct budgets, and record audit entries.
- `Supabase PostgREST Gateway`: Public HTTPS gateway to database tables using `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

### 5. Companion Selection
- **WEB-PROTOCOL-AND-AUTH.md**: Selected for JWT cookie sessions, CORS, and role-based access control.
- **DATA-ISOLATION-AND-LIFECYCLE.md**: Selected for team data isolation, confidential valuation protection, and audit logs.
- **CLIENT-SIDE.md**: Selected for Next.js client component state, projection displays, and client-side Supabase credentials.
- **CLOUD-AND-DEPLOYMENT.md**: Selected for Supabase PostgreSQL row level security policies and environment secrets.
- **RESOURCE-EXHAUSTION-AND-AVAILABILITY.md**: Selected for authentication endpoint rate limiting and concurrency.
