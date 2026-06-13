import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server client bound to the request cookies. Because it runs as the logged-in
// user, every query is subject to RLS, which is exactly what proves our
// owner-scoped policies on the sites table.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component; safe to ignore when
            // middleware is refreshing the session.
          }
        },
      },
    }
  );
}
