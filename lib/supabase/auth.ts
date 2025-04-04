// Import the environment helper
import { ENV, getAppUrl } from "./env";
import { createClient } from "./server";

// Functions for authentication
export async function signInWithDiscord() {
  const supabase = createClient();

  // Use the dynamic app URL from environment variables instead of hardcoded URL
  const redirectTo = `${getAppUrl()}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: redirectTo,
    },
  });

  if (error) throw error;
  return data;
}

// Add or update other auth functions using the proper app URL
