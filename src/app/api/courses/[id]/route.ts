import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
            message: "You must be signed in to view this course.",
          },
        },
        { status: 401 }
      );
    }

    // 1. Fetch Course details
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "NOT_FOUND",
            message: "Course not found.",
          },
        },
        { status: 404 }
      );
    }

    // 2. Fetch associated Materials
    const { data: materials } = await supabase
      .from("uploaded_materials")
      .select("id, file_name, file_type, status, created_at")
      .eq("course_id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    // 3. Fetch Study Sessions for statistics
    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("id, duration_seconds, status")
      .eq("course_id", id)
      .eq("user_id", user.id);

    // 4. Fetch Quizzes for statistics
    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("id, score, total_questions")
      .eq("course_id", id)
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        course,
        materials: materials ?? [],
        sessions: sessions ?? [],
        quizzes: quizzes ?? [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unable to retrieve course details.",
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
            message: "You must be signed in to edit this course.",
          },
        },
        { status: 401 }
      );
    }

    const body: unknown = await req.json();
    const { code, title, description } = body as {
      code?: string;
      title?: string;
      description?: string;
    };

    const updateFields: Record<string, any> = {};
    if (typeof code === "string" && code.trim()) updateFields.code = code.trim();
    if (typeof title === "string" && title.trim()) updateFields.title = title.trim();
    if (typeof description === "string") updateFields.description = description.trim();

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "BAD_REQUEST",
            message: "No fields to update were provided.",
          },
        },
        { status: 400 }
      );
    }

    const { data: course, error } = await supabase
      .from("courses")
      .update(updateFields)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !course) {
      throw error ?? new Error("Failed to update course.");
    }

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        course,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "UPDATE_FAILED",
          message: error instanceof Error ? error.message : "Unable to edit the course.",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
            message: "You must be signed in to delete this course.",
          },
        },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
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
          code: "DELETE_FAILED",
          message: error instanceof Error ? error.message : "Unable to delete the course.",
        },
      },
      { status: 500 }
    );
  }
}
