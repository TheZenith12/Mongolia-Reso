-- =====================================================
-- Mongolian Resorts Platform - Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE place_type AS ENUM ('resort', 'nature');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE user_role AS ENUM ('user', 'manager', 'super_admin');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('stripe', 'qpay');

-- =====================================================
-- PROFILES (extends Supabase auth.users)
-- =====================================================
CREATE TABLE profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name    TEXT,
  phone        TEXT,
  avatar_url   TEXT,
  role         user_role NOT NULL DEFAULT 'user',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- PLACES (Resorts & Natural Attractions)
-- =====================================================
CREATE TABLE places (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type            place_type NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  short_desc      TEXT,
  price_per_night NUMERIC(10,2),
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  
  -- Location
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  address         TEXT,
  province        TEXT,
  district        TEXT,
  
  -- Media
  cover_image     TEXT,
  images          TEXT[] DEFAULT '{}',
  video_url       TEXT,
  
  -- Stats
  view_count      INTEGER DEFAULT 0,
  like_count      INTEGER DEFAULT 0,
  rating_avg      NUMERIC(3,2) DEFAULT 0,
  rating_count    INTEGER DEFAULT 0,
  
  -- Meta
  is_published    BOOLEAN DEFAULT false,
  is_featured     BOOLEAN DEFAULT false,
  manager_id      UUID REFERENCES profiles(id),
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX places_search_idx ON places 
  USING GIN (to_tsvector('simple', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(address, '')));

CREATE INDEX places_type_idx ON places(type);
CREATE INDEX places_province_idx ON places(province);
CREATE INDEX places_published_idx ON places(is_published);
CREATE INDEX places_price_idx ON places(price_per_night);

-- =====================================================
-- BOOKINGS
-- =====================================================
CREATE TABLE bookings (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  place_id        UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Guest info
  guest_name      TEXT NOT NULL,
  guest_phone     TEXT NOT NULL,
  guest_email     TEXT,
  guest_count     INTEGER DEFAULT 1,
  
  -- Dates
  check_in        DATE NOT NULL,
  check_out       DATE NOT NULL,
  nights          INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
  
  -- Payment
  total_amount    NUMERIC(10,2) NOT NULL,
  payment_method  payment_method,
  payment_status  payment_status DEFAULT 'pending',
  payment_intent  TEXT,
  qpay_invoice_id TEXT,
  
  -- Status
  status          booking_status DEFAULT 'pending',
  notes           TEXT,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX bookings_place_idx ON bookings(place_id);
CREATE INDEX bookings_user_idx ON bookings(user_id);
CREATE INDEX bookings_status_idx ON bookings(status);
CREATE INDEX bookings_dates_idx ON bookings(check_in, check_out);

-- =====================================================
-- REVIEWS
-- =====================================================
CREATE TABLE reviews (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  place_id    UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  booking_id  UUID REFERENCES bookings(id),
  
  rating      INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title       TEXT,
  body        TEXT,
  images      TEXT[] DEFAULT '{}',
  
  is_verified BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reviews_place_idx ON reviews(place_id);
CREATE UNIQUE INDEX reviews_one_per_booking ON reviews(booking_id) WHERE booking_id IS NOT NULL;

-- Update place rating on review change
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE places SET
    rating_avg   = (SELECT AVG(rating) FROM reviews WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)),
    updated_at   = NOW()
  WHERE id = COALESCE(NEW.place_id, OLD.place_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_place_rating();

-- =====================================================
-- LIKES / FAVORITES
-- =====================================================
CREATE TABLE likes (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  place_id   UUID REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, place_id)
);

-- Update like_count on likes change
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE places SET like_count = like_count + 1 WHERE id = NEW.place_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE places SET like_count = like_count - 1 WHERE id = OLD.place_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- =====================================================
-- SITE STATS (view counts, etc.)
-- =====================================================
CREATE TABLE site_stats (
  key        TEXT PRIMARY KEY,
  value      BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_stats (key, value) VALUES ('total_views', 0), ('total_users', 0);

-- Increment place view count function
CREATE OR REPLACE FUNCTION increment_view_count(place_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE places SET view_count = view_count + 1 WHERE id = place_id;
  UPDATE site_stats SET value = value + 1, updated_at = NOW() WHERE key = 'total_views';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes     ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own, admins see all
CREATE POLICY "Users can view own profile"     ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Super admin full access"        ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Places: public read published, admin write
CREATE POLICY "Anyone can view published places" ON places FOR SELECT 
  USING (is_published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Super admin can do anything"      ON places FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Manager can edit own place"       ON places FOR UPDATE
  USING (manager_id = auth.uid());

-- Bookings: user sees own, manager sees their place's
CREATE POLICY "User sees own bookings"      ON bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User can create bookings"    ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Manager sees place bookings" ON bookings FOR SELECT
  USING (EXISTS (SELECT 1 FROM places WHERE id = place_id AND manager_id = auth.uid()));
CREATE POLICY "Admin full booking access"   ON bookings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'manager')));

-- Reviews: public read, authenticated write
CREATE POLICY "Anyone can read reviews"     ON reviews FOR SELECT USING (true);
CREATE POLICY "Auth users can write review" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can edit own review"   ON reviews FOR UPDATE USING (user_id = auth.uid());

-- Likes: user manages own
CREATE POLICY "Users manage own likes" ON likes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Anyone reads likes"     ON likes FOR SELECT USING (true);
