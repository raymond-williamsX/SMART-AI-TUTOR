import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
  }

  const adminClient = createSupabaseAdminClient();
  const { data: isAdmin } = await adminClient.rpc("is_admin", { user_id: userData.user.id });
  
  const adminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim())
    : ["admin@eduagent.ai"];
  const isFallbackAdmin = userData.user.email && adminEmails.includes(userData.user.email);
  const isRoleAdmin = userData.user.app_metadata?.role === "admin";

  if (!isAdmin && !isFallbackAdmin && !isRoleAdmin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { targetUserId, action } = await req.json();

    if (!targetUserId || !action) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }

    if (action === "add") {
      const { error: rpcError } = await supabase.rpc("add_admin", { target_user_id: targetUserId });
      
      if (rpcError) {
        console.warn("[api:admin:toggle] RPC add_admin failed, using direct query:", rpcError.message);
        const { error: queryError } = await adminClient
          .from("admin_users")
          .insert({ user_id: targetUserId });
        if (queryError) throw queryError;
      }

      const { error: authError } = await adminClient.auth.admin.updateUserById(targetUserId, {
        app_metadata: { role: "admin" }
      });
      if (authError) {
        console.warn("[api:admin:toggle] Failed to update user app_metadata role:", authError.message);
      }

    } else if (action === "remove") {
      const { error: rpcError } = await supabase.rpc("remove_admin", { target_user_id: targetUserId });
      
      if (rpcError) {
        console.warn("[api:admin:toggle] RPC remove_admin failed, using direct query:", rpcError.message);
        const { error: queryError } = await adminClient
          .from("admin_users")
          .delete()
          .eq("user_id", targetUserId);
        if (queryError) throw queryError;
      }

      const { error: authError } = await adminClient.auth.admin.updateUserById(targetUserId, {
        app_metadata: { role: "user" }
      });
      if (authError) {
        console.warn("[api:admin:toggle] Failed to remove user app_metadata role:", authError.message);
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api:admin:toggle] Exception:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
