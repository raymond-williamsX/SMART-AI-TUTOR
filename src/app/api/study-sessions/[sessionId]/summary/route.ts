import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/gemini/client";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const requestId = crypto.randomUUID();
  const { sessionId } = await params;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, requestId, error: { code: "UNAUTHORIZED", message: "Unauthorized." } },
        { status: 401 }
      );
    }

    // Fetch session data
    const { data: session, error: sessionError } = await supabase
      .from("study_sessions")
      .select("id, title, topics_covered, duration_seconds")
      .eq("id", sessionId)
      .eq("user_id", userData.user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, requestId, error: { code: "NOT_FOUND", message: "Session not found." } },
        { status: 404 }
      );
    }

    // Fetch recent messages for context
    const { data: messages } = await supabase
      .from("study_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(30);

    const durationMins = Math.round((session.duration_seconds ?? 0) / 60);
    const topics = Array.isArray(session.topics_covered) ? session.topics_covered : [];
    const chatLog = (messages ?? [])
      .map((m: any) => `${m.role === "user" ? "Student" : "AI Tutor"}: ${m.content}`)
      .join("\n");

    const prompt = `You are an academic study assistant. Generate a concise, structured study session summary.

Session Title: "${session.title}"
Duration: ${durationMins} minutes
Topics Covered: ${topics.length > 0 ? topics.join(", ") : "General study"}

${chatLog ? `Chat Summary:\n${chatLog.slice(0, 3000)}` : ""}

Write a clear study session summary with:
1. A brief overview of what was studied (2-3 sentences)
2. Key concepts covered (bullet points)
3. Recommended next steps (2-3 suggestions)

Keep the tone encouraging and academic. Format using plain text with clear headings.`;

    let summary = "";
    try {
      const result = await generateText(prompt);
      summary = result.text;
    } catch (geminiErr) {
      console.warn("[study-sessions:summary] Gemini failed", geminiErr);
      summary = `**Session Complete!**\n\nYou studied for ${durationMins} minutes${topics.length > 0 ? ` covering: ${topics.join(", ")}` : ""}.\n\nGreat work on staying focused. Review your notes and consider revisiting any challenging topics in your next session.`;
    }

    // Update session with summary and mark completed
    await supabase
      .from("study_sessions")
      .update({ summary, status: "completed" })
      .eq("id", sessionId)
      .eq("user_id", userData.user.id);

    return NextResponse.json({
      success: true,
      requestId,
      data: { summary },
    });
  } catch (err) {
    console.error("[study-sessions:summary] unexpected error", err);
    return NextResponse.json(
      { success: false, requestId, error: { code: "INTERNAL_ERROR", message: "Failed to generate summary." } },
      { status: 500 }
    );
  }
}
