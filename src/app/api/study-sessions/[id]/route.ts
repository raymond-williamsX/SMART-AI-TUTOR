import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateStudySessionTitle } from "@/lib/study-sessions/title";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();

  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to update a study session.",
          },
        },
        { status: 401 }
      );
    }

    const body: unknown = await req.json();
    const title = typeof (body as { title?: unknown })?.title === "string" ? (body as { title?: string }).title : "";
    const firstPrompt = typeof (body as { firstPrompt?: unknown })?.firstPrompt === "string" ? (body as { firstPrompt?: string }).firstPrompt : "";
    const normalizedFirstPrompt = firstPrompt ?? "";

    const nextTitle = title ? title.trim() : generateStudySessionTitle(normalizedFirstPrompt);

    const { data: session, error } = await supabase
      .from("study_sessions")
      .update({ title: nextTitle })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id,title,topic_category,last_message,created_at,updated_at")
      .single();

    if (error || !session) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "UPDATE_FAILED",
            message: error?.message ?? "Unable to update the study session.",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId,
      data: { session },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unable to update the study session.",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();

  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to delete a study session.",
          },
        },
        { status: 401 }
      );
    }

    const { error } = await supabase.from("study_sessions").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "DELETE_FAILED",
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unable to delete the study session.",
        },
      },
      { status: 500 }
    );
  }
}
