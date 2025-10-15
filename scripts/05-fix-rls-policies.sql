-- Adding missing INSERT policy for earnings_history table
CREATE POLICY "Users can insert own earnings history" ON public.earnings_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
