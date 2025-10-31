/*
  # Add Database Functions for Registration Counts

  1. New Functions
    - `increment_registered_count` - Safely increment event registration count
    - `decrement_registered_count` - Safely decrement event registration count

  2. Purpose
    - These functions ensure atomic updates to registration counts
    - Prevent race conditions when multiple users register simultaneously
    - Maintain data consistency between events and registrations tables
*/

CREATE OR REPLACE FUNCTION increment_registered_count(event_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET registered_count = registered_count + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_registered_count(event_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET registered_count = GREATEST(registered_count - 1, 0)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;