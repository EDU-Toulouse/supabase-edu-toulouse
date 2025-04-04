import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ENV } from "./env";
import { CookieOptions } from "@supabase/ssr";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        try {
          cookieStore.set(name, value, options);
        } catch (error) {
          // Silent fail for server components - middleware will handle refresh
        }
      },
      remove(name: string, options?: CookieOptions) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        } catch (error) {
          // Silent fail for server components - middleware will handle refresh
        }
      },
    },
  });
}

// Helper function to parse cookie options into a format accepted by NextResponse
function parseCookieOptions(options?: CookieOptions) {
  const { maxAge, ...rest } = options || {};
  return {
    ...rest,
    ...(maxAge && { "max-age": maxAge }),
  };
}
