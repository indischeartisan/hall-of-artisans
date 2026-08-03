import type { TablesInsert, TablesUpdate } from "../../../types/database.types";
import { academyClient, requireAcademyData, requireAcademyUserId } from "./academyServiceSupport";

export async function getMyLessonProgress(lessonId: string) {
  const userId = await requireAcademyUserId();
  const { data, error } = await academyClient()
    .from("academy_lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

type ProgressWrite = Pick<TablesInsert<"academy_lesson_progress">, "lesson_id"> &
  Pick<TablesUpdate<"academy_lesson_progress">, "status" | "last_block_position" | "started_at" | "last_opened_at" | "completed_at">;

export async function upsertMyLessonProgress(progress: ProgressWrite) {
  const userId = await requireAcademyUserId();
  const { data, error } = await academyClient()
    .from("academy_lesson_progress")
    .upsert({ ...progress, user_id: userId }, { onConflict: "user_id,lesson_id" })
    .select()
    .single();
  return requireAcademyData(data, error);
}
