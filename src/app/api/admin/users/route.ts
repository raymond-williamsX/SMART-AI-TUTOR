import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const { data, error } = await supabase.rpc("get_admin_users", {
      search_query: search,
      filter_plan: plan,
      page_offset: offset,
      page_limit: limit,
    });

    if (error) {
      console.warn("[api:admin:users] RPC failed, trying query fallback:", error.message);
      
      const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;

      let filteredUsers = authUsers.users.map((u) => ({
        id: u.id,
        name: u.user_metadata?.full_name || "User",
        email: u.email || "",
        provider: u.app_metadata?.provider || "email",
        joined_date: u.created_at,
        last_login: u.last_sign_in_at || u.created_at,
        status: u.app_metadata?.role === "admin" ? "Admin" : "Active",
        total_sessions: 0,
        total_messages: 0,
        documents_uploaded: 0,
        current_plan: "Free",
      }));

      if (search) {
        const query = search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (u) => u.email.toLowerCase().includes(query) || u.name.toLowerCase().includes(query)
        );
      }

      const totalCount = filteredUsers.length;
      const pageUsers = filteredUsers.slice(offset, offset + limit);

      const enhancedUsers = await Promise.all(
        pageUsers.map(async (u) => {
          const { count: sessions } = await adminClient
            .from("study_sessions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", u.id);
          const { count: messages } = await adminClient
            .from("study_messages")
            .select("*", { count: "exact", head: true })
            .eq("user_id", u.id);
          const { count: docs } = await adminClient
            .from("uploaded_materials")
            .select("*", { count: "exact", head: true })
            .eq("user_id", u.id);

          return {
            ...u,
            total_sessions: sessions || 0,
            total_messages: messages || 0,
            documents_uploaded: docs || 0,
            total_count: totalCount,
          };
        })
      );

      return NextResponse.json({ success: true, data: enhancedUsers });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[api:admin:users] Exception:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
