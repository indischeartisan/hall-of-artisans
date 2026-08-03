import { Link } from "react-router";
import { useAcademyLocale } from "../hooks/useAcademyLocale";

export default function AcademyNotFoundPage() {
  const { t } = useAcademyLocale();
  return (
    <main className="academy-page" aria-labelledby="academy-not-found-title">
      <section className="academy-reader-shell">
        <h1 id="academy-not-found-title">{t("notFound")}</h1>
        <Link className="academy-button" to="/academy">{t("title")}</Link>
      </section>
    </main>
  );
}
