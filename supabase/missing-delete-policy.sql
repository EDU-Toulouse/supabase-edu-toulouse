-- Add missing DELETE policy for event registrations
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