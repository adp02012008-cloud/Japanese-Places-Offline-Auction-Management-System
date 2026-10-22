# Japanese Places Offline Auction Management System
### 日本名所競売管理システム (Offline Live Bidding & Budget Management)

A production-grade, secure, full-stack web application designed to manage offline physical auctions of iconic Japanese landmarks, castles, shrines, temples, and cultural heritage sites.

Backed by **MongoDB Atlas + Mongoose ODM**, **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase Storage** for photograph assets.

---

## ⛩️ System Highlights & Architectural Guarantees

1. **Strict Offline Bidding (No Online Bidding)**
   - The auction takes place physically in person with teams bidding live in the room.
   - The application does NOT allow online or automated bidding from client browsers.
   - The administrator operates the live sale entry ledger to record the hammered winning team and price.

2. **MongoDB Atlas Multi-Document Transactions**
   - All critical sale confirmations, inventory locks, and budget deductions execute inside an atomic MongoDB session.
   - Prevents duplicate purchases, partial updates, and concurrent balance deductions.

3. **Confidential Actual-Worth Valuations**
   - The **actual worth** of each Japanese landmark is strictly restricted to authenticated administrators.
   - Excluded via database-level projections (`.select('-actualWorth')`) and DTO serialization from public catalogues, big-screen presentation views, and team dashboards.

4. **Dedicated 16:9 Big-Screen Presentation Screen**
   - Designed for high-resolution projectors and theater displays.
   - Large typography, high-definition photographs, starting prices, live sale status, and real-time team budget grids.

5. **Equal Starting Budgets & Dynamic Results Engine**
   - Every approved participating team receives an identical configured starting budget (standard ₹100,000).
   - Real-time tournament rankings supporting three official calculation rules:
     - **Highest Total Savings** (Default): $\text{Actual Worth} - \text{Total Spent}$
     - **Highest Value Efficiency**: $(\text{Actual Worth} \div \text{Total Spent}) \times 100$
     - **Highest Total Actual Worth**
   - Deterministic tie-breaking rules and announcement audit trail.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Full-stack server components, route handlers, and rendering |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety |
| **Styling** | Tailwind CSS & Vanilla CSS | Japanese cultural design tokens (Torii red, Sumi ink, Washi cream, Kiniro gold) |
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL database with multi-document transaction support |
| **ODM** | Mongoose 8 | Document schemas, validation rules, and atomic sessions |
| **Image Storage** | Supabase Storage | Persistent storage for high-resolution Japanese place photos |
| **Authentication** | Secure Credentials + JWT | Argon2id password hashing, HTTP-only SameSite cookies, RBAC |
| **Forms & Validation**| React Hook Form & Zod | Dynamic registration forms and server-side validation |
| **Testing** | Vitest | Calculation formulas, tie-breakers, and confidentiality testing |

---

## 📁 Project Structure

```
├── scripts/
│   └── seed.ts                  # Seeds 10 Japanese landmarks, admin account, and default rules
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── audit/page.tsx   # Audit logs & sensitive modification history
│   │   │   ├── dashboard/page.tsx # 9 summary metrics & live operations checklist
│   │   │   ├── layout.tsx       # Dark Sumi aesthetic admin shell with presentation shortcut
│   │   │   ├── login/page.tsx   # Secure admin authentication
│   │   │   ├── places/page.tsx  # Landmark CRUD, Supabase upload & confidential valuations
│   │   │   ├── results/page.tsx # Automatic rankings, winner calculation & announcement
│   │   │   ├── sales/page.tsx   # Live offline sale recording & cancellation ledger
│   │   │   ├── settings/page.tsx# Budget rules, currency, and scoring configuration
│   │   │   └── teams/page.tsx   # Team approvals, member rosters & CSV export
│   │   ├── api/
│   │   │   ├── admin/           # Protected admin-only endpoints
│   │   │   ├── auth/            # Login, logout, and session verification
│   │   │   ├── places/          # Public/team catalogue (actualWorth stripped)
│   │   │   ├── presentation/    # 16:9 big-screen feed (actualWorth stripped)
│   │   │   ├── registration/    # Public team registration with duplicate checks
│   │   │   ├── team/dashboard/  # Team-isolated private budget & owned assets
│   │   │   └── upload/          # Supabase image upload endpoint
│   │   ├── login/page.tsx       # Team Portal login
│   │   ├── presentation/page.tsx# 16:9 large-screen projector view
│   │   ├── register/page.tsx    # Public team registration with dynamic member forms
│   │   ├── team/dashboard/page.tsx # Team dashboard
│   │   ├── globals.css          # Authentic Japanese design tokens & glassmorphism
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Public landing portal
│   ├── components/ui/           # Reusable button, card, badge, dialog, input, label
│   ├── lib/
│   │   ├── auth/                # Session cookies, Argon2id & RBAC guards
│   │   ├── db/mongodb.ts        # Mongoose cached connection manager for Next.js
│   │   ├── services/            # Atomic auction transactions, calculation engine, Supabase storage
│   │   └── utils.ts             # Currency formatter, CSV exporter, classnames
│   ├── models/                  # Mongoose models: Team, TeamMember, Place, Purchase, EventSettings, AuditLog, Admin
│   └── types/                   # TypeScript interfaces
└── tests/
    └── calculations.test.ts     # Vitest suite for financial algorithms & data boundaries
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials:
```env
# MongoDB Atlas Connection String (Must support replica set / transactions)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/japanese_auction?retryWrites=true&w=majority

# Random 32+ character string for JWT session cookies
AUTH_SECRET=japanese_offline_auction_super_secret_jwt_key_2026_change_in_production

# Initial Admin Credentials (used if no admin exists yet)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@Sakura2026!

# Supabase Storage (Used only for image files)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET_NAME=japanese-places

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed Initial Database
Populate 10 iconic landmarks (Mount Fuji, Kinkaku-ji, Himeji Castle, Fushimi Inari, etc.), the initial administrator account, and event settings:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Unit Tests
```bash
npm test
```

---

## 🔒 Security & Data Privacy Implementation

- **Role-Based Access Control (RBAC):** Backend route guards (`requireAdmin()`, `requireTeam()`, `requireTeamOrAdmin()`) independently verify every API call and server action.
- **Argon2id Hashing:** Password hashing uses Argon2id with recommended memory and iteration parameters.
- **HTTP-Only Cookies:** Tokens are stored in HTTP-only, SameSite=lax, Secure cookies.
- **Team-to-Team Isolation:** Teams can ONLY access their own purchases and balances. Attempts to fetch another team's data return HTTP 403 Forbidden.
- **Uniqueness Constraints:** Unique indexes on team names, enrollment numbers across the event, and a partial unique index on `placeId` for active confirmed purchases.

---

## 🌐 Production Deployment Guide (Vercel + MongoDB Atlas)

1. **MongoDB Atlas:** Create a free M0 or production replica set cluster in your preferred region. Add a database user with Read/Write permissions and whitelist IP access (`0.0.0.0/0` or Vercel outbound IPs).
2. **Supabase Storage:** Create a bucket named `japanese-places` set to public read access. Obtain your API URL and `service_role` key from Project Settings > API.
3. **Vercel Deployment:**
   - Push repository to GitHub.
   - Import the project into Vercel.
   - Set environment variables (`MONGODB_URI`, `AUTH_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`).
   - Deploy.

---

## 📜 License
MIT © 2026 Japanese Places Offline Auction Management System.
