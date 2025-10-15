-- Function to update user earnings
CREATE OR REPLACE FUNCTION update_user_earnings(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    total_earnings = total_earnings + amount,
    available_balance = available_balance + amount,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment task completions
CREATE OR REPLACE FUNCTION increment_task_completions(task_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.daily_tasks 
  SET current_completions = current_completions + 1
  WHERE id = task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_user_earnings(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_task_completions(UUID) TO authenticated;
