import { getSupabaseClient } from "../../lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "../../types/database.types";

export type CatalogArchiveRecord = Tables<"archive_records">;
export type CatalogArchiveSummary = Pick<CatalogArchiveRecord, "id" | "archive_number" | "created_at" | "creator" | "display_order" | "image_alt" | "image_path" | "is_featured" | "moods" | "owner_id" | "slug" | "status" | "title" | "updated_at">;
export type ArchiveRecordInput = Omit<TablesInsert<"archive_records">, "id" | "created_at" | "updated_at">;

export const archiveCatalogAdminService = {
  async uploadImage(file: File, slug: string) {
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "webp";
    const safeSlug = slug.replace(/[^a-z0-9-]/g, "-") || "archive-record";
    const path = `${safeSlug}/${crypto.randomUUID()}.${extension}`;
    const bucket = getSupabaseClient().storage.from("archive-images");
    const uploaded = await bucket.upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    if (uploaded.error) throw uploaded.error;
    return bucket.getPublicUrl(path).data.publicUrl;
  },
  async list() {
    const response = await getSupabaseClient().from("archive_records").select("id,archive_number,created_at,creator,display_order,image_alt,image_path,is_featured,moods,owner_id,slug,status,title,updated_at").order("display_order").order("archive_number").limit(100);
    if (response.error) throw response.error;
    return response.data ?? [];
  },
  async get(id: string) {
    const response = await getSupabaseClient().from("archive_records").select("id,archive_number,created_at,creator,display_order,image_alt,image_path,is_featured,moods,owner_id,slug,status,story,title,updated_at").eq("id", id).maybeSingle();
    if (response.error) throw response.error;
    return response.data;
  },
  async create(input: ArchiveRecordInput) {
    const response = await getSupabaseClient().from("archive_records").insert(input).select("id,archive_number,created_at,creator,display_order,image_alt,image_path,is_featured,moods,owner_id,slug,status,story,title,updated_at").single();
    if (response.error) throw response.error;
    return response.data;
  },
  async update(id: string, input: TablesUpdate<"archive_records">) {
    const response = await getSupabaseClient().from("archive_records").update({ ...input, updated_at: new Date().toISOString() }).eq("id", id).select("id,archive_number,created_at,creator,display_order,image_alt,image_path,is_featured,moods,owner_id,slug,status,story,title,updated_at").single();
    if (response.error) throw response.error;
    return response.data;
  },
  async archive(id: string) { return this.update(id, { status: "archived" }); },
  async restore(id: string) { return this.update(id, { status: "active" }); },
  async remove(id: string) {
    const response = await getSupabaseClient().from("archive_records").delete().eq("id", id);
    if (response.error) throw response.error;
  },
};
