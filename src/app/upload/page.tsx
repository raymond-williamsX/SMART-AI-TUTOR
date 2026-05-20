import { UploadCloud } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadPage() {
  return (
    <AppShell>
      <Card className="border-dashed border-white/15 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-cyan-300" />
            Upload workspace
          </CardTitle>
          <CardDescription>
            Document upload and processing will land in Phase 5. This shell is ready for drag-and-drop intake.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-slate-950/40 text-sm text-slate-400">
            Drop PDF, notes, or slides here.
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
