import { getSupabaseClient } from "../../lib/supabase";
import type { Tables } from "../../types/database.types";
import { archiveRecords as developmentRecords, type ArchiveRecord } from "../../data/archiveRecords";

export type ArchiveCatalogRow = Tables<"archive_records">;
type PublicArchiveCatalogRow = Pick<ArchiveCatalogRow, "id" | "archive_number" | "title" | "creator" | "moods" | "story" | "image_path" | "image_alt" | "owner_id" | "status" | "display_order">;

export const toArchiveRecord = (row: PublicArchiveCatalogRow): ArchiveRecord => ({
  id: row.id,
  archiveNumber: row.archive_number,
  title: row.title,
  creator: row.creator,
  mood: row.moods,
  story: row.story,
  image: row.image_path || "/assets/archive/golden-silence.png",
  imageAlt: row.image_alt || `${row.title} perfume bottle`,
  ownerId: row.owner_id,
  status: "Archived",
});

export const archiveCatalogService = {
  async listPublic() {
    try {
      const response = await getSupabaseClient().from("archive_records").select("id,archive_number,title,creator,moods,story,image_path,image_alt,owner_id,status,display_order").eq("status", "active").order("display_order").order("archive_number").limit(100);
      if (response.error) throw response.error;
      return (response.data ?? []).map(toArchiveRecord);
    } catch (error) {
      if (import.meta.env.DEV) return developmentRecords;
      throw error;
    }
  },
};
