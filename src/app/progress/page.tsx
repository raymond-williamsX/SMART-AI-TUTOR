import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProgressPage() {
  return (
    <Card className="bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-300" />
          Progress tracking
        </CardTitle>
        <CardDescription>
          Learning analytics, mastery tracking, and weak topic insights will be added in Phase 13.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-white/10 bg-slate-950/40 text-sm text-slate-400">
          Progress analytics shell.
        </div>
      </CardContent>
    </Card>
  );
}
