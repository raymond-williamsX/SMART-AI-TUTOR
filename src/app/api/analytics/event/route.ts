import { NextResponse } from "next/server";
import { logAnalyticsEvent } from "@/lib/analytics/tracker";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { eventName, properties } = await req.json();
    
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

    await logAnalyticsEvent(userId, eventName, properties);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api:event] Error logging analytics event:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
