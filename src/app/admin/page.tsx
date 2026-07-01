import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Secures page render behind server-side admin check
  await requireAdmin();

  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    }>
      <AdminDashboardShell />
    </Suspense>
  );
}
