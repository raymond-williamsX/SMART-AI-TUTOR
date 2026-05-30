import { createIndexIfMissing, deleteByQuery, indexDocument, refreshIndex, searchIndex } from "@/lib/elastic/client";
import { EMBEDDING_DIMENSIONS } from "@/lib/gemini/client";
import type { MaterialChunk, MaterialRow, RetrievedMaterialChunk } from "./types";

export const DOCUMENTS_INDEX = "eduagent_documents";
export const CHUNKS_INDEX = "eduagent_document_chunks";
export const EMBEDDINGS_INDEX = "eduagent_embeddings";

const keyword = { type: "keyword" };
const text = { type: "text" };
const date = { type: "date" };

export async function ensureMaterialIndices() {
  await Promise.all([
    createIndexIfMissing(DOCUMENTS_INDEX, {
      mappings: {
        properties: {
          user_id: keyword,
          document_id: keyword,
          session_id: keyword,
          document_name: text,
          file_type: keyword,
          status: keyword,
          summary: text,
          storage_path: keyword,
          created_at: date,
          processed_at: date,
        },
      },
    }),
    createIndexIfMissing(CHUNKS_INDEX, {
      mappings: {
        properties: {
          user_id: keyword,
          document_id: keyword,
          session_id: keyword,
          chunk_id: keyword,
          chunk_index: { type: "integer" },
          document_name: text,
          chunk_text: text,
          page: { type: "integer" },
          slide: { type: "integer" },
          chapter: keyword,
          section: keyword,
          token_estimate: { type: "integer" },
          created_at: date,
        },
      },
    }),
    createIndexIfMissing(EMBEDDINGS_INDEX, {
      mappings: {
        properties: {
          user_id: keyword,
          document_id: keyword,
          session_id: keyword,
          chunk_id: keyword,
          chunk_index: { type: "integer" },
          document_name: text,
          chunk_text: text,
          embedding: {
            type: "dense_vector",
            dims: EMBEDDING_DIMENSIONS,
            index: true,
            similarity: "cosine",
          },
          page: { type: "integer" },
          slide: { type: "integer" },
          chapter: keyword,
          section: keyword,
          status: keyword,
          created_at: date,
        },
      },
    }),
  ]);
}

export async function deleteMaterialFromElastic(documentId: string, userId: string) {
  const query = {
    query: {
      bool: {
        filter: [
          { term: { document_id: documentId } },
          { term: { user_id: userId } },
        ],
      },
    },
  };

  await Promise.all([
    deleteByQuery(DOCUMENTS_INDEX, query).catch(() => null),
    deleteByQuery(CHUNKS_INDEX, query).catch(() => null),
    deleteByQuery(EMBEDDINGS_INDEX, query).catch(() => null),
  ]);
}

export async function indexMaterialInElastic(params: {
  material: MaterialRow;
  chunks: Array<MaterialChunk & { embedding: number[] }>;
  summary: string;
}) {
  await ensureMaterialIndices();
  await deleteMaterialFromElastic(params.material.id, params.material.user_id);

  const now = new Date().toISOString();

  await indexDocument(DOCUMENTS_INDEX, params.material.id, {
    user_id: params.material.user_id,
    document_id: params.material.id,
    session_id: params.material.session_id,
    document_name: params.material.file_name,
    file_type: params.material.file_type,
    status: "ready",
    summary: params.summary,
    storage_path: params.material.storage_path,
    created_at: params.material.created_at,
    processed_at: now,
  });

  for (const chunk of params.chunks) {
    const chunkDoc = {
      user_id: chunk.userId,
      document_id: chunk.documentId,
      session_id: chunk.sessionId,
      chunk_id: chunk.id,
      chunk_index: chunk.index,
      document_name: chunk.documentName,
      chunk_text: chunk.text,
      page: chunk.page,
      slide: chunk.slide,
      chapter: chunk.chapter,
      section: chunk.section,
      token_estimate: chunk.tokenEstimate,
      status: "ready",
      created_at: now,
    };

    await Promise.all([
      indexDocument(CHUNKS_INDEX, chunk.id, chunkDoc),
      indexDocument(EMBEDDINGS_INDEX, chunk.id, {
        ...chunkDoc,
        embedding: chunk.embedding,
      }),
    ]);
  }

  await Promise.all([refreshIndex(DOCUMENTS_INDEX), refreshIndex(CHUNKS_INDEX), refreshIndex(EMBEDDINGS_INDEX)]);
}

function mapHit(hit: any): RetrievedMaterialChunk | null {
  const source = hit?._source;
  if (!source?.chunk_text || !source?.document_id || !source?.chunk_id) {
    return null;
  }

  return {
    id: source.chunk_id,
    documentId: source.document_id,
    documentName: source.document_name ?? "Uploaded material",
    userId: source.user_id,
    sessionId: source.session_id ?? null,
    index: Number(source.chunk_index ?? 0),
    text: source.chunk_text,
    tokenEstimate: Number(source.token_estimate ?? 0),
    page: typeof source.page === "number" ? source.page : undefined,
    slide: typeof source.slide === "number" ? source.slide : undefined,
    chapter: typeof source.chapter === "string" ? source.chapter : undefined,
    section: typeof source.section === "string" ? source.section : undefined,
    score: Number(hit?._score ?? 0),
  };
}

export async function searchMaterialEmbeddings(params: {
  userId: string;
  sessionId?: string | null;
  queryEmbedding: number[];
  limit?: number;
}) {
  await ensureMaterialIndices();

  const filters: unknown[] = [
    { term: { user_id: params.userId } },
    { term: { status: "ready" } },
  ];

  if (params.sessionId) {
    filters.push({ term: { session_id: params.sessionId } });
  }

  const response = await searchIndex(EMBEDDINGS_INDEX, {
    knn: {
      field: "embedding",
      query_vector: params.queryEmbedding,
      k: params.limit ?? 5,
      num_candidates: 50,
      filter: filters,
    },
    _source: [
      "user_id",
      "session_id",
      "document_id",
      "document_name",
      "chunk_id",
      "chunk_index",
      "chunk_text",
      "token_estimate",
      "page",
      "slide",
      "chapter",
      "section",
    ],
  });

  return ((response as any)?.hits?.hits ?? []).map(mapHit).filter(Boolean) as RetrievedMaterialChunk[];
}
