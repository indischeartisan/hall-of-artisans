import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import AcademyRouteFallback from "../components/AcademyRouteFallback";
import { useAcademyLocale } from "../hooks/useAcademyLocale";

export default function MyAcademyPage() {
  const location = useLocation();
  const { user, profile, artisanId, loading } = useAuth();
  const { t } = useAcademyLocale();

  if (loading) return <AcademyRouteFallback />;
  if (!user) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/artisan-login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  const displayName = profile?.display_name?.trim() || user.email?.split("@")[0] || t("unavailableName");
  return (
    <main className="academy-page" aria-labelledby="my-academy-title">
      <section className="academy-reader-shell">
        <p className="academy-eyebrow">{t("welcome")}, {displayName}</p>
        <h1 id="my-academy-title">{t("myAcademy")}</h1>
        {artisanId ? <p className="academy-identity">{t("artisanId")}: <strong>{artisanId.public_id}</strong></p> : null}
        <div className="academy-empty-state">
          <h2>{t("noCourses")}</h2>
          <p>{t("noCoursesHint")}</p>
        </div>
      </section>
    </main>
  );
}
