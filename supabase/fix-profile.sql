-- Fix missing profile records for authenticated users who don't have corresponding profile entries
-- Run this in the Supabase SQL editor to fix the foreign key constraint issue

-- Get all authenticated users without profiles and create profiles for them
INSERT INTO public.profiles (id, username, avatar_url, created_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User' || substring(au.id::text, 1, 6)) as username,
  au.raw_user_meta_data->>'avatar_url' as avatar_url,
  now() as created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Fix the trigger function to automatically create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, discord_username, discord_id, created_at)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User' || substring(new.id::text, 1, 6)), 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'preferred_username',
    new.raw_user_meta_data->>'provider_id',
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 