import { academyClient, requireAcademyData, requireAcademyUserId } from "./academyServiceSupport";

export async function getMyEnrollment(courseId: string) {
  const userId = await requireAcademyUserId();
  const { data, error } = await academyClient()
    .from("academy_enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function enrollInFreeCourse(courseSlug: string) {
  const { data, error } = await academyClient().rpc("academy_enroll_in_free_course", { target_course_slug: courseSlug });
  const rows = requireAcademyData(data, error);
  if (rows.length !== 1) throw new Error("Free enrollment returned an unexpected result.");
  return rows[0];
}
