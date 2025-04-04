-- Schema for edu-toulouse Supabase project

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

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Security policies
-- Profiles: users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

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

-- Create team invite table
CREATE TABLE public.team_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days') NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team invites are viewable by everyone" ON public.team_invites
  FOR SELECT USING (true);
  
CREATE POLICY "Team invites can be created by team owners and captains" ON public.team_invites
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = team_invites.team_id AND role IN ('owner', 'captain')
    )
  );

-- Add functions and triggers
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, discord_username, discord_id)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'preferred_username',
    new.raw_user_meta_data->>'custom_claims'->>'provider_id'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 