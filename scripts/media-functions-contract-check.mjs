import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/media/upload.js";
import { onRequestGet } from "../functions/api/media/[[key]].js";

const stored = new Map();
const bucket = {
  async put(key, bytes, options) { stored.set(key, { bytes, options }); },
  async get(key) {
    const entry = stored.get(key);
    if (!entry) return null;
    return {
      body: entry.bytes,
      httpEtag: '"test-etag"',
      writeHttpMetadata(headers) { headers.set("content-type", entry.options.httpMetadata.contentType); }
    };
  }
};
const env = { MEDIA_BUCKET: bucket, VITE_SUPABASE_URL: "https://example.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "public-test-key" };
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => Response.json({ id: "user-123" });

try {
  const unauthorized = await onRequestPost({ request: new Request("https://example.com/api/media/upload", { method: "POST", body: new Uint8Array([1]), headers: { "content-type": "image/jpeg" } }), env });
  assert.equal(unauthorized.status, 401);

  const uploaded = await onRequestPost({ request: new Request("https://example.com/api/media/upload", { method: "POST", body: new Uint8Array([1, 2, 3]), headers: { authorization: "Bearer token", "content-type": "image/jpeg" } }), env });
  assert.equal(uploaded.status, 201);
  const payload = await uploaded.json();
  assert.match(payload.key, /^ambience\/user-123\/[0-9a-f-]+\.jpg$/);

  const downloaded = await onRequestGet({ params: { key: payload.key.split("/") }, env });
  assert.equal(downloaded.status, 200);
  assert.equal(downloaded.headers.get("x-content-type-options"), "nosniff");

  const traversal = await onRequestGet({ params: { key: ["ambience", "..", "secret"] }, env });
  assert.equal(traversal.status, 400);
  console.log("Media Functions contract passed.");
} finally {
  globalThis.fetch = originalFetch;
}
