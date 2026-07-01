import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
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
    const { userId } = await params;

    // 1. Fetch Auth details
    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId);
    if (authError || !authUser?.user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // 2. Fetch Sessions
    const { data: sessions } = await adminClient
      .from("study_sessions")
      .select("id, title, topic_category, status, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    // 3. Fetch Uploads
    const { data: uploads } = await adminClient
      .from("uploaded_materials")
      .select("id, file_name, file_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // 4. Fetch AI usage
    const { data: aiRequests } = await adminClient
      .from("ai_requests")
      .select("id, model_used, request_type, prompt_tokens, completion_tokens, estimated_cost, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // 5. Fetch Page views (for traffic/device details)
    const { data: pageViews } = await adminClient
      .from("page_views")
      .select("path, referrer, user_agent, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    // 6. Fetch Attribution
    const { data: attribution } = await adminClient
      .from("user_attribution")
      .select("utm_source, utm_medium, utm_campaign, referrer, created_at")
      .eq("user_id", userId)
      .maybeSingle();

    // Sum token/cost usage
    let totalPrompt = 0;
    let totalCompletion = 0;
    let totalCost = 0;
    aiRequests?.forEach((req) => {
      totalPrompt += req.prompt_tokens || 0;
      totalCompletion += req.completion_tokens || 0;
      totalCost += Number(req.estimated_cost || 0);
    });

    // Detect device/OS from latest page view user-agent
    let device = "Desktop";
    if (pageViews && pageViews.length > 0 && pageViews[0].user_agent) {
      const ua = pageViews[0].user_agent.toLowerCase();
      if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone")) {
        device = "Mobile";
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: authUser.user.id,
          name: authUser.user.user_metadata?.full_name || "User",
          email: authUser.user.email,
          provider: authUser.user.app_metadata?.provider || "email",
          joinedDate: authUser.user.created_at,
          lastLogin: authUser.user.last_sign_in_at || authUser.user.created_at,
          status: authUser.user.app_metadata?.role === "admin" ? "Admin" : "Active",
          device,
          subscriptionStatus: "Free", // Placeholder for billing features
        },
        attribution: attribution || null,
        sessions: sessions || [],
        uploads: uploads || [],
        aiUsage: {
          requests: aiRequests || [],
          totalRequestsCount: aiRequests?.length || 0,
          totalPromptTokens: totalPrompt,
          totalCompletionTokens: totalCompletion,
          totalCost: parseFloat(totalCost.toFixed(5)),
        },
      },
    });
  } catch (err) {
    console.error("[api:admin:user-details] Exception:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
