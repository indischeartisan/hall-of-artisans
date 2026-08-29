import { getSupabaseClient } from "./supabase";

export const isR2MediaEnabled = import.meta.env.VITE_R2_MEDIA_ENABLED === "true";

export async function uploadAmbienceImage(file: File): Promise<{ url: string; fileName: string }> {
  const session = await getSupabaseClient().auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error("Please sign in before uploading an ambience image.");
  const response = await fetch("/api/media/upload", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": file.type },
    body: file
  });
  const payload = await response.json().catch(() => ({})) as { url?: string; error?: string };
  if (!response.ok || !payload.url) throw new Error(payload.error || "The ambience image could not be uploaded.");
  return { url: payload.url, fileName: file.name };
}
