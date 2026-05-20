import { getAppUrl } from "@/lib/supabase/config";

export function buildOAuthRedirectUrl(nextPath = "/dashboard") {
  const appUrl = getAppUrl();

  if (!appUrl) {
    throw new Error("Missing app URL. Set NEXT_PUBLIC_APP_URL or use the browser origin.");
  }

  const callbackUrl = new URL("/auth/callback", appUrl);
  callbackUrl.searchParams.set("next", nextPath);

  return callbackUrl.toString();
}
