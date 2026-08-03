import type { Tables } from "../../../types/database.types";
import { academyClient, requireAcademyData } from "./academyServiceSupport";

export type AcademyCourse = Tables<"academy_courses">;
export type AcademyModule = Tables<"academy_modules">;
export type AcademyLesson = Tables<"academy_lessons">;

export async function getPublishedCourses() {
  const { data, error } = await academyClient()
    .from("academy_courses")
    .select("*, academy_course_translations(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return requireAcademyData(data, error);
}

export async function getCourseBySlug(slug: string) {
  const { data, error } = await academyClient()
    .from("academy_courses")
    .select("*, academy_course_translations(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getCourseCurriculum(courseId: string) {
  const { data, error } = await academyClient()
    .from("academy_modules")
    .select("*, academy_module_translations(*), academy_lessons(*, academy_lesson_translations(*))")
    .eq("course_id", courseId)
    .order("position");
  return requireAcademyData(data, error);
}

export async function getPreviewLesson(slug: string) {
  const { data, error } = await academyClient()
    .from("academy_lessons")
    .select("*, academy_lesson_translations(*), academy_lesson_blocks(*, academy_lesson_block_translations(*))")
    .eq("slug", slug)
    .eq("is_preview", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function resolveCourseAccess(slug: string) {
  const { data, error } = await academyClient().rpc("academy_resolve_course_access", { target_course_slug: slug });
  return requireAcademyData(data, error) as "public_preview" | "free_not_enrolled" | "actively_enrolled" | "locked" | "admin";
}
