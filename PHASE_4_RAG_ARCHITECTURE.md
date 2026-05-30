# Phase 4 RAG Architecture

## Architecture Report

EduAgent AI now keeps the existing chat/session system intact while adding a document learning layer beside it.

1. Users upload materials from the My Materials workspace.
2. Files remain in the private Supabase Storage bucket `uploaded-materials`.
3. Supabase stores ownership, session links, file metadata, and processing status in `uploaded_materials`.
4. The processing API extracts text, chunks it, generates Gemini embeddings, and writes searchable records to ElasticSearch.
5. Chat retrieval runs at the service boundary after session ownership is verified.
6. Gemini receives retrieved material context when relevant and falls back to general tutoring when no useful context exists.

## Database And Index Structure

Supabase:

- `uploaded_materials`: adds `status`, `error_message`, `processed_at`, `chunk_count`, `summary`, `source_metadata`, and `deleted_at`.
- `study_messages`: adds `sources jsonb` for assistant source attribution.
- Existing RLS policies continue to protect rows by `user_id`.

ElasticSearch:

- `eduagent_documents`: document-level metadata, status, storage path, and summary.
- `eduagent_document_chunks`: chunk text plus page, slide, chapter, section, user, session, and document metadata.
- `eduagent_embeddings`: chunk metadata plus a 768-dimension `dense_vector` for kNN semantic search.

## RAG Flow Diagram

```text
User Upload
  -> Supabase Storage
  -> uploaded_materials row
  -> /api/materials/[id]/process
  -> Extract text or image understanding
  -> Chunk with overlap
  -> Gemini embedding generation
  -> ElasticSearch document/chunk/vector indexing
  -> uploaded_materials status = ready

User Chat Message
  -> /api/chat verifies user + session
  -> Query embedding
  -> Search active-session chunks
  -> Fall back to wider user library
  -> Inject top chunks into Gemini prompt
  -> Save assistant reply + source metadata
  -> Render answer with "Based on" attribution
```

## Remaining Limitations

- Processing runs inside API requests, so very large files can still hit platform timeouts.
- PPTX extraction reads slide XML text but does not render visual layout or speaker notes yet.
- PDF extraction depends on embedded/selectable text; scanned PDFs need OCR or Gemini Vision page rendering.
- Embeddings are generated sequentially for predictable rate-limit behavior, not batched.
- Elastic index creation happens lazily at runtime and should be moved into deployment automation for production.

## Phase 4.1 Recommendations

- Move processing into a durable queue/worker with retries and progress events.
- Add batch embedding support and per-file size limits.
- Add document previews with page thumbnails and citation deep links.
- Add course or subject collections to reduce cross-topic retrieval noise.
- Add admin observability for ingestion latency, failures, token use, and retrieval quality.
