import { NextResponse } from "next/server";
import { logPageView } from "@/lib/analytics/tracker";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { path, referrer } = await req.json();
    
    let userId: string | null = null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        userId = data.user.id;
      }
    } catch {
      // Ignore user session errors
    }

    const userAgent = req.headers.get("user-agent");

    await logPageView(userId, path, referrer, userAgent);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api:pageview] Error logging pageview:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
