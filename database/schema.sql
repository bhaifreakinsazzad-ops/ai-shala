-- ============================================================
-- AI SHALA DATABASE SCHEMA v3.0
-- Bangladesh's First AI Super App
-- ============================================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard -> Your Project -> SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT UNIQUE NOT NULL,
  password        TEXT NOT NULL,
  name            TEXT NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,

  -- Subscription
  subscription          TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'pro', 'premium')),
  subscription_ends_at  TIMESTAMP WITH TIME ZONE,
  trial_ends_at         TIMESTAMP WITH TIME ZONE,

  -- Usage tracking
  daily_usage           INTEGER DEFAULT 0,
  daily_limit           INTEGER DEFAULT 50,
  image_daily_usage     INTEGER DEFAULT 0,
  image_daily_limit     INTEGER DEFAULT 5,
  last_reset_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Roles
  is_admin        BOOLEAN DEFAULT FALSE,
  is_banned       BOOLEAN DEFAULT FALSE,
  ban_reason      TEXT,

  -- Timestamps
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- CONVERSATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT DEFAULT 'নতুন চ্যাট',
  model           TEXT DEFAULT 'groq/llama-3.3-70b-versatile',
  system_prompt   TEXT,
  pinned          BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role                TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content             TEXT NOT NULL,
  model               TEXT,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ============================================================
-- IMAGE HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS image_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt      TEXT NOT NULL,
  style       TEXT DEFAULT 'realistic',
  image_url   TEXT NOT NULL,
  width       INTEGER DEFAULT 1024,
  height      INTEGER DEFAULT 1024,
  seed        INTEGER,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_history_user ON image_history(user_id);

-- ============================================================
-- TOOL HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tool_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id     TEXT NOT NULL,
  input       TEXT,
  output      TEXT,
  model       TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_history_user ON tool_history(user_id);

-- ============================================================
-- PAYMENT REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_requests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email        TEXT NOT NULL,
  user_name         TEXT,

  -- Plan details
  plan_id           TEXT NOT NULL,
  plan_name         TEXT,
  amount            DECIMAL(10, 2) NOT NULL,

  -- Payment details
  payment_method    TEXT NOT NULL CHECK (payment_method IN ('bkash', 'nagad', 'rocket', 'bank')),
  transaction_id    TEXT NOT NULL UNIQUE,
  sender_number     TEXT,

  -- Status
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note        TEXT,
  approved_by       UUID REFERENCES users(id),
  approved_at       TIMESTAMP WITH TIME ZONE,

  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payment_requests(created_at DESC);

-- ============================================================
-- USAGE LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('chat', 'image', 'tool')),
  model       TEXT,
  tool_id     TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- NOTE: Since we use service key on backend, RLS is for extra safety.
-- The backend enforces ownership checks itself.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (our backend uses service role key)
-- These policies are for direct Supabase client access if needed

CREATE POLICY "Service role full access" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access" ON conversations FOR ALL USING (true);
CREATE POLICY "Service role full access" ON messages FOR ALL USING (true);
CREATE POLICY "Service role full access" ON image_history FOR ALL USING (true);
CREATE POLICY "Service role full access" ON tool_history FOR ALL USING (true);
CREATE POLICY "Service role full access" ON payment_requests FOR ALL USING (true);
CREATE POLICY "Service role full access" ON usage_logs FOR ALL USING (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-reset daily usage (can be called by a cron or trigger)
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET daily_usage = 0,
      image_daily_usage = 0,
      last_reset_at = NOW()
  WHERE last_reset_at::date < NOW()::date;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED DATA: Create admin user
-- IMPORTANT: Change the email and password before running!
-- ============================================================

-- INSERT INTO users (email, password, name, subscription, daily_limit, image_daily_limit, is_admin)
-- VALUES (
--   'admin@aishala.com',
--   '$2a$12$CHANGE_THIS_TO_BCRYPT_HASH',  -- bcrypt hash of your admin password
--   'Admin',
--   'premium',
--   999999,
--   999999,
--   true
-- );

-- ============================================================
-- END OF SCHEMA
-- ============================================================
