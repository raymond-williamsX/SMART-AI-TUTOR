import { CalendarDays } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  await requireUser("/schedule");

  return (
    <AppShell>
      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-cyan-300" />
            Scheduling workspace
          </CardTitle>
          <CardDescription>
            Lesson scheduling, recurring sessions, and reminders are planned for a later phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-white/10 bg-slate-950/40 text-sm text-slate-400">
            Calendar and lesson planner shell.
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
