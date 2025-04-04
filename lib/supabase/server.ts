import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Silently fail if we're in a server component
            // The middleware will handle auth refresh properly
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            // Silently fail if we're in a server component
            // The middleware will handle auth refresh properly
          }
        },
      },
    }
  );
}

// Helper function to parse cookie options into a format accepted by NextResponse
function parseCookieOptions(options?: CookieOptions) {
  const { maxAge, ...rest } = options || {};
  return {
    ...rest,
    ...(maxAge && { "max-age": maxAge }),
  };
}
