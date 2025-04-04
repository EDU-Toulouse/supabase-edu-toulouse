# Supabase Setup for EDU-Toulouse

This document provides instructions for setting up the Supabase backend for the EDU-Toulouse project.

## Database Setup

1. Create a new Supabase project from the [Supabase Dashboard](https://supabase.com/dashboard)

2. Take note of the project URL and anon key (found in Settings > API)

3. Update your `.env.local` file with:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Update in production
   ```

4. Set up the database schema by running the SQL in `supabase/schema.sql`. You can do this in the SQL Editor in the Supabase Dashboard.

## Authentication Setup

1. Enable Discord authentication:

   - Go to Settings > Authentication > OAuth Providers > Discord
   - Create a new Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
   - Add your Supabase URL as a redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret from Discord to Supabase

2. Adjust the authentication settings:
   - Go to Settings > Authentication
   - Set the Site URL to your frontend URL
   - Enable "Enable email confirmations" if desired
   - Add redirect URLs for your development and production environments
   - Set the JWT expiry time as needed

## Storage Setup (Optional)

If you plan to use Supabase Storage for team logos and event images:

1. Create the following buckets:

   - `team-logos` - For team logo images
   - `event-images` - For event promotional images
   - `avatars` - For user profile pictures

2. Set up the following policies for each bucket (example for team-logos):

   ```sql
   -- Anyone can view team logos
   CREATE POLICY "Team logos are publicly accessible"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'team-logos');

   -- Only authenticated users can upload team logos
   CREATE POLICY "Authenticated users can upload team logos"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'team-logos' AND
     auth.role() = 'authenticated'
   );

   -- Only file owners can update or delete their uploads
   CREATE POLICY "Users can update their own team logos"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'team-logos' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   CREATE POLICY "Users can delete their own team logos"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'team-logos' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## Sample Data (Optional)

If you'd like to populate your database with sample data, you can run the SQL in `supabase/seed.sql` (to be created).

## Troubleshooting

- If you see empty error objects (`{}`) in your console, it's likely a permissions issue or missing tables
- Ensure your Row Level Security (RLS) policies are correctly configured
- Make sure your Supabase credentials in `.env.local` are correct
- Check that your Discord OAuth app is correctly configured
