import { AppShell } from "@/components/layout/AppShell";
import { UploadWorkspace } from "@/components/upload/UploadWorkspace";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  await requireUser("/upload");

  return (
    <AppShell>
      <UploadWorkspace />
    </AppShell>
  );
}
