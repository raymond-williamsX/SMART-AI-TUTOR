import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/gemini/client";
import { indexDocumentChunks } from "@/lib/elastic/client";
import { PDFParse } from "pdf-parse";

// Simple text splitter function
function splitText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

export async function POST(req: Request) {
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

    // Parse PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parser = new PDFParse({ data: buffer });
    let rawText = "";
    try {
      const pdfData = await parser.getText();
      rawText = pdfData.pages.map((p) => p.text).join("\n");
    } finally {
      await parser.destroy();
    }

    if (!rawText.trim()) {
      return NextResponse.json({ success: false, error: "No text found in PDF" }, { status: 400 });
    }

    // Chunk text
    const chunks = splitText(rawText);
    
    // Generate embeddings and prepare for Elastic
    const elasticChunks = [];
    for (const chunk of chunks) {
      if (chunk.trim().length < 10) continue;
      const embedding = await generateEmbedding(chunk);
      elasticChunks.push({
        text: chunk,
        embedding,
        sessionId,
      });
    }

    // Index in ElasticSearch
    if (elasticChunks.length > 0) {
      await indexDocumentChunks("eduagent-documents", elasticChunks);
    }

    return NextResponse.json({ success: true, message: `Successfully processed ${elasticChunks.length} chunks.` });

  } catch (error) {
    console.error("[upload] error processing file:", error);
    return NextResponse.json({ success: false, error: "Failed to process document" }, { status: 500 });
  }
}
