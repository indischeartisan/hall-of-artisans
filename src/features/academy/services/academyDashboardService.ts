import { getCourseCurriculum } from "./academyCatalogService";
import { getMyActiveEnrollments } from "./academyEnrollmentService";
import { getMyProgress } from "./academyProgressService";

export async function getMyAcademySnapshot(userId: string) {
  const [enrollments, progress] = await Promise.all([getMyActiveEnrollments(userId), getMyProgress(userId)]);
  const curricula = await Promise.all(enrollments.map(async (enrollment) => ({
    courseId: enrollment.course_id,
    modules: await getCourseCurriculum(enrollment.course_id)
  })));
  return { enrollments, progress, curricula };
}
