import { Link } from "react-router";
import { useAcademyLocale } from "../hooks/useAcademyLocale";

export default function AcademyCoursesPage() {
  const { t } = useAcademyLocale();
  return (
    <main className="academy-page" aria-labelledby="academy-courses-title">
      <header className="academy-page-heading">
        <p className="academy-eyebrow">{t("title")}</p>
        <h1 id="academy-courses-title">{t("courses")}</h1>
      </header>
      <section className="academy-course-list">
        <article className="academy-card">
          <span>{t("preparationStatus")}</span>
          <h2>{t("introductionCourse")}</h2>
          <Link to="/academy/courses/introduction-to-the-world-of-perfumery">{t("courseDetail")}</Link>
        </article>
        <article className="academy-card academy-card--muted">
          <span>{t("foundationStatus")}</span>
          <h2>{t("foundationCourse")}</h2>
        </article>
      </section>
    </main>
  );
}
