import type { Tables } from "../../../types/database.types";
import { academyClient, requireAcademyData, requireAcademyUserId } from "./academyServiceSupport";
import type { CourseWithTranslations } from "./academyCatalogService";

export type EnrollmentWithCourse = Tables<"academy_enrollments"> & { academy_courses: CourseWithTranslations };

export async function getMyEnrollment(courseId: string, knownUserId?: string) {
  const userId = knownUserId ?? await requireAcademyUserId();
  const { data, error } = await academyClient().from("academy_enrollments")
    .select("*").eq("user_id", userId).eq("course_id", courseId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMyActiveEnrollments(userId: string): Promise<EnrollmentWithCourse[]> {
  const { data, error } = await academyClient().from("academy_enrollments")
    .select("*, academy_courses(*, academy_course_translations(*))")
    .eq("user_id", userId).eq("status", "active").order("enrolled_at", { ascending: false }).limit(30);
  return requireAcademyData(data, error);
}

export async function enrollInFreeCourse(courseSlug: string) {
  const { data, error } = await academyClient().rpc("academy_enroll_in_free_course", { target_course_slug: courseSlug });
  const rows = requireAcademyData(data, error);
  if (rows.length !== 1) throw new Error("Free enrollment returned an unexpected result.");
  return rows[0];
}
