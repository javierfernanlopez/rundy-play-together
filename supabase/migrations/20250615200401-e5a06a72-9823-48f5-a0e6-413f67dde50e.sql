
-- Create a table for match chat messages
CREATE TABLE public.match_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add a foreign key constraint to profiles table for user_id
-- We can't reference auth.users directly in policies easily without making them SECURITY DEFINER, 
-- but we already have a profiles table. Let's assume user_id references profiles.
-- The handle_new_user trigger populates profiles from auth.users.
-- And in our app logic we use auth.uid() which is the same as profiles.id
ALTER TABLE public.match_chat_messages
ADD CONSTRAINT fk_user_id
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Helper function to check if a user is a participant in a match
CREATE OR REPLACE FUNCTION public.is_participant(match_id_to_check UUID, user_id_to_check UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.match_participants mp
    WHERE mp.match_id = match_id_to_check AND mp.user_id = user_id_to_check
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.match_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see messages of matches they are part of
CREATE POLICY "Allow read access to participants"
ON public.match_chat_messages
FOR SELECT
USING (public.is_participant(match_id, auth.uid()));

-- Policy: Users can send messages in matches they are part of
CREATE POLICY "Allow insert access to participants"
ON public.match_chat_messages
FOR INSERT
WITH CHECK (public.is_participant(match_id, auth.uid()));

-- Enable realtime updates for the chat table
alter publication supabase_realtime add table public.match_chat_messages;
