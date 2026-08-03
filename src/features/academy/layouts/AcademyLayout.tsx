import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import GlobalHeader from "../../../components/GlobalHeader";
import { useAcademyLocale } from "../hooks/useAcademyLocale";
import "../styles/academy-tokens.css";

export default function AcademyLayout() {
  const location = useLocation();
  const { t } = useAcademyLocale();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="academy-shell">
      <GlobalHeader activeLabel="The Academy" variant="light" />
      <nav className="academy-subnav" aria-label={t("navigation")}>
        <NavLink end to="/academy">{t("title")}</NavLink>
        <NavLink to="/academy/courses">{t("courses")}</NavLink>
        <NavLink to="/my-academy">{t("myAcademy")}</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
