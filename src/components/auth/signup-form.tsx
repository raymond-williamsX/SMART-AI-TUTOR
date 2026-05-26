"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignupForm({ redirectTo = "/dashboard", initialErrorMessage }: { redirectTo?: string; initialErrorMessage?: string }) {
  const router = useRouter();
  const { signUp, ready, error: authError, signInWithProvider } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialErrorMessage ?? null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setConfirmationMessage(null);

      const result = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (result.needsEmailConfirmation) {
        setConfirmationMessage("Account created. Check your email to confirm your address, then sign in.");
        router.replace(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
        return;
      }

      router.push(redirectTo);
<<<<<<< HEAD
=======
      router.refresh();
>>>>>>> 8967ed93ba299b787e1aa565943f8e449bb44118
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create your account right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm text-slate-200" htmlFor="name">
          Full name
        </label>
        <Input id="name" placeholder="Ada Lovelace" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
      </div>
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
        <Input id="password" type="password" placeholder="Create a secure password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>
      {(error || authError) ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error ?? authError}</p> : null}
      {confirmationMessage ? <p className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-50">{confirmationMessage}</p> : null}
      {!ready ? <p className="text-sm text-slate-400">Authentication is still initializing...</p> : null}
      <Button className="w-full" type="submit" disabled={loading || !ready}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
      <div className="flex items-center justify-center">
        <Button variant="ghost" type="button" disabled={loading || !ready} onClick={async () => {
          try {
            setLoading(true);
            console.info("[auth:signup] google oauth start", { redirectTo });
            await signInWithProvider?.("google", redirectTo);
          } catch (err) {
            console.error("[auth:signup] google oauth failed", { error: err });
            setError(err instanceof Error ? err.message : String(err));
          } finally {
            setLoading(false);
          }
        }}>
          Continue with Google
        </Button>
      </div>
      <p className="text-center text-sm text-slate-400">
        Already have an account? <Link href="/login" className="text-cyan-300 hover:text-cyan-200">Sign in</Link>
      </p>
    </form>
  );
}
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignupForm({ redirectTo = "/dashboard", initialErrorMessage }: { redirectTo?: string; initialErrorMessage?: string }) {
  const router = useRouter();
  const { signUp, ready, error: authError, signInWithProvider } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialErrorMessage ?? null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setConfirmationMessage(null);

      const result = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (result.needsEmailConfirmation) {
        setConfirmationMessage("Account created. Check your email to confirm your address, then sign in.");
        router.replace(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create your account right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm text-slate-200" htmlFor="name">
          Full name
        </label>
        <Input id="name" placeholder="Ada Lovelace" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
      </div>
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
        <Input id="password" type="password" placeholder="Create a secure password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </div>
      {(error || authError) ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error ?? authError}</p> : null}
      {confirmationMessage ? <p className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-50">{confirmationMessage}</p> : null}
      {!ready ? <p className="text-sm text-slate-400">Authentication is still initializing...</p> : null}
      <Button className="w-full" type="submit" disabled={loading || !ready}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
      <div className="flex items-center justify-center">
        <Button variant="ghost" type="button" disabled={loading || !ready} onClick={async () => {
          try {
            setLoading(true);
            console.info("[auth:signup] google oauth start", { redirectTo });
            await signInWithProvider?.("google", redirectTo);
          } catch (err) {
            console.error("[auth:signup] google oauth failed", { error: err });
            setError(err instanceof Error ? err.message : String(err));
          } finally {
            setLoading(false);
          }
        }}>
          Continue with Google
        </Button>
      </div>
      <p className="text-center text-sm text-slate-400">
        Already have an account? <Link href="/login" className="text-cyan-300 hover:text-cyan-200">Sign in</Link>
      </p>
    </form>
  );
}
