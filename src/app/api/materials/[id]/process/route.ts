import { NextResponse } from "next/server";

import { processMaterial } from "@/lib/materials/ingestion";
import { serializeMaterial } from "@/lib/materials/serialize";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(_req: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();
  console.log("[DEBUG] /api/materials/[id]/process POST called");

  try {
    const params = await context.params;
    const id = params?.id;
    console.log("[DEBUG] Route id resolved:", id);
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
            message: "You must be signed in to process materials.",
          },
        },
        { status: 401 }
      );
    }

    const material = await processMaterial({
      supabase,
      materialId: id,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        material: serializeMaterial(material),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "PROCESS_FAILED",
          message: error instanceof Error ? error.message : "Unable to process this material.",
        },
      },
      { status: 500 }
    );
  }
}
