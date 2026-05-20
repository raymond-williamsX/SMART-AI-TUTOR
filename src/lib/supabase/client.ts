import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

  return browserClient;
}
