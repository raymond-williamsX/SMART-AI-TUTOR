import { Suspense } from "react";
import { StudyWorkspace } from "@/components/chat/StudyWorkspace";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireUser } from "@/lib/auth/require-user";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  await requireUser("/chat");

  return (
    <DashboardShell>
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      }>
        <StudyWorkspace />
      </Suspense>
    </DashboardShell>
  );
}
