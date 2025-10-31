/*
  # Event Management System Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `role` (text) - either 'admin' or 'user'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text) - seminar, workshop, tech_fest, concert
      - `location` (text)
      - `event_date` (timestamptz)
      - `capacity` (integer)
      - `registered_count` (integer)
      - `image_url` (text, optional)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `registrations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references profiles)
      - `status` (text) - confirmed, cancelled
      - `registered_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read all profiles, but only update their own
    - Events: Everyone can read events, only admins can create/update/delete
    - Registrations: Users can read their own registrations, admins can read all
    - Users can create registrations for themselves

  3. Indexes
    - Index on events.category for filtering
    - Index on events.event_date for sorting
    - Index on registrations.user_id for user lookups
    - Index on registrations.event_id for event lookups
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('seminar', 'workshop', 'tech_fest', 'concert')),
  location text NOT NULL,
  event_date timestamptz NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  registered_count integer NOT NULL DEFAULT 0,
  image_url text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  registered_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can read events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can read own registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create own registrations"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();