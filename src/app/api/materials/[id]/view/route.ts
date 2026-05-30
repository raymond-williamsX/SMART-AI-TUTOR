import { NextResponse } from "next/server";

import { fetchOwnedMaterial } from "@/lib/materials/ingestion";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UPLOADED_MATERIALS_BUCKET } from "@/lib/uploads/constants";

export async function POST(_req: Request, context: { params: Promise<{ id: string }> }) {
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
            message: "You must be signed in to view materials.",
          },
        },
        { status: 401 }
      );
    }

    const material = await fetchOwnedMaterial(supabase, id, user.id);
    if (!material) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "NOT_FOUND",
            message: "Material not found.",
          },
        },
        { status: 404 }
      );
    }

    const { data, error } = await supabase.storage.from(UPLOADED_MATERIALS_BUCKET).createSignedUrl(material.storage_path, 60 * 10);

    if (error || !data?.signedUrl) {
      throw error ?? new Error("Unable to create a signed URL.");
    }

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        signedUrl: data.signedUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "VIEW_FAILED",
          message: error instanceof Error ? error.message : "Unable to open this material.",
        },
      },
      { status: 500 }
    );
  }
}
