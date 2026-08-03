import type { Tables } from "../../../types/database.types";
import { academyClient, requireAcademyData } from "./academyServiceSupport";

export type AcademyCourse = Tables<"academy_courses">;
export type AcademyCourseTranslation = Tables<"academy_course_translations">;
export type AcademyModule = Tables<"academy_modules">;
export type AcademyModuleTranslation = Tables<"academy_module_translations">;
export type AcademyLesson = Tables<"academy_lessons">;
export type AcademyLessonTranslation = Tables<"academy_lesson_translations">;
export type AcademyLessonBlock = Tables<"academy_lesson_blocks">;
export type AcademyLessonBlockTranslation = Tables<"academy_lesson_block_translations">;

export type CourseWithTranslations = AcademyCourse & { academy_course_translations: AcademyCourseTranslation[] };
export type LessonWithTranslations = AcademyLesson & { academy_lesson_translations: AcademyLessonTranslation[] };
export type ModuleWithCurriculum = AcademyModule & {
  academy_module_translations: AcademyModuleTranslation[];
  academy_lessons: LessonWithTranslations[];
};
export type LessonReaderRecord = LessonWithTranslations & {
  academy_lesson_blocks: Array<AcademyLessonBlock & { academy_lesson_block_translations: AcademyLessonBlockTranslation[] }>;
};

export async function getPublishedCourses(): Promise<CourseWithTranslations[]> {
  const { data, error } = await academyClient().from("academy_courses")
    .select("*, academy_course_translations(*)").eq("status", "published").order("published_at", { ascending: false });
  return requireAcademyData(data, error);
}

export async function getCourseBySlug(slug: string): Promise<CourseWithTranslations | null> {
  const { data, error } = await academyClient().from("academy_courses")
    .select("*, academy_course_translations(*)").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getCourseCurriculum(courseId: string): Promise<ModuleWithCurriculum[]> {
  const client = academyClient();
  const modulesResult = await client.from("academy_modules")
    .select("*, academy_module_translations(*)").eq("course_id", courseId).eq("status", "published").order("position");
  const modules = requireAcademyData(modulesResult.data, modulesResult.error);
  if (modules.length === 0) return [];
  const lessonsResult = await client.from("academy_lessons")
    .select("*, academy_lesson_translations(*)").in("module_id", modules.map((module) => module.id)).eq("status", "published").order("position");
  const lessons = requireAcademyData(lessonsResult.data, lessonsResult.error);
  return modules.map((module) => ({
    ...module,
    academy_lessons: lessons.filter((lesson) => lesson.module_id === module.id)
  }));
}

export async function getLessonBySlug(slug: string): Promise<LessonReaderRecord | null> {
  const { data, error } = await academyClient().from("academy_lessons")
    .select("*, academy_lesson_translations(*), academy_lesson_blocks(*, academy_lesson_block_translations(*))")
    .eq("slug", slug).order("position", { referencedTable: "academy_lesson_blocks" }).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function resolveCourseAccess(slug: string) {
  const { data, error } = await academyClient().rpc("academy_resolve_course_access", { target_course_slug: slug });
  return requireAcademyData(data, error) as "public_preview" | "free_not_enrolled" | "actively_enrolled" | "locked" | "admin";
}
