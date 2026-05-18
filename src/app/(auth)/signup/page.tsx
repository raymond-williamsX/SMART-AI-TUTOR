import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your tutoring workspace"
      description="Set up a premium study environment for document tutoring, adaptive learning, and AI-generated revision tools."
    >
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="name">
            Full name
          </label>
          <Input id="name" placeholder="Ada Lovelace" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="email">
            Email
          </label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" placeholder="Create a secure password" />
        </div>
        <Button className="w-full">Create account</Button>
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link href="/auth/login" className="text-cyan-300 hover:text-cyan-200">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
