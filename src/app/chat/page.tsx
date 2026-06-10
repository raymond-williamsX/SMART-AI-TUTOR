import { StudyWorkspace } from "@/components/chat/StudyWorkspace";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  await requireUser("/chat");

  return (
    <main className="flex h-screen w-full bg-[#0a0a0a] text-slate-200 overflow-hidden font-body">
      <StudyWorkspace />
    </main>
  );
}
