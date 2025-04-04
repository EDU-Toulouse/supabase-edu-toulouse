# Deploying to Vercel

This guide will help you deploy the application to Vercel quickly and easily.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your Supabase project set up with necessary tables and policies
3. Your GitHub repository containing this codebase

## Steps to Deploy

### 1. Connect Your Repository

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Select the GitHub repository containing your app
4. Click "Import"

### 2. Configure Project

During the import process, you'll be asked to configure your project:

1. **Framework Preset**: Vercel should automatically detect Next.js
2. **Build and Output Settings**: Leave as default (we've configured them in `vercel.json`)
3. **Environment Variables**: This is the most important part!

### 3. Set Environment Variables

Add the following environment variables from your Supabase project:

| Name                            | Description                    | Where to find it                                                                |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL      | Supabase Dashboard > Project Settings > API > Project URL                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous public API key       | Supabase Dashboard > Project Settings > API > Project API keys > `anon public`  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key (keep secret) | Supabase Dashboard > Project Settings > API > Project API keys > `service_role` |

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be deployed to a URL like `your-project.vercel.app`

## Automatic Deployments

Once connected, Vercel will automatically deploy:

- When you push to your main branch
- When you create pull requests (preview deployments)

## Troubleshooting

If your deployment fails, check:

1. **Build Logs**: Look for error messages in the build output
2. **Environment Variables**: Ensure all required variables are set correctly
3. **Database Connection**: Make sure Supabase is accessible from Vercel

## Custom Domains

To add a custom domain:

1. Go to your project in Vercel
2. Navigate to "Settings" > "Domains"
3. Add your domain and follow the verification steps

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/solutions/nextjs)
- [Supabase Documentation](https://supabase.com/docs)
