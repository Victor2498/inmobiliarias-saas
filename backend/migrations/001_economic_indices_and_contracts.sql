-- Migration: economic_indices table + contracts new columns
-- Run this on existing DB (e.g. Supabase SQL editor) or use create_all for new DBs.

-- 1. Create economic_indices table
CREATE TABLE IF NOT EXISTS economic_indices (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    icl_value NUMERIC(18, 4),
    ipc_value NUMERIC(18, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_economic_indices_date ON economic_indices (date);

-- 2. Add new columns to contracts (skip if already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'adjustment_type') THEN
        ALTER TABLE contracts ADD COLUMN adjustment_type VARCHAR DEFAULT 'ICL';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'base_amount') THEN
        ALTER TABLE contracts ADD COLUMN base_amount DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'next_expiration_notification_sent') THEN
        ALTER TABLE contracts ADD COLUMN next_expiration_notification_sent BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
