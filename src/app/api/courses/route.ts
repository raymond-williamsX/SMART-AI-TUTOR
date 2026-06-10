import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userResponse, error: userError } = await supabase.auth.getUser();

    if (userError || !userResponse.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api:courses] fetch failed", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ courses: data });
  } catch (err) {
    console.error("[api:courses] unexpected error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userResponse, error: userError } = await supabase.auth.getUser();

    if (userError || !userResponse.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, title, description } = body;

    if (!code || !title) {
      return NextResponse.json({ error: "Code and title are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          user_id: userResponse.user.id,
          code,
          title,
          description,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[api:courses] create failed", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ course: data });
  } catch (err) {
    console.error("[api:courses] unexpected error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
