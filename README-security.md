# Team Management Security Implementation

This document outlines the security implementation for team management in the application, focusing on ensuring only team owners can edit critical team details.

## Security Layers

The security implementation consists of three layers:

1. **UI-level restrictions**: The interface shows/hides edit controls based on user permissions
2. **Client-side validation**: All data modification functions check user roles before making API calls
3. **Server-side policies**: Row Level Security (RLS) policies enforce permissions at the database level

## Row Level Security Policies

The `supabase/security/team-policies.sql` script contains SQL policies that should be applied to your Supabase database. These policies ensure:

- Only team owners can update or delete teams
- Only team owners and captains can manage team members
- Captains cannot modify owner status
- Public read access for teams and members

## How to Apply Security Policies

### Method 1: Using Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Open the `supabase/security/team-policies.sql` file
4. Copy its contents and paste into the SQL Editor
5. Run the queries to apply all policies

### Method 2: Using Supabase CLI

If you've set up the Supabase CLI:

```bash
# Navigate to your project root
cd /path/to/your/project

# Apply the policies
supabase db push --file ./supabase/security/team-policies.sql
```

## Testing Security Implementation

After applying policies, verify that:

1. Team owners can edit team details and delete teams
2. Team captains can manage members but not edit team details
3. Regular members cannot edit anything
4. Non-members cannot access edit pages at all

## Security Considerations

- Always implement security at multiple layers (UI, client, server)
- Never rely solely on UI restrictions for security
- Test by bypassing UI controls and making direct API calls
- Monitor your logs for unauthorized access attempts

For any security concerns or issues, please contact your security team.
