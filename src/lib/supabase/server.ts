import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/config";

export type SupabaseCookieStore = {
  getAll: () => Array<{ name: string; value: string }>;
  setAll: (cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) => void;
};

export async function createSupabaseServerClient(cookieStore?: SupabaseCookieStore) {
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
    } as any;
  }

  const nextHeadersCookieStore = await cookies();
  const resolvedCookieStore =
    cookieStore ??
    {
      getAll() {
        return nextHeadersCookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          nextHeadersCookieStore.set({
            name,
            value,
            ...options,
          });
        });
      },
    };

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return resolvedCookieStore.getAll();
        },
        setAll(cookiesToSet) {
          resolvedCookieStore.setAll(cookiesToSet);
        },
      },
    }
  );
}