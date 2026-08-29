export async function onRequestGet(context) {
  if (!context.env.MEDIA_BUCKET) return new Response("Media storage is not configured.", { status: 503 });
  const segments = Array.isArray(context.params.key) ? context.params.key : [context.params.key];
  const key = segments.filter(Boolean).join("/");
  if (!key.startsWith("ambience/") || key.includes("..")) return new Response("Invalid media key.", { status: 400 });
  const object = await context.env.MEDIA_BUCKET.get(key);
  if (!object) return new Response("Not found.", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "private, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
