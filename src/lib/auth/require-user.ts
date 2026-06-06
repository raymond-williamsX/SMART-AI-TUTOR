import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUser(redirectTo: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(`/?auth=login&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return data.user;
}
