-- Create local users table for authentication (separate from auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate existing data from profiles to users table
-- This will copy all existing users to the new local auth system
INSERT INTO public.users (id, email, full_name, created_at)
SELECT p.id, p.email, p.full_name, p.created_at
FROM public.profiles p
ON CONFLICT (email) DO NOTHING;

-- Update profiles table to reference local users instead of auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Drop auth-related triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Update RLS policies to use local auth
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own task completions" ON public.task_completions;
DROP POLICY IF EXISTS "Users can insert own task completions" ON public.task_completions;
DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can insert own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can view own earnings history" ON public.earnings_history;

-- Disable RLS since we'll handle auth in the app layer
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_history DISABLE ROW LEVEL SECURITY;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- Create trigger for users updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
