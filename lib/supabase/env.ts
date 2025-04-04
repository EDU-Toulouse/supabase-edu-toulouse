/**
 * Centralized environment variable handling
 * This makes it easier to deploy to Vercel by ensuring all env vars are properly accessed
 */

// Throw clear error messages when required environment variables are missing
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Please check your .env setup or Vercel environment variables.`
    );
  }
  return value;
}

// Get environment variables or throw with helpful error messages
export const ENV = {
  // Supabase connection info
  SUPABASE_URL: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // App info
  APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),

  // Vercel-specific info
  IS_VERCEL: !!process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV || "development",
};

// Helper to check if we're in production
export const isProduction = ENV.VERCEL_ENV === "production";

// Helper to get the APP URL (useful for callbacks, webhooks, etc.)
export function getAppUrl(): string {
  return ENV.APP_URL;
}

// Helper to get storage URL
export function getStorageUrl(bucket: string): string {
  return `${ENV.SUPABASE_URL}/storage/v1/object/public/${bucket}`;
}
