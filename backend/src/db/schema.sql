CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens (user_id);

CREATE TABLE IF NOT EXISTS properties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(150) NOT NULL,
  description   TEXT NOT NULL,
  city          VARCHAR(80) NOT NULL,
  locality      VARCHAR(120),
  price         NUMERIC(14,2) NOT NULL CHECK (price > 0),
  property_type VARCHAR(30) NOT NULL,
  bedrooms      INT NOT NULL DEFAULT 0,
  bathrooms     INT NOT NULL DEFAULT 0,
  area_sqft     INT NOT NULL CHECK (area_sqft > 0),
  images        TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (users, refresh_tokens, and the idx_refresh_user index are above)

CREATE TABLE IF NOT EXISTS properties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(150) NOT NULL,
  description   TEXT NOT NULL,
  city          VARCHAR(80) NOT NULL,
  locality      VARCHAR(120),
  price         NUMERIC(14,2) NOT NULL CHECK (price > 0),
  property_type VARCHAR(30) NOT NULL,
  bedrooms      INT NOT NULL DEFAULT 0,
  bathrooms     INT NOT NULL DEFAULT 0,
  area_sqft     INT NOT NULL CHECK (area_sqft > 0),
  images        TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Search: equality filters first, range column (price) last
CREATE INDEX IF NOT EXISTS idx_properties_search
  ON properties (LOWER(city), property_type, bedrooms, price);

-- Default sort (newest first) and keyset pagination
CREATE INDEX IF NOT EXISTS idx_properties_created
  ON properties (created_at DESC, id DESC);

-- Sorting by price
CREATE INDEX IF NOT EXISTS idx_properties_price
  ON properties (price, id);