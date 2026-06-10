import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { processMaterial } from "@/lib/materials/ingestion";
import { buildUploadPath, UPLOADED_MATERIALS_BUCKET } from "@/lib/uploads/constants";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const sessionId = formData.get("sessionId") as string;

    if (!file || !sessionId) {
      return NextResponse.json({ success: false, error: "File and sessionId are required" }, { status: 400 });
    }

    // Convert File to ArrayBuffer and Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload file to Supabase storage bucket 'uploaded-materials'
    const storagePath = buildUploadPath(user.id, sessionId, file.name);
    const { error: uploadError } = await supabase.storage
      .from(UPLOADED_MATERIALS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload:api] storage upload failed:", uploadError);
      return NextResponse.json({ success: false, error: "Failed to upload file to storage" }, { status: 500 });
    }

    // 2. Insert metadata into the database uploaded_materials table
    const { data: insertedRow, error: insertError } = await supabase
      .from("uploaded_materials")
      .insert({
        user_id: user.id,
        session_id: sessionId,
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        storage_path: storagePath,
      })
      .select("id")
      .single();

    if (insertError || !insertedRow) {
      console.error("[upload:api] database insert failed:", insertError);
      // Clean up uploaded file on failure
      await supabase.storage.from(UPLOADED_MATERIALS_BUCKET).remove([storagePath]).catch(() => null);
      return NextResponse.json({ success: false, error: insertError?.message || "Failed to save upload metadata" }, { status: 500 });
    }

    // 3. Process the material (extraction, chunking, embedding, ElasticSearch indexing)
    try {
      await processMaterial({
        supabase,
        materialId: insertedRow.id,
        userId: user.id,
      });
    } catch (processError) {
      console.error("[upload:api] document processing failed:", processError);
      const message = processError instanceof Error ? processError.message : "Document processing failed";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully processed document.",
    });

  } catch (error) {
    console.error("[upload:api] unexpected error processing file:", error);
    return NextResponse.json({ success: false, error: "Failed to process document" }, { status: 500 });
  }
}
