-- Team Access Policies for Supabase
-- This script defines Row Level Security policies for team-related tables

-- Enable RLS on teams table
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Teams table policies
-- Anyone can view teams (public data)
CREATE POLICY "Teams are viewable by everyone" 
ON public.teams FOR SELECT 
USING (true);

-- Only owners can update their teams
CREATE POLICY "Team owners can update their teams" 
ON public.teams FOR UPDATE 
USING (auth.uid() = owner_id);

-- Only owners can delete their teams
CREATE POLICY "Team owners can delete their teams" 
ON public.teams FOR DELETE 
USING (auth.uid() = owner_id);

-- Authenticated users can create teams
CREATE POLICY "Authenticated users can create teams" 
ON public.teams FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Team members table policies
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Anyone can view team members (to see who is in a team)
CREATE POLICY "Team members are viewable by everyone" 
ON public.team_members FOR SELECT 
USING (true);

-- Team owners and captains can add members to their teams
CREATE POLICY "Team owners and captains can add members" 
ON public.team_members FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = NEW.team_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'captain')
  )
);

-- Team owners and captains can update members in their teams
CREATE POLICY "Team owners and captains can update members" 
ON public.team_members FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'captain')
  )
);

-- Only owners and captains can remove members from their teams
CREATE POLICY "Team owners and captains can remove members" 
ON public.team_members FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'captain')
  )
);

-- Prevent captains from removing or demoting owners
CREATE POLICY "Only owners can manage owner roles" 
ON public.team_members FOR UPDATE 
USING (
  NOT (OLD.role = 'owner') 
  OR 
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Team invitations table policies
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Only team owners and captains can create invitations
CREATE POLICY "Team owners and captains can create invitations" 
ON public.team_invitations FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = NEW.team_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'captain')
  )
);

-- Invitations are viewable by everyone (needed to validate invitation codes)
CREATE POLICY "Invitations are viewable by everyone" 
ON public.team_invitations FOR SELECT 
USING (true); 