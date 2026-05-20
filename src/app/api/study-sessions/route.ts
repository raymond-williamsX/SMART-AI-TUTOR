import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateStudySessionTitle } from "@/lib/study-sessions/title";
import type { StudySessionRecord } from "@/lib/study-sessions/types";

function mapStudySessionRow(session: any): StudySessionRecord {
  return {
    id: session.id,
    title: session.title,
    topicCategory: session.topic_category ?? "General",
    lastMessage: session.last_message ?? "",
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    messages: Array.isArray(session.study_messages)
      ? session.study_messages.map((message: any) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.created_at,
        }))
      : [],
  };
}

export async function GET() {
  const requestId = crypto.randomUUID();
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
          message: "You must be signed in to view study sessions.",
        },
      },
      { status: 401 }
    );
  }

  const { data: sessions, error } = await supabase
    .from("study_sessions")
    .select("id,title,topic_category,last_message,created_at,updated_at,study_messages(id,role,content,created_at)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: true, foreignTable: "study_messages" });

  if (error) {
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "FETCH_FAILED",
          message: error.message,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    requestId,
    data: {
      sessions: (sessions ?? []).map(mapStudySessionRow),
    },
  });
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
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
            message: "You must be signed in to create a study session.",
          },
        },
        { status: 401 }
      );
    }

    const body: unknown = await req.json();
    const titleInput = typeof (body as { title?: unknown })?.title === "string" ? (body as { title?: string }).title : "";
    const firstPrompt = typeof (body as { firstPrompt?: unknown })?.firstPrompt === "string" ? (body as { firstPrompt?: string }).firstPrompt : "";
    const normalizedFirstPrompt = firstPrompt ?? "";
    const topicCategory = typeof (body as { topicCategory?: unknown })?.topicCategory === "string" ? (body as { topicCategory?: string }).topicCategory : "General";
    const normalizedTopicCategory = topicCategory ?? "General";

    const title = titleInput ? titleInput.trim() : generateStudySessionTitle(normalizedFirstPrompt);

    const { data: session, error } = await supabase
      .from("study_sessions")
      .insert({
        user_id: user.id,
        title,
        topic_category: normalizedTopicCategory.trim() || "General",
        last_message: "",
      })
      .select("id,title,topic_category,last_message,created_at,updated_at,study_messages(id,role,content,created_at)")
      .single();

    if (error || !session) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "CREATE_FAILED",
            message: error?.message ?? "Unable to create a new study session.",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        session: mapStudySessionRow(session),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unable to create a study session.",
        },
      },
      { status: 500 }
    );
  }
}
