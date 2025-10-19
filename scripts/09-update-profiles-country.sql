-- Update all user profiles to use Nigeria as country
-- This migration updates existing profiles that have South Africa as their country

-- Update profiles with South Africa to Nigeria
UPDATE public.profiles
SET country = 'Nigeria'
WHERE country = 'South Africa' OR country IS NULL;

-- Verify the update
SELECT COUNT(*) as updated_profiles
FROM public.profiles
WHERE country = 'Nigeria';
