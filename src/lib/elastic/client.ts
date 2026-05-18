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

export async function searchIndex(index: string, body: unknown) {
  const endpoint = getEndpoint();
  const url = `${endpoint.replace(/\/+$/g, "")}/${encodeURIComponent(index)}/_search`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Elastic search failed: ${res.status} ${res.statusText} ${text}`);
  }

  return res.json();
}
