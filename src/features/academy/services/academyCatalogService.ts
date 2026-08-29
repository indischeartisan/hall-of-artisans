import type { Tables } from "../../../types/database.types";
import { academyClient, requireAcademyData } from "./academyServiceSupport";
import { withTtlCache } from "../../../lib/ttlCache";

const ACADEMY_CATALOG_CACHE_MS = 5 * 60 * 1000;

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
  return withTtlCache("academy:published-courses", ACADEMY_CATALOG_CACHE_MS, async () => {
    const { data, error } = await academyClient().from("academy_courses")
      .select("*, academy_course_translations(*)").eq("status", "published").order("published_at", { ascending: false }).limit(30);
    return requireAcademyData(data, error);
  });
}

export async function getCourseBySlug(slug: string): Promise<CourseWithTranslations | null> {
  return withTtlCache(`academy:course:${slug}`, ACADEMY_CATALOG_CACHE_MS, async () => {
    const { data, error } = await academyClient().from("academy_courses")
      .select("*, academy_course_translations(*)").eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });
}

export async function getCourseCurriculum(courseId: string, options: { includeDrafts?: boolean } = {}): Promise<ModuleWithCurriculum[]> {
  if (!options.includeDrafts) return withTtlCache(`academy:curriculum:${courseId}`, ACADEMY_CATALOG_CACHE_MS, () => loadCourseCurriculum(courseId, options));
  return loadCourseCurriculum(courseId, options);
}

async function loadCourseCurriculum(courseId: string, options: { includeDrafts?: boolean }): Promise<ModuleWithCurriculum[]> {
  const client = academyClient();
  let modulesQuery = client.from("academy_modules")
    .select("*, academy_module_translations(*)").eq("course_id", courseId).order("position");
  if (!options.includeDrafts) modulesQuery = modulesQuery.eq("status", "published");
  const modulesResult = await modulesQuery;
  const modules = requireAcademyData(modulesResult.data, modulesResult.error);
  if (modules.length === 0) return [];
  let lessonsQuery = client.from("academy_lessons")
    .select("*, academy_lesson_translations(*)").in("module_id", modules.map((module) => module.id)).order("position");
  if (!options.includeDrafts) lessonsQuery = lessonsQuery.eq("status", "published");
  const lessonsResult = await lessonsQuery;
  const lessons = requireAcademyData(lessonsResult.data, lessonsResult.error);
  return modules.map((module) => ({
    ...module,
    academy_lessons: lessons.filter((lesson) => lesson.module_id === module.id)
  }));
}

export async function getLessonBySlug(courseId: string, slug: string, options: { includeDrafts?: boolean } = {}): Promise<LessonReaderRecord | null> {
  const client = academyClient();
  let modulesQuery = client.from("academy_modules").select("id").eq("course_id", courseId);
  if (!options.includeDrafts) modulesQuery = modulesQuery.eq("status", "published");
  const modulesResult = await modulesQuery;
  const modules = requireAcademyData(modulesResult.data, modulesResult.error);
  if (modules.length === 0) return null;
  let lessonQuery = client.from("academy_lessons")
    .select("*, academy_lesson_translations(*), academy_lesson_blocks(*, academy_lesson_block_translations(*))")
    .in("module_id", modules.map((module) => module.id)).eq("slug", slug)
    .order("position", { referencedTable: "academy_lesson_blocks" });
  if (!options.includeDrafts) lessonQuery = lessonQuery.eq("status", "published");
  const { data, error } = await lessonQuery.maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function resolveCourseAccess(slug: string) {
  const { data, error } = await academyClient().rpc("academy_resolve_course_access", { target_course_slug: slug });
  return requireAcademyData(data, error) as "public_preview" | "free_not_enrolled" | "actively_enrolled" | "locked" | "admin";
}
