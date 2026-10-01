CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  profile_image_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
UPDATE users SET username = 'Jugador-' || id::text WHERE username IS NULL OR btrim(username) = '';
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx ON users (LOWER(username));

CREATE TABLE IF NOT EXISTS game_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rawg_id TEXT NOT NULL,
  name TEXT NOT NULL,
  background_image TEXT,
  released DATE,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Jugando', 'Completado', 'Abandonado')),
  platinum BOOLEAN NOT NULL DEFAULT FALSE,
  replayed BOOLEAN NOT NULL DEFAULT FALSE,
  recommended BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, rawg_id)
);

CREATE INDEX IF NOT EXISTS game_entries_user_created_idx ON game_entries (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_lists (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  year SMALLINT CHECK (year BETWEEN 1900 AND 2200),
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_lists ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS user_lists_user_updated_idx ON user_lists (user_id, updated_at DESC);
