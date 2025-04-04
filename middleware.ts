import { createServerClient, CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ENV } from "./lib/supabase/env";

export async function middleware(request: NextRequest) {
  // Create a response that we can modify
  let response = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options?: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options,
        });
        response.cookies.set({
          name,
          value: "",
          ...options,
        });
      },
    },
  });

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If accessing admin routes but not authenticated, redirect to login
  if (request.nextUrl.pathname.startsWith("/admin") && !session) {
    // Use the proper app URL to ensure correct redirects in production
    const loginUrl = new URL("/api/auth/login", ENV.APP_URL);
    // Add returnTo parameter to redirect back after login
    loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing admin routes, check if user is an admin
  if (request.nextUrl.pathname.startsWith("/admin") && session) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (error || !profile || !profile.is_admin) {
      // User is not an admin, redirect to homepage using proper app URL
      const homeUrl = new URL("/", ENV.APP_URL);
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
