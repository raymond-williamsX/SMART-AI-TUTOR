import { NextResponse } from "next/server";

import { deleteMaterialFromElastic } from "@/lib/materials/elastic";
import { fetchOwnedMaterial } from "@/lib/materials/ingestion";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UPLOADED_MATERIALS_BUCKET } from "@/lib/uploads/constants";

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
            message: "You must be signed in to delete materials.",
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

    const deletedAt = new Date().toISOString();
    const { error } = await supabase
      .from("uploaded_materials")
      .update({
        status: "deleted",
        deleted_at: deletedAt,
        error_message: null,
      })
      .eq("id", material.id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    await Promise.all([
      deleteMaterialFromElastic(material.id, user.id),
      supabase.storage.from(UPLOADED_MATERIALS_BUCKET).remove([material.storage_path]).catch(() => null),
    ]);

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
          message: error instanceof Error ? error.message : "Unable to delete this material.",
        },
      },
      { status: 500 }
    );
  }
}
