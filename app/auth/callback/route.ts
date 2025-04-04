import { createServerClient, CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ENV } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Get the returnTo parameter if provided, or default to the base path
  const returnTo = requestUrl.searchParams.get("returnTo") || "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            try {
              return cookieStore.get(name)?.value;
            } catch (error) {
              console.error("Cookie get error:", error);
              return undefined;
            }
          },
          set(name: string, value: string, options?: CookieOptions) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              console.error("Cookie set error:", error);
            }
          },
          remove(name: string, options?: CookieOptions) {
            try {
              cookieStore.set(name, "", { ...options, maxAge: 0 });
            } catch (error) {
              console.error("Cookie remove error:", error);
            }
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  // First try to get the origin from the request
  let redirectUrl = requestUrl.origin;

  // For production deployments, make sure we're using the correct Vercel URL if available
  if (ENV.IS_VERCEL && ENV.VERCEL_ENV !== "development") {
    // Use APP_URL which includes the Vercel URL when deployed
    redirectUrl = ENV.APP_URL;
  }

  // Append the return path if provided
  return NextResponse.redirect(
    `${redirectUrl}${returnTo !== "/" ? returnTo : ""}`
  );
}
