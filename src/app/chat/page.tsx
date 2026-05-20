import { AppShell } from "@/components/layout/AppShell";
import { StudyWorkspace } from "@/components/chat/StudyWorkspace";
import { requireUser } from "@/lib/auth/require-user";

export default async function ChatPage() {
  await requireUser("/chat");

  return (
    <AppShell>
      <StudyWorkspace />
    </AppShell>
  );
}
