/*
  # Create custom counselors table

  1. New Tables
    - `counselors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `specialty` (text)
      - `personality` (text)
      - `approach` (text)
      - `voice` (text)
      - `avatar_style` (text)
      - `avatar_seed` (text)
      - `system_prompt` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `counselors` table
    - Add policies for authenticated users to manage their own counselors
*/

CREATE TABLE IF NOT EXISTS counselors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  specialty text NOT NULL,
  personality text NOT NULL,
  approach text NOT NULL,
  voice text NOT NULL,
  avatar_style text NOT NULL,
  avatar_seed text NOT NULL,
  system_prompt text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE counselors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own counselors"
  ON counselors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own counselors"
  ON counselors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own counselors"
  ON counselors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own counselors"
  ON counselors
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'counselors_updated_at'
  ) THEN
    CREATE TRIGGER counselors_updated_at
      BEFORE UPDATE ON counselors
      FOR EACH ROW
      EXECUTE PROCEDURE handle_updated_at();
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS counselors_user_id_idx ON counselors(user_id);