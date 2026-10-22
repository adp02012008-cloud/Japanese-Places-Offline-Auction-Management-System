# Confirmed Findings — Detailed Technical Dossier

## 1. FPT-SUPABASE-RLS-001: Disabled Row Level Security Exposes Confidential Valuations via PostgREST

- **Overall Severity**: `high` (Likelihood: `high`, Impact: `high`, Confidence: `high`)
- **Category**: Access Control / Cloud & Deployment
- **Target Invariant**: Database tables containing confidential valuations and administrative credentials must enforce Row Level Security against unauthenticated direct access through the public PostgREST API.

### Source Trace & Evidence
1. **Entrypoint**: `src/utils/supabase/client.ts:4` — Public client bundle configures browser access using `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. **Propagation**: `supabase/schema.sql:131` — `ALTER TABLE public.places DISABLE ROW LEVEL SECURITY;`
3. **Propagation**: `supabase/schema.sql:135` — `ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;`
4. **Sink**: `supabase/schema.sql:48` — `actual_worth NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- CONFIDENTIAL`

### Threat Scenario & Reproduction
While the Next.js API route (`/api/places`) correctly performs an explicit SQL projection to omit `actual_worth`, the underlying database is hosted on Supabase which exposes a direct PostgREST HTTP interface (`https://<project-ref>.supabase.co/rest/v1/`).
Because `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is embedded in the frontend bundle and RLS is disabled across the schema, any attendee or competing team can query the database directly:

```http
GET /rest/v1/places?select=place_name,actual_worth HTTP/1.1
Host: <supabase-project-id>.supabase.co
apikey: <NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY>
Authorization: Bearer <NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY>
```

**Observed Result**:
The database directly returns unredacted JSON records containing each landmark's confidential `actual_worth`. Bidders can calculate exact profit margins before bidding starts, completely subverting the auction gameplay.

### Remediation
1. Enable Row Level Security on all tables in `supabase/schema.sql`:
   ```sql
   ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
   ```
2. Create restrictive RLS policies so that anonymous / public users cannot query `places.actual_worth`, `admins`, or `audit_logs` directly through PostgREST.

---

## 2. FPT-AUTH-JWT-SECRET-001: Predictable Fallback Secret Allows Remote JWT Session Forgery

- **Overall Severity**: `high` (Likelihood: `medium`, Impact: `critical`, Confidence: `high`)
- **Category**: Cryptography & Secrets / Web Protocol & Auth
- **Target Invariant**: Cryptographic signing secrets must be generated with high entropy and strictly required in production deployments without falling back to public static strings.

### Source Trace & Evidence
1. **Entrypoint**: `src/lib/auth/session.ts:6-8`
   ```typescript
   const JWT_SECRET = new TextEncoder().encode(
     process.env.AUTH_SECRET || 'japanese_places_auction_default_secret_fallback_key_2026'
   );
   ```
2. **Propagation**: `src/lib/auth/session.ts:48-61` — `verifySessionToken` validates incoming `ja_session_token` cookie against `JWT_SECRET`.
3. **Sink**: `src/lib/auth/rbac.ts:18-25` — `requireAdmin` grants full administrative authorization if `session.role === 'ADMIN'`.

### Threat Scenario & Reproduction
If an administrator deploys the application to Vercel without configuring `AUTH_SECRET` in environment variables:
1. The signing secret defaults to `'japanese_places_auction_default_secret_fallback_key_2026'`.
2. An attacker crafts a forged JWT payload:
   ```json
   {
     "userId": "attacker-admin",
     "username": "admin",
     "role": "ADMIN",
     "exp": 1893456000
   }
   ```
3. Signed using HS256 with the known secret string.
4. Setting cookie `ja_session_token=<forged_token>` grants immediate access to `/admin` and `/api/admin/*`.

### Remediation
Enforce mandatory environment configuration in `src/lib/auth/session.ts`:
```typescript
const secret = process.env.AUTH_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: AUTH_SECRET must be configured in production!');
}
const JWT_SECRET = new TextEncoder().encode(secret || 'local_dev_only_secret_32_characters_minimum');
```

---

## 3. FPT-AUTH-PW-SALT-001: Static Salt in Scrypt Password Hash Fallback Weakens Credential Protection

- **Overall Severity**: `medium` (Likelihood: `low`, Impact: `high`, Confidence: `high`)
- **Category**: Cryptography & Secrets
- **Target Invariant**: Password hashing functions must generate a unique cryptographically random salt per credential to resist precomputed rainbow tables.

### Source Trace & Evidence
1. **Entrypoint**: `src/lib/auth/session.ts:11` — `hashPassword(plainText: string)`
2. **Propagation**: `src/lib/auth/session.ts:22-24` — In scrypt fallback:
   ```typescript
   const crypto = await import('crypto');
   return crypto.scryptSync(plainText, 'ja_salt_2026', 64).toString('hex');
   ```
3. **Sink**: `src/app/api/registration/route.ts:133` — Password hash stored in `teams.password_hash`.

### Threat Scenario & Reproduction
When running in environments where `@node-rs/argon2` native compilation fails, all passwords (both team temporary passwords and admin passwords) are hashed with the fixed salt `'ja_salt_2026'`. An attacker who acquires a database export can construct a precomputed rainbow table to crack passwords en masse.

### Remediation
Generate a dynamic per-user salt and encode it into the hash string:
```typescript
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(plainText, salt, 64).toString('hex');
return `scrypt$${salt}$${hash}`;
```

---

## 4. FPT-AUTH-BRUTEFORCE-001: Missing Rate Limiting on Login Endpoint Allows Credential Brute-Forcing

- **Overall Severity**: `medium` (Likelihood: `medium`, Impact: `medium`, Confidence: `high`)
- **Category**: Access Control / Resource Exhaustion
- **Target Invariant**: Login endpoints must enforce rate limiting, backoff delays, or account lockouts after consecutive failed attempts.

### Source Trace & Evidence
1. **Entrypoint**: `src/app/api/auth/login/route.ts:6` — Public `POST` route handler.
2. **Propagation**: `src/app/api/auth/login/route.ts:40,68` — Credential verification against `admins` and `teams` tables.
3. **Sink**: `src/app/api/auth/login/route.ts:91` — Immediate return of `401 Unauthorized` without throttling.

### Threat Scenario & Reproduction
Team passwords generated during registration have the format:
`'Team@' + crypto.randomBytes(3).toString('hex').toUpperCase()` (e.g. `Team@A1B2C3`).
Because 3 bytes equals 16,777,216 possible hex combinations and usernames are predictable (`team-<name>`), an attacker sending 200 requests/sec can systematically brute-force access without triggering rate limit thresholds or temporary locks.

### Remediation
Add IP and account sliding-window rate limiting in Next.js middleware or route handler (e.g. using Upstash Redis or memory cache), returning HTTP `429 Too Many Requests` after 5 failed attempts within 5 minutes.
