import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireUser("/settings");

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-glow sm:p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Settings</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-white">Workspace settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
            This settings surface is a lightweight placeholder for future profile, theme, and tutoring preferences.
          </p>
        </section>

        <Card className="border-white/10 bg-white/[0.04] shadow-glow">
          <CardHeader>
            <CardTitle className="text-white">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">Theme and appearance controls will live here.</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">Notification and study reminder preferences will live here.</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">Tutor memory and personalization settings will live here.</div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}