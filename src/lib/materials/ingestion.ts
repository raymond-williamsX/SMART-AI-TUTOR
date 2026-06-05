import { generateEmbedding } from "@/lib/gemini/client";
import { UPLOADED_MATERIALS_BUCKET } from "@/lib/uploads/constants";
import { chunkMaterial, createSummary } from "./chunking";
import { indexMaterialInElastic } from "./elastic";
import { extractMaterialText } from "./extract";
import { MATERIAL_SELECT, type MaterialRow } from "./types";

type SupabaseClientLike = {
  from: (table: string) => any;
  storage: {
    from: (bucket: string) => any;
  };
};

async function updateMaterialStatus(
  supabase: SupabaseClientLike,
  materialId: string,
  userId: string,
  values: Record<string, unknown>
) {
  const { error } = await supabase
    .from("uploaded_materials")
    .update(values)
    .eq("id", materialId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function fetchOwnedMaterial(
  supabase: SupabaseClientLike,
  materialId: string,
  userId: string
): Promise<MaterialRow | null> {
  const { data, error } = await supabase
    .from("uploaded_materials")
    .select(MATERIAL_SELECT)
    .eq("id", materialId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as MaterialRow | null;
}

export async function processMaterial(params: {
  supabase: SupabaseClientLike;
  materialId: string;
  userId: string;
}) {
  const material = await fetchOwnedMaterial(params.supabase, params.materialId, params.userId);

  if (!material) {
    throw new Error("Material not found.");
  }

  await updateMaterialStatus(params.supabase, material.id, params.userId, {
    status: "processing",
    error_message: null,
  });

  try {
    const { data, error } = await params.supabase.storage.from(UPLOADED_MATERIALS_BUCKET).download(material.storage_path);

    if (error || !data) {
      throw error ?? new Error("Unable to download uploaded material.");
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const segments = await extractMaterialText({
      buffer,
      mimeType: material.file_type,
      fileName: material.file_name,
    });

    if (segments.length === 0) {
      throw new Error("No readable educational content was found in this material.");
    }

    const fullText = segments.map((segment) => segment.text).join("\n\n");
    const summary = createSummary(fullText);
    const chunks = chunkMaterial({
      documentId: material.id,
      documentName: material.file_name,
      userId: material.user_id,
      sessionId: material.session_id,
      segments,
    });

    if (chunks.length === 0) {
      throw new Error("Unable to create searchable chunks from this material.");
    }

    const chunksWithEmbeddings = [];

    for (const chunk of chunks) {
      chunksWithEmbeddings.push({
        ...chunk,
        embedding: await generateEmbedding(chunk.text, "RETRIEVAL_DOCUMENT", material.file_name),
      });
    }

    await indexMaterialInElastic({
      material,
      chunks: chunksWithEmbeddings,
      summary,
    });

    const processedAt = new Date().toISOString();
    await updateMaterialStatus(params.supabase, material.id, params.userId, {
      status: "ready",
      error_message: null,
      processed_at: processedAt,
      chunk_count: chunks.length,
      summary,
      source_metadata: {
        extractionSegments: segments.length,
        embeddingModel: "gemini-embedding-001",
        embeddingDimensions: 768,
      },
    });

    return {
      ...material,
      status: "ready" as const,
      error_message: null,
      processed_at: processedAt,
      chunk_count: chunks.length,
      summary,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process this material.";

    await updateMaterialStatus(params.supabase, material.id, params.userId, {
      status: "failed",
      error_message: message,
    });

    throw new Error(message);
  }
}
