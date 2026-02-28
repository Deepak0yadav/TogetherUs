-- TogetherOS Database Schema
-- Run via: psql $DATABASE_URL -f src/db/schema.sql

-- Users (email or Google)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Couples (unique 2-user binding)
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Couple members (exactly 2 per couple)
CREATE TABLE IF NOT EXISTS couple_members (
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (couple_id, user_id),
  UNIQUE (user_id)
);

-- One room per couple (persistent virtual apartment)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL UNIQUE REFERENCES couples(id) ON DELETE CASCADE,
  layout_json JSONB NOT NULL DEFAULT '{"furniture":[],"theme":"night"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (watch/focus history)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  duration INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_couples_invite_code ON couples(invite_code);
CREATE INDEX IF NOT EXISTS idx_rooms_couple_id ON rooms(couple_id);
CREATE INDEX IF NOT EXISTS idx_sessions_room_id ON sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- Constraint: max 2 members per couple
CREATE OR REPLACE FUNCTION check_couple_size()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM couple_members WHERE couple_id = NEW.couple_id) >= 2 THEN
    RAISE EXCEPTION 'A couple can have at most 2 members';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS couple_size_trigger ON couple_members;
CREATE TRIGGER couple_size_trigger
  BEFORE INSERT ON couple_members
  FOR EACH ROW EXECUTE PROCEDURE check_couple_size();
