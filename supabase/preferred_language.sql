-- Add preferred_language column to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
