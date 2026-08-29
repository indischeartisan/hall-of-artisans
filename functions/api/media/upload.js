const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);
const MAX_BYTES = 2 * 1024 * 1024;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

async function authenticatedUser(request, env) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return null;
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const publishableKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) return null;
  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    headers: { authorization, apikey: publishableKey }
  });
  if (!response.ok) return null;
  const user = await response.json();
  return typeof user?.id === "string" ? user : null;
}

export async function onRequestPost(context) {
  if (!context.env.MEDIA_BUCKET) return json({ error: "Media storage is not configured." }, 503);
  const user = await authenticatedUser(context.request, context.env);
  if (!user) return json({ error: "Authentication is required." }, 401);
  const contentType = (context.request.headers.get("content-type") ?? "").split(";", 1)[0].toLowerCase();
  const extension = ALLOWED_TYPES.get(contentType);
  if (!extension) return json({ error: "Only JPG, PNG, and WebP images are accepted." }, 415);
  const declaredSize = Number(context.request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_BYTES) return json({ error: "Image must be 2 MB or smaller." }, 413);
  const bytes = await context.request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) return json({ error: "Image must be between 1 byte and 2 MB." }, 413);
  const key = `ambience/${user.id}/${crypto.randomUUID()}.${extension}`;
  await context.env.MEDIA_BUCKET.put(key, bytes, {
    httpMetadata: { contentType, cacheControl: "private, max-age=31536000, immutable" },
    customMetadata: { ownerId: user.id, uploadedAt: new Date().toISOString() }
  });
  return json({ key, url: `/api/media/${key}` }, 201);
}
