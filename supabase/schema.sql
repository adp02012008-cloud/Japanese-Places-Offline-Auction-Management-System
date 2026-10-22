-- ==============================================================================
-- Japanese Places Offline Auction Management System - Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name TEXT NOT NULL,
    member_count INT NOT NULL DEFAULT 1,
    approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    participation_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (participation_status IN ('ACTIVE', 'INACTIVE')),
    starting_budget NUMERIC(12, 2) NOT NULL DEFAULT 100000.00,
    remaining_budget NUMERIC(12, 2) NOT NULL DEFAULT 100000.00,
    total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_actual_worth NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    first_login_must_change_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case-insensitive uniqueness on team_name
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_name_lower ON public.teams (LOWER(TRIM(team_name)));

-- 2. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    enrollment_number TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case-insensitive uniqueness on enrollment number across event
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_enrollment_lower ON public.team_members (LOWER(TRIM(enrollment_number)));

-- 3. Japanese Places Table
CREATE TABLE IF NOT EXISTS public.places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_storage_path TEXT DEFAULT '',
    starting_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    actual_worth NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- CONFIDENTIAL
    status TEXT NOT NULL DEFAULT 'NOT_SOLD' CHECK (status IN ('NOT_SOLD', 'SOLD', 'WITHDRAWN')),
    winning_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    winning_team_name TEXT DEFAULT '',
    final_purchase_price NUMERIC(12, 2),
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Purchases Ledger Table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE RESTRICT,
    place_name TEXT NOT NULL,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
    team_name TEXT NOT NULL,
    final_purchase_price NUMERIC(12, 2) NOT NULL,
    actual_worth_at_sale NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    confirmed_at TIMESTAMPTZ DEFAULT NOW(),
    admin_id TEXT NOT NULL,
    admin_username TEXT NOT NULL,
    notes TEXT DEFAULT '',
    cancellation_reason TEXT DEFAULT '',
    cancelled_at TIMESTAMPTZ,
    cancelled_by TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNIQUE CONSTRAINT: A place cannot have multiple active confirmed purchases!
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_confirmed_sale_per_place 
ON public.purchases (place_id) 
WHERE (status = 'CONFIRMED');

-- 5. Event Settings Table
CREATE TABLE IF NOT EXISTS public.event_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL DEFAULT 'Japanese Places Offline Auction 2026',
    starting_budget_per_team NUMERIC(12, 2) NOT NULL DEFAULT 100000.00,
    currency TEXT NOT NULL DEFAULT '₹',
    active_winning_rule TEXT NOT NULL DEFAULT 'SAVINGS' CHECK (active_winning_rule IN ('SAVINGS', 'EFFICIENCY', 'ACTUAL_WORTH')),
    is_registration_open BOOLEAN DEFAULT TRUE,
    require_admin_approval BOOLEAN DEFAULT TRUE,
    is_announcement_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL,
    admin_username TEXT NOT NULL,
    action_type TEXT NOT NULL,
    affected_record_type TEXT NOT NULL,
    affected_record_id TEXT NOT NULL,
    before_value JSONB,
    after_value JSONB,
    reason TEXT DEFAULT '',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Administrator Accounts Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Storage Bucket for Place Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('japanese-places', 'japanese-places', true)
ON CONFLICT (id) DO NOTHING;
