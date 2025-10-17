-- Drop existing policies for task_completions
DROP POLICY IF EXISTS "Users can view own task completions" ON public.task_completions;
DROP POLICY IF EXISTS "Users can insert own task completions" ON public.task_completions;

-- Create updated RLS policies for task_completions
-- Allow users to view their own task completions
CREATE POLICY "Users can view own task completions" ON public.task_completions
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own task completions
CREATE POLICY "Users can insert own task completions" ON public.task_completions
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own task completions (for the 24-hour update case)
CREATE POLICY "Users can update own task completions" ON public.task_completions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.task_completions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
