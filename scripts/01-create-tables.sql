-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  country TEXT DEFAULT 'Nigeria',
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  available_balance DECIMAL(10,2) DEFAULT 0.00,
  withdrawn_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_tasks table
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_amount DECIMAL(4,2) NOT NULL CHECK (reward_amount >= 0.60 AND reward_amount <= 1.00),
  category TEXT NOT NULL DEFAULT 'Nigeria Survey',
  is_active BOOLEAN DEFAULT true,
  max_completions INTEGER DEFAULT 100,
  current_completions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 day')
);

-- Create task_completions table
CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
  answers JSONB,
  reward_earned DECIMAL(4,2) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  payment_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create earnings_history table
CREATE TABLE IF NOT EXISTS public.earnings_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task_completion', 'bonus', 'withdrawal', 'adjustment')),
  description TEXT NOT NULL,
  task_id UUID REFERENCES public.daily_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own task completions" ON public.task_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task completions" ON public.task_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own withdrawal requests" ON public.withdrawal_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawal requests" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own earnings history" ON public.earnings_history
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to update profile updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
