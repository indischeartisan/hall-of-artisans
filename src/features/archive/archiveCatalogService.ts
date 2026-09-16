import { getSupabaseClient } from "../../lib/supabase";
import type { Tables } from "../../types/database.types";
import { archiveRecords as developmentRecords, type ArchiveRecord } from "../../data/archiveRecords";

export type ArchiveCatalogRow = Tables<"archive_records">;
type PublicArchiveCardRow = Pick<ArchiveCatalogRow, "id" | "archive_number" | "title" | "creator" | "moods" | "image_path" | "image_alt" | "owner_id" | "status" | "display_order">;
type PublicArchiveDetailRow = PublicArchiveCardRow & Pick<ArchiveCatalogRow, "story">;

export type ArchiveCatalogCard = Omit<ArchiveRecord, "story">;

const toArchiveCard = (row: PublicArchiveCardRow): ArchiveCatalogCard => ({
  id: row.id,
  archiveNumber: row.archive_number,
  title: row.title,
  creator: row.creator,
  mood: row.moods,
  image: row.image_path || "/assets/archive/golden-silence.png",
  imageAlt: row.image_alt || `${row.title} perfume bottle`,
  ownerId: row.owner_id,
  status: "Archived",
});

const toArchiveRecord = (row: PublicArchiveDetailRow): ArchiveRecord => ({ ...toArchiveCard(row), story: row.story });

export const archiveCatalogService = {
  async listPublic() {
    try {
      const response = await getSupabaseClient().from("archive_records").select("id,archive_number,title,creator,moods,image_path,image_alt,owner_id,status,display_order").eq("status", "active").order("display_order").order("archive_number").limit(100);
      if (response.error) throw response.error;
      return (response.data ?? []).map(toArchiveCard);
    } catch (error) {
      if (import.meta.env.DEV) return developmentRecords.map(({ story: _story, ...record }) => record);
      throw error;
    }
  },
  async getPublicDetail(id: string): Promise<ArchiveRecord | null> {
    try {
      const response = await getSupabaseClient().from("archive_records")
        .select("id,archive_number,title,creator,moods,story,image_path,image_alt,owner_id,status,display_order")
        .eq("id", id).eq("status", "active").maybeSingle();
      if (response.error) throw response.error;
      return response.data ? toArchiveRecord(response.data) : null;
    } catch (error) {
      if (import.meta.env.DEV) return developmentRecords.find((record) => record.id === id) ?? null;
      throw error;
    }
  },
};
