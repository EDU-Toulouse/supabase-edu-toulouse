# Setting Up Authentication for Vercel Deployment

This guide will help you properly configure authentication to work on your Vercel deployment.

## Supabase Auth Configuration

When deploying to Vercel, you need to ensure that your Supabase project is configured with the correct URLs for authentication callbacks.

### 1. Site URL Configuration

1. In your Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Set your **Site URL** to your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
3. Click **Save**

### 2. Add Redirect URLs

In the same URL Configuration section:

1. Add the following URLs to the **Redirect URLs** list:

   - `https://your-project.vercel.app/auth/callback`
   - `https://www.your-project.vercel.app/auth/callback` (if using a custom domain)
   - `http://localhost:3000/auth/callback` (for local development)

2. Click **Save**

### 3. Discord OAuth Settings

If you're using Discord authentication:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to OAuth2 → Redirects
4. Add the following redirect URLs:
   - `https://your-project.vercel.app/auth/callback`
   - `https://[PROJECT_REF].supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)

## Environment Variables

Make sure your Vercel project has the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing Auth Flows

After deployment:

1. Try logging in with Discord
2. Verify that you are redirected back to your Vercel app (not localhost)
3. Check that the login session is maintained across page refreshes

## Troubleshooting

If you're experiencing issues with authentication:

1. **Check Browser Console**: Look for CORS or redirection errors
2. **Verify Environment Variables**: Ensure they are correctly set in Vercel
3. **Inspect Supabase Logs**: Check Authentication logs in your Supabase dashboard
4. **Clear Cookies**: Try clearing browser cookies and try again
5. **URL Encoding**: Ensure any special characters in redirect URLs are properly encoded

## Updating Existing Deployments

If you've already deployed and need to update your authentication configuration:

1. Update the Site URL and Redirect URLs in Supabase
2. Update your OAuth provider (Discord) redirect URLs
3. Redeploy your Vercel application to ensure all changes take effect
