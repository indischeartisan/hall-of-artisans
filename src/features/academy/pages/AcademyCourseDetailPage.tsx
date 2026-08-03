import { Link, useParams } from "react-router";
import { useAcademyLocale } from "../hooks/useAcademyLocale";
import { formatRouteLabel } from "../utils/formatRouteLabel";

export default function AcademyCourseDetailPage() {
  const { courseSlug } = useParams();
  const { t } = useAcademyLocale();
  const title = formatRouteLabel(courseSlug, t("introductionCourse"));
  return (
    <main className="academy-page" aria-labelledby="academy-course-title">
      <article className="academy-reader-shell">
        <p className="academy-eyebrow">{t("courseDetail")}</p>
        <h1 id="academy-course-title">{title}</h1>
        <p>{t("coursePlaceholder")}</p>
        <Link className="academy-button" to="/academy/courses">{t("courses")}</Link>
      </article>
    </main>
  );
}
