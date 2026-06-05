import type { ExtractedMaterialSegment, MaterialChunk } from "./types";

const TARGET_CHUNK_TOKENS = 800;
const MIN_CHUNK_TOKENS = 500;
const OVERLAP_TOKENS = 120;

function estimateTokens(text: string) {
  return Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.3);
}

function splitWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function normalizeText(text: string) {
  return text.replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function createSummary(text: string) {
  const normalized = normalizeText(text);
  if (normalized.length <= 900) {
    return normalized;
  }

  return `${normalized.slice(0, 900).trim()}...`;
}

export function chunkMaterial(params: {
  documentId: string;
  documentName: string;
  userId: string;
  sessionId: string | null;
  segments: ExtractedMaterialSegment[];
}): MaterialChunk[] {
  const chunks: MaterialChunk[] = [];

  for (const segment of params.segments) {
    const normalized = normalizeText(segment.text);
    if (!normalized) {
      continue;
    }

    const words = splitWords(normalized);
    if (estimateTokens(normalized) <= TARGET_CHUNK_TOKENS) {
      chunks.push({
        ...segment,
        id: `${params.documentId}-${chunks.length}`,
        documentId: params.documentId,
        documentName: params.documentName,
        userId: params.userId,
        sessionId: params.sessionId,
        index: chunks.length,
        text: normalized,
        tokenEstimate: estimateTokens(normalized),
      });
      continue;
    }

    const wordsPerChunk = Math.max(380, Math.floor(TARGET_CHUNK_TOKENS / 1.3));
    const overlapWords = Math.max(60, Math.floor(OVERLAP_TOKENS / 1.3));

    for (let start = 0; start < words.length; start += wordsPerChunk - overlapWords) {
      const end = Math.min(start + wordsPerChunk, words.length);
      const chunkText = words.slice(start, end).join(" ");
      const tokenEstimate = estimateTokens(chunkText);

      if (tokenEstimate < MIN_CHUNK_TOKENS && end !== words.length && chunks.length > 0) {
        continue;
      }

      chunks.push({
        ...segment,
        id: `${params.documentId}-${chunks.length}`,
        documentId: params.documentId,
        documentName: params.documentName,
        userId: params.userId,
        sessionId: params.sessionId,
        index: chunks.length,
        text: chunkText,
        tokenEstimate,
      });

      if (end === words.length) {
        break;
      }
    }
  }

  return chunks;
}
