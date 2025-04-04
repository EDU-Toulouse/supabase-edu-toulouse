"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ENV, getAppUrl } from "@/lib/supabase/env";

export function LoginButton({
  redirectTo = "/",
  label = "Sign In with Discord",
  className = "",
}: {
  redirectTo?: string;
  label?: string;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Create Supabase browser client
  const supabase = createBrowserClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      // Get the full app URL to ensure proper redirects on all environments
      const appUrl = getAppUrl();

      // Create the callback URL with the appUrl as base
      const callbackUrl = `${appUrl}/auth/callback`;

      // Add the returnTo parameter to redirect after auth
      const callbackWithReturn =
        redirectTo !== "/"
          ? `${callbackUrl}?returnTo=${encodeURIComponent(redirectTo)}`
          : callbackUrl;

      // Sign in with Discord using the environment-aware callback URL
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: callbackWithReturn,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleLogin} disabled={isLoading} className={className}>
      {isLoading ? "Signing in..." : label}
    </Button>
  );
}
