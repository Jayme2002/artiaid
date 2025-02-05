/*
  # Fix Schema Setup with Proper Schema Reference

  1. Schema Changes
    - Explicitly use public schema
    - Ensure tables are created in correct order
    - Add proper constraints and indexes
*/

-- Create sessions table in public schema
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  counselor_name text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat messages table in public schema
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions"
  ON public.sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for chat messages
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE sessions.id = chat_messages.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat messages in their sessions"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions 
      WHERE sessions.id = chat_messages.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON public.chat_messages(session_id);