import { Link } from "react-router";
import { useAcademyLocale } from "../hooks/useAcademyLocale";

export default function AcademyHomePage() {
  const { t } = useAcademyLocale();
  return (
    <main className="academy-page academy-home" aria-labelledby="academy-title">
      <section className="academy-hero-panel">
        <p className="academy-eyebrow">{t("school")}</p>
        <h1 id="academy-title">{t("title")}</h1>
        <p className="academy-lead">{t("homeIntro")}</p>
        <div className="academy-actions">
          <Link className="academy-button academy-button--primary" to="/academy/courses">{t("viewCourses")}</Link>
          <Link className="academy-button" to="/hall">{t("backToHall")}</Link>
        </div>
      </section>
      <section className="academy-preview-grid" aria-label={t("courses")}>
        <article className="academy-card">
          <span>{t("preparationStatus")}</span>
          <h2>{t("introductionCourse")}</h2>
          <p>{t("homeIntro")}</p>
        </article>
        <article className="academy-card academy-card--muted">
          <span>{t("foundationStatus")}</span>
          <h2>{t("foundationCourse")}</h2>
        </article>
      </section>
    </main>
  );
}
