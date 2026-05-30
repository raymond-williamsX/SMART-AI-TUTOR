/* Small server-side helper for Elastic Cloud HTTP requests
   - Reads endpoint and API key from environment via src/lib/env.ts
   - Exports `searchIndex` for simple query usage
   - Notes: Elastic Cloud may require an `Authorization: ApiKey <base64>` header
     where the value is the base64 of `<id>:<api_key>` depending on how your
     key was generated. Adjust `authHeader()` if your project stores a different
     shape in the environment.
*/

import { env } from "../env";

function getEndpoint(): string {
  const url = env.ELASTICSEARCH_URL;
  if (!url) throw new Error("Missing ELASTICSEARCH_URL environment variable.");
  return url;
}

function getApiKey(): string {
  // env will contain either ELASTICSEARCH_API_KEY or ELASTIC_SEARCH_API_KEY
  const key = env.ELASTICSEARCH_API_KEY ?? env.ELASTIC_SEARCH_API_KEY;
  if (!key) throw new Error("Missing Elastic API key. Set ELASTICSEARCH_API_KEY in the environment.");
  return key;
}

function authHeader(): string {
  const key = getApiKey();
  // If you store the full ApiKey header value, you can return it raw.
  // Common pattern: store base64(id:api_key) and send `ApiKey ${key}`.
  return `ApiKey ${key}`;
}

async function elasticRequest(path: string, init: RequestInit = {}) {
  const endpoint = getEndpoint();
  const url = `${endpoint.replace(/\/+$/g, "")}/${path.replace(/^\/+/g, "")}`;

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
    throw new Error(`Elastic request failed: ${res.status} ${res.statusText} ${text}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json().catch(() => null);
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
