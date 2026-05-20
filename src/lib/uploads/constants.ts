export const UPLOADED_MATERIALS_BUCKET = "uploaded-materials";
export const DEFAULT_UPLOAD_SESSION_TITLE = "Uploaded materials";

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
] as const;

export function isAllowedUploadMimeType(mimeType: string) {
  return ALLOWED_UPLOAD_MIME_TYPES.includes(mimeType as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number]);
}

export function buildUploadPath(userId: string, sessionId: string, fileName: string) {
  const safeName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${userId}/${sessionId}/${Date.now()}-${crypto.randomUUID()}-${safeName || "file"}`;
}
