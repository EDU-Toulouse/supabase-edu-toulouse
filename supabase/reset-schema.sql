-- Reset and recreate all schemas for the edu-toulouse project

-- First, drop all tables in reverse dependency order
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.event_registrations;
DROP TABLE IF EXISTS public.team_invites;
DROP TABLE IF EXISTS public.team_members;
DROP TABLE IF EXISTS public.teams;
DROP TABLE IF EXISTS public.events;
DROP TABLE IF EXISTS public.profiles;

-- Now recreate everything

-- Profiles table (automatically synced with Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  username TEXT,
  avatar_url TEXT,
  discord_username TEXT,
  discord_id TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT false NOT NULL
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  max_participants INTEGER,
  team_size INTEGER,
  is_team_event BOOLEAN NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming' NOT NULL,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL
);

-- Teams table
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'captain', 'member')) DEFAULT 'member' NOT NULL,
  UNIQUE(team_id, user_id)
);

-- Event registrations table
CREATE TABLE public.event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')) DEFAULT 'pending' NOT NULL,
  CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR
    (user_id IS NULL AND team_id IS NOT NULL)
  )
);

-- Create team invite table
CREATE TABLE public.team_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days') NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Security policies
-- Profiles: users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events: anyone can view events, only organizers can update
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);
  
CREATE POLICY "Events can be created by authenticated users" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);
  
CREATE POLICY "Events can be updated by organizers" ON public.events
  FOR UPDATE USING (auth.uid() = organizer_id);

-- Teams: anyone can view teams, only owners can update
CREATE POLICY "Teams are viewable by everyone" ON public.teams
  FOR SELECT USING (true);
  
CREATE POLICY "Teams can be created by authenticated users" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
  
CREATE POLICY "Teams can be updated by owners" ON public.teams
  FOR UPDATE USING (auth.uid() = owner_id);

-- Team Members: readable by everyone, insertable by team owners
CREATE POLICY "Team members are viewable by everyone" ON public.team_members
  FOR SELECT USING (true);
  
CREATE POLICY "Team members can be managed by team owners" ON public.team_members
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM public.teams WHERE id = team_id
    )
  );

-- Event Registrations: readable by event organizers and participants
CREATE POLICY "Event registrations are viewable by everyone" ON public.event_registrations
  FOR SELECT USING (true);
  
CREATE POLICY "Event registrations can be created by authenticated users" ON public.event_registrations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = event_registrations.team_id AND role IN ('owner', 'captain')
    )
  );
  
CREATE POLICY "Event registrations can be updated by registrants" ON public.event_registrations
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = event_registrations.team_id AND role IN ('owner', 'captain')
    ) OR
    auth.uid() IN (
      SELECT organizer_id FROM public.events 
      WHERE id = event_registrations.event_id
    )
  );

CREATE POLICY "Event registrations can be deleted by registrants" ON public.event_registrations
  FOR DELETE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = event_registrations.team_id AND role IN ('owner', 'captain')
    ) OR
    auth.uid() IN (
      SELECT organizer_id FROM public.events 
      WHERE id = event_registrations.event_id
    )
  );

-- Team invites policies
CREATE POLICY "Team invites are viewable by everyone" ON public.team_invites
  FOR SELECT USING (true);
  
CREATE POLICY "Team invites can be created by team owners and captains" ON public.team_invites
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = team_invites.team_id AND role IN ('owner', 'captain')
    )
  );

-- Create profiles for existing users
INSERT INTO public.profiles (id, username, avatar_url, created_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User-' || substring(au.id::text, 1, 6)) as username,
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
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User-' || substring(new.id::text, 1, 6)), 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'preferred_username',
    new.raw_user_meta_data->>'provider_id',
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Add some sample data
-- Add a sample event (only if there are no events)
DO $$
DECLARE
  organizerId UUID;
BEGIN
  -- Pick first user as organizer
  SELECT id INTO organizerId FROM auth.users LIMIT 1;
  
  -- Only insert if we have a user and no events
  IF organizerId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.events LIMIT 1) THEN
    INSERT INTO public.events (
      title, 
      description, 
      start_date, 
      end_date, 
      is_team_event, 
      organizer_id
    ) VALUES (
      'Fortnite Tournament', 
      'Join our monthly Fortnite tournament for glory and prizes!', 
      now() + interval '7 days', 
      now() + interval '7 days' + interval '5 hours', 
      true, 
      organizerId
    );
  END IF;
END $$; 