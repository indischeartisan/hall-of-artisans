import { getSupabaseClient } from "../../lib/supabase";
import type { Json, Tables, TablesInsert, TablesUpdate } from "../../types/database.types";

export type CmsEntry = Tables<"cms_entries">;
export type CmsContentType = "page" | "library_entry" | "archive_record";
export type CmsStatus = "draft" | "published" | "archived";

export interface CmsEntryInput {
  contentType: CmsContentType;
  slug: string;
  locale: string;
  title: string;
  summary: string;
  content: Json;
  seo: Json;
  status: CmsStatus;
}

const payload = (input: CmsEntryInput): TablesInsert<"cms_entries"> => ({
  content_type: input.contentType,
  slug: input.slug.trim().toLowerCase(),
  locale: input.locale.trim(),
  title: input.title.trim(),
  summary: input.summary.trim() || null,
  content: input.content,
  seo: input.seo,
  status: input.status,
  published_at: input.status === "published" ? new Date().toISOString() : null
});

export const cmsService = {
  async list(): Promise<CmsEntry[]> {
    const response = await getSupabaseClient().from("cms_entries").select("id,content_type,slug,locale,title,summary,content,seo,status,published_at,created_at,updated_at,created_by,updated_by").order("updated_at", { ascending: false }).limit(200);
    if (response.error) throw response.error;
    return response.data ?? [];
  },

  async create(input: CmsEntryInput): Promise<CmsEntry> {
    const response = await getSupabaseClient().from("cms_entries").insert(payload(input)).select().single();
    if (response.error) throw response.error;
    return response.data;
  },

  async update(id: string, input: CmsEntryInput): Promise<CmsEntry> {
    const changes: TablesUpdate<"cms_entries"> = payload(input);
    const response = await getSupabaseClient().from("cms_entries").update(changes).eq("id", id).select().single();
    if (response.error) throw response.error;
    return response.data;
  },

  async archive(id: string): Promise<CmsEntry> {
    const response = await getSupabaseClient().from("cms_entries").update({ status: "archived" }).eq("id", id).select().single();
    if (response.error) throw response.error;
    return response.data;
  }
};
