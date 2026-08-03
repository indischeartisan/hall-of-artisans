import { Link, useParams } from "react-router";
import { useAcademyLocale } from "../hooks/useAcademyLocale";
import { formatRouteLabel } from "../utils/formatRouteLabel";

export default function AcademyLessonPage() {
  const { courseSlug, lessonSlug } = useParams();
  const { t } = useAcademyLocale();
  const lessonTitle = formatRouteLabel(lessonSlug, t("lessonReader"));
  return (
    <main className="academy-page academy-lesson-page" aria-labelledby="academy-lesson-title">
      <article className="academy-reader-shell">
        <p className="academy-eyebrow">{t("lessonReader")}</p>
        <h1 id="academy-lesson-title">{lessonTitle}</h1>
        <p>{t("lessonPlaceholder")}</p>
        <Link className="academy-button" to={`/academy/courses/${courseSlug ?? "introduction"}`}>{t("courseDetail")}</Link>
      </article>
    </main>
  );
}
