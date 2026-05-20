import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient, type SupabaseCookieStore } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const nextPath = request.nextUrl.searchParams.get("next") ?? "/dashboard";
  const error = request.nextUrl.searchParams.get("error");
  const errorDescription = request.nextUrl.searchParams.get("error_description");

  console.info("[auth:callback] received", {
    requestId,
    hasCode: Boolean(request.nextUrl.searchParams.get("code")),
    nextPath,
    error,
  });

  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", errorDescription ?? error);
    loginUrl.searchParams.set("redirectTo", nextPath);

    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Cache-Control", "private, no-store");

    return response;
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Missing OAuth code.");
    loginUrl.searchParams.set("redirectTo", nextPath);

    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Cache-Control", "private, no-store");

    return response;
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.headers.set("Cache-Control", "private, no-store");

  try {
    const supabase = await createSupabaseServerClient({
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set({ name, value, ...options });
        });
      },
    });
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.warn("[auth:callback] exchange failed", {
        requestId,
        message: exchangeError.message,
      });

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "Google sign-in failed. Please try again.");
      loginUrl.searchParams.set("redirectTo", nextPath);

      return NextResponse.redirect(loginUrl);
    }

    console.info("[auth:callback] exchange success", {
      requestId,
      userId: data.user?.id,
      nextPath,
    });

    return response;
  } catch (callbackError) {
    console.error("[auth:callback] unexpected error", {
      requestId,
      error: callbackError,
    });

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Unable to finish Google sign-in.");
    loginUrl.searchParams.set("redirectTo", nextPath);

    return NextResponse.redirect(loginUrl);
  }
}
