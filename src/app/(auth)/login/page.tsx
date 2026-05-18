import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue your tutoring workspace, review lessons, and prepare for future AI study sessions."
    >
      <form className="space-y-4">
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
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <Button className="w-full">Continue</Button>
        <p className="text-center text-sm text-slate-400">
          New to EduAgent AI? <Link href="/auth/signup" className="text-cyan-300 hover:text-cyan-200">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
