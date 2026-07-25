import { getSupabaseClient } from "../../lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "../../types/database.types";

export type MaterialCategory = Tables<"material_categories">;
export type CatalogMaterial = Tables<"materials">;
export type MaterialInput = Omit<TablesInsert<"materials">, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">;

export const materialCatalogAdminService = {
  async uploadImage(file: File, materialSlug: string) {
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "webp";
    const safeSlug = materialSlug.replace(/[^a-z0-9-]/g, "-") || "material";
    const path = `${safeSlug}/${crypto.randomUUID()}.${extension}`;
    const bucket = getSupabaseClient().storage.from("material-images");
    const uploaded = await bucket.upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
    if (uploaded.error) throw uploaded.error;
    return { path, publicUrl: bucket.getPublicUrl(path).data.publicUrl };
  },
  async removeImage(path: string) {
    const response = await getSupabaseClient().storage.from("material-images").remove([path]);
    if (response.error) throw response.error;
  },
  async list() {
    const client = getSupabaseClient();
    const [categories, materials] = await Promise.all([
      client.from("material_categories").select("*").order("display_order").order("name"),
      client.from("materials").select("*").order("display_order").order("name"),
    ]);
    if (categories.error || materials.error) throw categories.error ?? materials.error;
    return { categories: categories.data ?? [], materials: materials.data ?? [] };
  },
  async create(input: MaterialInput) {
    const response = await getSupabaseClient().from("materials").insert(input).select().single();
    if (response.error) throw response.error;
    return response.data;
  },
  async update(id: string, input: TablesUpdate<"materials">) {
    const response = await getSupabaseClient().from("materials").update(input).eq("id", id).select().single();
    if (response.error) throw response.error;
    return response.data;
  },
  async archive(id: string) { return this.update(id, { status: "archived" }); },
  async restore(id: string) { return this.update(id, { status: "active" }); },
  async remove(id: string) {
    const response = await getSupabaseClient().from("materials").delete().eq("id", id);
    if (response.error) throw response.error;
  },
};
