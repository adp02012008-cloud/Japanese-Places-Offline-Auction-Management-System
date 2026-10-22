# Security Audit Report — Japanese Places Offline Auction

**Target Repository**: `Japanese-Places-Offline-Auction-Management-System`  
**Source Commit**: `bd70991fa22fd033fa6b7be9d1964241815a1428`  
**Run ID**: `run-1`  
**Audit Profile**: `standard`  
**Execution Policy**: Sandboxed source and local execution only (no external live endpoint probing)  
**Date**: October 2026  
**Auditor**: Cloudflare Security Audit Skill (`cloudflare/security-audit-skill`)

---

## 1. Executive Summary & Security Posture

The application is a full-stack Next.js 14 and Supabase platform designed for managing live, offline auctions of Japanese landmarks. The application architecture exhibits thoughtful defensive engineering:
- **Clean API Projections**: Public routes such as `/api/places` and `/api/presentation` explicitly project allowed columns and omit confidential valuations (`actual_worth`).
- **Comprehensive Audit Logging**: All sensitive mutations (sales confirmation, cancellation, team status updates, settings changes) are recorded to `audit_logs` with before-and-after snapshots.
- **Strict Role Gating**: RBAC middleware and helper guards (`requireAdmin`, `requireTeam`) protect administrative and team endpoints.

However, the audit revealed **two High severity vulnerabilities** and **two Medium severity vulnerabilities**, primarily residing in the underlying Supabase database permissions, fallback secrets, and password salt management.

---

## 2. Confirmed Vulnerabilities Table

| Fingerprint | Severity | Title | Affected Boundary | Demonstrated Result |
| :--- | :---: | :--- | :--- | :--- |
| **`FPT-SUPABASE-RLS-001`** | **HIGH** | Disabled Row Level Security Exposes Confidential Valuations via PostgREST | Direct PostgREST Anon Client to PostgreSQL Store | Competitors can query Supabase PostgREST directly using the frontend publishable key to read hidden `actual_worth` valuations for all lots. |
| **`FPT-AUTH-JWT-SECRET-001`** | **HIGH** | Predictable Fallback Secret Allows Remote JWT Session Forgery | Session Token Signing Key Integrity | An attacker can sign arbitrary administrator tokens if `AUTH_SECRET` is unset in deployment environment. |
| **`FPT-AUTH-PW-SALT-001`** | **MEDIUM** | Static Salt in Scrypt Password Hash Fallback Weakens Protection | Password Hash Storage Integrity | Password hashes generated under scrypt fallback share a static salt (`ja_salt_2026`), permitting precomputed rainbow table attacks. |
| **`FPT-AUTH-BRUTEFORCE-001`** | **MEDIUM** | Missing Rate Limiting on Login Endpoint | Public Authentication to Admin/Team Boundary | Unauthenticated attackers can send unlimited login attempts without rate throttling or account lockouts. |

---

## 3. Needs Validation Leads

| Fingerprint | Title | Repository Trace | Blocker | Recommended Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **`FPT-AUCTION-RACE-001`** | Non-Atomic Budget Check in Offline Sale Confirmation | `src/lib/services/auctionService.ts:76-139` | Requires operational confirmation of whether single-auctioneer or multi-operator concurrent API access is permitted. | Add a database constraint `CHECK (remaining_budget >= 0)` and wrap transactions in a PostgreSQL procedure. |

---

## 4. Positive Security Observations & Hardening Notes

1. **Confidentiality by Design in Next.js Routes**:
   - In `src/app/api/places/route.ts:17-20`, SQL projections explicitly select only safe public fields.
   - In `src/app/api/presentation/route.ts:50-63`, winning announcement details are strictly withheld until an administrator toggles `is_announcement_public`.
2. **Strict Roster Uniqueness**:
   - `src/app/api/registration/route.ts:51-113` validates both team names and individual student enrollment numbers across submissions with case-insensitive unique indexes in PostgreSQL.
3. **Session Cookie Hardening**:
   - Session cookies are configured with `httpOnly: true`, `sameSite: 'lax'`, and conditional `secure: process.env.NODE_ENV === 'production'`.

---

## 5. Coverage Statement

- **Total Units Tracked**: 8
- **Units Covered**: 8 (100% of planned units reviewed)
- **Candidate Findings Identified**: 5
- **Confirmed Findings**: 4
- **Needs Validation Leads**: 1
- **Rejected Findings**: 0
- **Validation Status**: Passed `validate-coverage-ledger.cjs` (8/8 valid) and `validate-findings.cjs` (5/5 valid).
