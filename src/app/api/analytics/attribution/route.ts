import { NextResponse } from "next/server";
import { logMarketingAttribution } from "@/lib/analytics/tracker";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    
    if (!data?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { utm_source, utm_medium, utm_campaign, referrer } = await req.json();

    await logMarketingAttribution(data.user.id, {
      utm_source,
      utm_medium,
      utm_campaign,
      referrer,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api:attribution] Error logging attribution:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
