-- Run this in Supabase SQL Editor
-- Adds criteria_checked column to generated_guides to persist checkbox state

ALTER TABLE generated_guides
ADD COLUMN IF NOT EXISTS criteria_checked JSONB DEFAULT '{}'::jsonb;
