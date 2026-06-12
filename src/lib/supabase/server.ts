import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/config";

export type SupabaseCookieStore = {
  getAll: () => Array<{ name: string; value: string }>;
  setAll: (cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) => void;
};

type SupabaseServerClient = ReturnType<typeof createServerClient>;

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Safe read-only fallback used when no cookie store is provided and cookies() throws (e.g. root layout RSC context).
// Prevents the "cookies() called outside request scope" crash rayx fixed.
const READ_ONLY_COOKIE_STORE: SupabaseCookieStore = {
  getAll() {
    return [];
  },
  setAll() {
    return;
  },
};

export async function createSupabaseServerClient(cookieStore?: SupabaseCookieStore): Promise<SupabaseServerClient> {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        getUser: async () => ({
          data: { user: null },
          error: null,
        }),
        getSession: async () => ({
          data: { session: null },
          error: null,
        }),
      },
    } as unknown as SupabaseServerClient;
  }

  let resolvedCookieStore = cookieStore;
  if (!resolvedCookieStore) {
    try {
      const nextCookies = await cookies();
      resolvedCookieStore = {
        getAll() {
          return nextCookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              nextCookies.set(name, value, options);
            });
          } catch {
            // Ignore header set errors when called inside RSC rendering contexts.
          }
        },
      };
    } catch {
      resolvedCookieStore = READ_ONLY_COOKIE_STORE;
    }
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return resolvedCookieStore!.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          resolvedCookieStore!.setAll(cookiesToSet);
        },
      },
    }
  );
}