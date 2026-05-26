"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ redirectTo = "/dashboard", initialErrorMessage }: { redirectTo?: string; initialErrorMessage?: string }) {
  const router = useRouter();
  const { signIn, ready, error: authError, signInWithProvider } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialErrorMessage ?? null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signIn({ email: email.trim(), password });
      router.push(redirectTo);
<<<<<<< HEAD
<<<<<<< HEAD
=======
      router.refresh();
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
=======
      router.refresh();
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm text-slate-200" htmlFor="email">
          Email
        </label>
        <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-slate-200" htmlFor="password">
          Password
        </label>
        <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>
      {(error || authError) ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error ?? authError}</p> : null}
      {!ready ? <p className="text-sm text-slate-400">Authentication is still initializing...</p> : null}
      <Button className="w-full" type="submit" disabled={loading || !ready}>
        {loading ? "Signing in..." : "Continue"}
      </Button>
      <div className="flex items-center justify-center">
        <Button variant="ghost" type="button" disabled={loading || !ready} onClick={async () => {
          try {
            setLoading(true);
            console.info("[auth:login] google oauth start", { redirectTo });
            await signInWithProvider?.("google", redirectTo);
          } catch (err) {
            console.error("[auth:login] google oauth failed", { error: err });
            setError(err instanceof Error ? err.message : String(err));
          } finally {
            setLoading(false);
          }
        }}>
          Sign in with Google
        </Button>
      </div>
      <p className="text-center text-sm text-slate-400">
        New to EduAgent AI? <Link href="/signup" className="text-cyan-300 hover:text-cyan-200">Create an account</Link>
      </p>
    </form>
  );
}
