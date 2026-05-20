import { BarChart3 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  await requireUser("/progress");

  return (
    <AppShell>
      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-300" />
            Progress tracking
          </CardTitle>
          <CardDescription>
            Visualize your mastery over topics, track progress over time, and uncover weak areas so you can focus your study sessions more effectively.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-white/10 bg-slate-950/40 text-sm text-slate-400">
            Progress analytics shell.
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
