-- Run this in Supabase SQL Editor

-- Email log table
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS email_log_user_id_idx ON email_log(user_id);
CREATE INDEX IF NOT EXISTS email_log_type_idx ON email_log(email_type);
CREATE INDEX IF NOT EXISTS email_log_sent_at_idx ON email_log(sent_at);

-- RLS
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Service role can insert (used by API routes)
CREATE POLICY "Service can insert email logs"
  ON email_log FOR INSERT
  WITH CHECK (true);

-- Service role can select (used by cron jobs)
CREATE POLICY "Service can read email logs"
  ON email_log FOR SELECT
  USING (true);

-- Users can see their own logs
CREATE POLICY "Users can view own email logs"
  ON email_log FOR SELECT
  USING (auth.uid() = user_id);
