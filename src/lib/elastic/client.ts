/* Small server-side helper for Elastic Cloud HTTP requests
   - Reads endpoint and API key from environment via src/lib/env.ts
   - Exports `searchIndex` for simple query usage
   - Notes: Elastic Cloud may require an `Authorization: ApiKey <base64>` header
     where the value is the base64 of `<id>:<api_key>` depending on how your
     key was generated. Adjust `authHeader()` if your project stores a different
     shape in the environment.
*/

import { env } from "../env";

// In-memory persistent mock store for ElasticSearch indices in Next.js development context.
const globalMock = global as any;
if (!globalMock._mockElasticIndices) {
  globalMock._mockElasticIndices = {};
}
const mockIndices = globalMock._mockElasticIndices;

let useMock = false;

function getEndpoint(): string {
  return env.ELASTICSEARCH_URL || "";
}

function getApiKey(): string {
  return env.ELASTICSEARCH_API_KEY ?? env.ELASTIC_SEARCH_API_KEY ?? "";
}

function authHeader(): string {
  const key = getApiKey();
  return `ApiKey ${key}`;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

function mockElasticRequest(path: string, init: RequestInit = {}): any {
  const method = init.method?.toUpperCase() || "GET";
  const decodedPath = decodeURIComponent(path);
  const parts = decodedPath.split("/");
  const index = parts[0];
  const nextPart = parts[1];

  if (method === "HEAD") {
    if (mockIndices[index]) {
      return { status: 200 };
    }
    throw new Error("Index not found");
  }

  if (method === "PUT") {
    if (!mockIndices[index]) {
      mockIndices[index] = {};
    }
    if (nextPart === "_doc" && parts[2]) {
      const docId = parts[2];
      const body = JSON.parse(init.body as string);
      mockIndices[index][docId] = body;
      return { result: "created", _id: docId };
    }
    return { acknowledged: true };
  }

  if (method === "POST") {
    if (decodedPath.includes("_delete_by_query")) {
      const docs = mockIndices[index];
      if (docs) {
        const body = JSON.parse(init.body as string);
        const filterList = body?.query?.bool?.filter || [];
        const documentId = filterList.find((f: any) => f.term && f.term.document_id)?.term?.document_id;
        const userId = filterList.find((f: any) => f.term && f.term.user_id)?.term?.user_id;
        for (const [id, doc] of Object.entries(docs)) {
          const d = doc as any;
          const matchDocId = !documentId || d.document_id === documentId;
          const matchUserId = !userId || d.user_id === userId;
          if (matchDocId && matchUserId) {
            delete docs[id];
          }
        }
      }
      return { deleted: 1 };
    }

    if (decodedPath.includes("_refresh")) {
      return { _shards: { total: 1, successful: 1, failed: 0 } };
    }

    if (decodedPath.includes("_search")) {
      const body = JSON.parse(init.body as string);
      const docs = mockIndices[index] || {};
      let hits = Object.values(docs);

      const knn = body?.knn;
      if (knn) {
        const filters = knn.filter || [];
        for (const filter of filters) {
          if (filter.term) {
            const [key, val] = Object.entries(filter.term)[0];
            hits = hits.filter((h: any) => h[key] === val);
          }
        }

        const queryVector = knn.query_vector;
        const scoredHits = hits.map((doc: any) => {
          const score = queryVector && doc.embedding ? cosineSimilarity(queryVector, doc.embedding) : 1.0;
          return {
            _source: doc,
            _score: score,
          };
        });

        scoredHits.sort((a, b) => b._score - a._score);
        const limit = knn.k || 5;
        return {
          hits: {
            hits: scoredHits.slice(0, limit),
          },
        };
      }

      return {
        hits: {
          hits: hits.map((doc) => ({ _source: doc, _score: 1.0 })),
        },
      };
    }

    if (path === "_bulk") {
      const bodyStr = init.body as string;
      const lines = bodyStr.split("\n").filter(Boolean);
      for (let i = 0; i < lines.length; i += 2) {
        try {
          const action = JSON.parse(lines[i]);
          const doc = JSON.parse(lines[i + 1]);
          const bulkIndex = action.index?._index;
          if (bulkIndex) {
            if (!mockIndices[bulkIndex]) {
              mockIndices[bulkIndex] = {};
            }
            const docId = doc.id || doc.chunk_id || (Date.now().toString() + Math.random().toString());
            mockIndices[bulkIndex][docId] = doc;
          }
        } catch {}
      }
      return { errors: false, items: [] };
    }
  }

  return null;
}

async function elasticRequest(path: string, init: RequestInit = {}) {
  const endpoint = getEndpoint();
  const apiKey = getApiKey();

  if (!endpoint || !apiKey) {
    if (!useMock) {
      console.warn("[Elastic Client] Missing Elastic credentials in environment. Falling back to in-memory mock store.");
      useMock = true;
    }
  }

  if (useMock) {
    console.log(`[Elastic Client] [Mock] Executing ${init.method || "GET"} request on "${path}"`);
    return mockElasticRequest(path, init);
  }

  try {
    const url = `${endpoint.replace(/\/+$/g, "")}/${path.replace(/^\/+/g, "")}`;
    console.log(`[Elastic Client] [Cloud] Sending ${init.method || "GET"} to: ${url}`);

    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(),
        ...(init.headers ?? {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[Elastic Client] Cloud request failed: status=${res.status} ${res.statusText}`, text);
      throw new Error(`Elastic request failed: ${res.status} ${res.statusText} ${text}`);
    }

    if (res.status === 204) {
      console.log(`[Elastic Client] Cloud response: 204 No Content`);
      return null;
    }

    const json = await res.json().catch(() => null);
    console.log(`[Elastic Client] Cloud response: success`);
    return json;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes("fetch failed") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("EADDRREFUSED") ||
      msg.includes("connection reset")
    ) {
      console.warn(`[Elastic Client] Connection to ElasticSearch failed (${msg}). Falling back to in-memory mock store.`);
      useMock = true;
      return mockElasticRequest(path, init);
    }
    console.error(`[Elastic Client] Elastic request encountered exception:`, error);
    throw error;
  }
}

export async function searchIndex(index: string, body: unknown) {
  return elasticRequest(`${encodeURIComponent(index)}/_search`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createIndexIfMissing(index: string, body: unknown) {
  const encodedIndex = encodeURIComponent(index);

  try {
    await elasticRequest(encodedIndex, { method: "HEAD" });
    return;
  } catch {
    await elasticRequest(encodedIndex, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
}

export async function indexDocument(index: string, id: string, body: unknown) {
  return elasticRequest(`${encodeURIComponent(index)}/_doc/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteByQuery(index: string, body: unknown) {
  return elasticRequest(`${encodeURIComponent(index)}/_delete_by_query?conflicts=proceed&refresh=true`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function refreshIndex(index: string) {
  return elasticRequest(`${encodeURIComponent(index)}/_refresh`, {
    method: "POST",
  });
}

export async function indexDocumentChunks(
  index: string,
  chunks: Array<{ text: string; embedding: number[]; sessionId: string }>
) {
  let body = "";
  for (const chunk of chunks) {
    body += JSON.stringify({ index: { _index: index } }) + "\n";
    body += JSON.stringify(chunk) + "\n";
  }

  const endpoint = getEndpoint();
  const apiKey = getApiKey();

  if (useMock || !endpoint || !apiKey) {
    useMock = true;
    return mockElasticRequest("_bulk", { method: "POST", body });
  }

  try {
    const url = `${endpoint.replace(/\/+$/g, "")}/_bulk`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-ndjson",
        Authorization: authHeader(),
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Elastic bulk index failed: ${res.status} ${res.statusText} ${text}`);
    }

    return res.json();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes("fetch failed") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("EADDRREFUSED") ||
      msg.includes("connection reset")
    ) {
      console.warn(`[Elastic Client] Connection to ElasticSearch failed (${msg}). Falling back to in-memory mock store.`);
      useMock = true;
      return mockElasticRequest("_bulk", { method: "POST", body });
    }
    throw error;
  }
}

export async function searchSimilarChunks(index: string, sessionId: string, embedding: number[], limit = 3) {
  const query = {
    knn: {
      field: "embedding",
      query_vector: embedding,
      k: limit,
      num_candidates: 50,
      filter: {
        term: {
          "sessionId.keyword": sessionId
        }
      }
    },
    _source: ["text"]
  };

  const res = await searchIndex(index, query);
  return res.hits?.hits?.map((hit: any) => hit._source.text) || [];
}
