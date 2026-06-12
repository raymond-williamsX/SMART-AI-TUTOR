import { UploadWorkspace } from "@/components/upload/UploadWorkspace";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  await requireUser("/materials");

  return (
    <main className="flex h-screen w-full bg-[#0a0a0a] text-slate-200 overflow-hidden font-body p-6">
      <UploadWorkspace />
    </main>
  );
}
