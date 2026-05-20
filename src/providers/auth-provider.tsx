"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { AuthContext, type AuthCredentials, type SignUpCredentials } from "@/context/auth-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError("Supabase is not configured. Set the public Supabase env vars to enable authentication.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!isMounted) {
          return;
        }

        if (sessionError) {
          setError(sessionError.message);
        }

        setSession(data.session ?? null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setError(null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = {
    user: session?.user ?? null,
    session,
    loading,
    ready: Boolean(supabase),
    error,
    signIn: async ({ email, password }: AuthCredentials) => {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      setError(null);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }
    },
    signUp: async ({ email, password, fullName }: SignUpCredentials) => {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      return {
        needsEmailConfirmation: !data.session,
      };
    },
    signOut: async () => {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      setError(null);

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }
    },
    signInWithProvider: async (provider: string, redirectTo?: string) => {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      setError(null);

      const options: any = {};
      if (redirectTo) options.redirectTo = redirectTo;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options,
      });

      if (oauthError) {
        throw oauthError;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
