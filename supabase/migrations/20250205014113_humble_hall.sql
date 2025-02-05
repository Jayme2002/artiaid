/*
  # Initial Database Setup

  1. Tables
    - `sessions`: Stores counseling session data
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `counselor_name` (text)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `duration` (interval)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_messages`: Stores messages from sessions
      - `id` (uuid, primary key)
      - `session_id` (uuid, references sessions)
      - `role` (text)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - View their own sessions and messages
      - Create new sessions and messages
      - Update their own sessions
*/

-- Create sessions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sessions') THEN
    CREATE TABLE sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users NOT NULL,
      counselor_name text NOT NULL,
      started_at timestamptz DEFAULT now(),
      ended_at timestamptz,
      duration interval,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Create chat messages table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chat_messages') THEN
    CREATE TABLE chat_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid REFERENCES sessions NOT NULL,
      role text NOT NULL,
      content text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS
DO $$ 
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', 'sessions');
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', 'chat_messages');
EXCEPTION WHEN others THEN NULL;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Sessions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Users can view their own sessions'
  ) THEN
    CREATE POLICY "Users can view their own sessions"
      ON sessions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Users can create sessions'
  ) THEN
    CREATE POLICY "Users can create sessions"
      ON sessions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessions' AND policyname = 'Users can update their own sessions'
  ) THEN
    CREATE POLICY "Users can update their own sessions"
      ON sessions
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Chat messages policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can view their own chat messages'
  ) THEN
    CREATE POLICY "Users can view their own chat messages"
      ON chat_messages
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM sessions 
          WHERE sessions.id = chat_messages.session_id 
          AND sessions.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can create chat messages in their sessions'
  ) THEN
    CREATE POLICY "Users can create chat messages in their sessions"
      ON chat_messages
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM sessions 
          WHERE sessions.id = chat_messages.session_id 
          AND sessions.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'sessions_user_id_idx'
  ) THEN
    CREATE INDEX sessions_user_id_idx ON sessions(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'chat_messages_session_id_idx'
  ) THEN
    CREATE INDEX chat_messages_session_id_idx ON chat_messages(session_id);
  END IF;
END $$;