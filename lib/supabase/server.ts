import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ENV } from "./env";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set(name, value, options);
      },
      remove(name, options) {
        cookieStore.set(name, "", { ...options, maxAge: 0 });
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
