import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { getCourseCurriculum, getPublishedCourses, resolveCourseAccess, type CourseWithTranslations } from "../services/academyCatalogService";
import { enrollInFreeCourse } from "../services/academyEnrollmentService";
import { useAcademyLocale } from "../hooks/useAcademyLocale";
import { resolveAcademyTranslation } from "../utils/resolveAcademyTranslation";
import { futureCourses } from "../data/futureCourses";

type LandingCourse = CourseWithTranslations & { lessonCount: number };

export default function AcademyHomePage() {
  const { user } = useAuth();
  const { locale, t } = useAcademyLocale();
  const navigate = useNavigate();
  const [course, setCourse] = useState<LandingCourse | null>(null);
  const [access, setAccess] = useState<Awaited<ReturnType<typeof resolveCourseAccess>>>("locked");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const courseRailRef = useRef<HTMLDivElement>(null);
  const courseDragRef = useRef({ active: false, pointerId: 0, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      try {
        const published = await getPublishedCourses();
        const first = published[0];
        if (!first) return;
        const [curriculum, resolvedAccess] = await Promise.all([
          getCourseCurriculum(first.id),
          resolveCourseAccess(first.slug)
        ]);
        if (active) {
          setCourse({ ...first, lessonCount: curriculum.reduce((total, module) => total + module.academy_lessons.length, 0) });
          setAccess(resolvedAccess);
        }
      } catch {
        // Keep the public landing usable while the Academy migrations are not yet applied remotely.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  const translation = course ? resolveAcademyTranslation(course.academy_course_translations, locale) : null;
  const coursePath = course ? `/academy/courses/${course.slug}` : "/academy/courses";
  const primaryPath = !user && course ? `/artisan-login?returnTo=${encodeURIComponent(coursePath)}` : access === "actively_enrolled" && course ? `/my-academy/courses/${course.slug}` : coursePath;
  const ctaLabel = !user ? t("freeCourseStart") : access === "actively_enrolled" ? t("freeCourseContinue") : t("freeCourseEnroll");
  const duration = course ? `${course.estimated_minutes} ${t("minutes")}` : "—";

  const enroll = async () => {
    if (!course || enrolling) return;
    setEnrolling(true);
    setError("");
    try {
      await enrollInFreeCourse(course.slug);
      setAccess("actively_enrolled");
      navigate(`/my-academy/courses/${course.slug}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("courseUnavailable"));
    } finally {
      setEnrolling(false);
    }
  };

  const scrollCoursesWithWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!courseRailRef.current || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    courseRailRef.current.scrollLeft += event.deltaY;
  };

  const startCourseDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!courseRailRef.current) return;
    courseDragRef.current = { active: true, pointerId: event.pointerId, startX: event.clientX, scrollLeft: courseRailRef.current.scrollLeft };
    courseRailRef.current.setPointerCapture(event.pointerId);
    courseRailRef.current.classList.add("is-dragging");
  };

  const moveCourseDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!courseRailRef.current || !courseDragRef.current.active || courseDragRef.current.pointerId !== event.pointerId) return;
    courseRailRef.current.scrollLeft = courseDragRef.current.scrollLeft - (event.clientX - courseDragRef.current.startX);
  };

  const stopCourseDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!courseRailRef.current || courseDragRef.current.pointerId !== event.pointerId) return;
    courseDragRef.current.active = false;
    courseRailRef.current.classList.remove("is-dragging");
    if (courseRailRef.current.hasPointerCapture(event.pointerId)) courseRailRef.current.releasePointerCapture(event.pointerId);
  };

  return <main className="academy-landing" aria-labelledby="academy-title">
    <section className="academy-landing-hero">
      <div className="academy-landing-hero__copy">
        <p className="academy-landing-eyebrow">{t("heroEyebrow")}</p>
        <h1 id="academy-title" aria-label={`${t("heroTitleLineOne")} ${t("heroTitleLineTwo")}`}><span>{t("heroTitleLineOne")}</span><em>{t("heroTitleLineTwo")}</em></h1>
        <span className="academy-ornament" aria-hidden="true" />
        <p className="academy-landing-subtitle">{t("heroSubtitle")}</p>
        <div className="academy-landing-actions">
          <Link className="inner-panel academy-landing-button academy-landing-button--primary" to={primaryPath}>{t("heroPrimaryCta")}</Link>
          <a className="inner-panel academy-landing-button academy-landing-button--secondary" href="#academy-courses">{t("heroSecondaryCta")}</a>
        </div>
      </div>
      <picture className="academy-landing-hero__visual">
        <img src="/assets/academy/images/academy-conservatory-hero-v1.png" alt={t("heroImageAlt")} fetchPriority="high" />
      </picture>
    </section>

    <section className="academy-landing-courses" id="academy-courses" aria-labelledby="academy-courses-title">
      <header>
        <p className="academy-landing-eyebrow">{t("coursesEyebrow")}</p>
        <h2 id="academy-courses-title">{t("coursesTitle")}</h2>
        <span className="academy-ornament" aria-hidden="true" />
        <p className="academy-landing-courses__intro">{t("coursesIntro")}</p>
        <Link className="academy-landing-courses__link" to="/academy/courses">{t("viewAllCourses")} <span aria-hidden="true">→</span></Link>
      </header>
      {error ? <p className="academy-error" role="alert">{error}</p> : null}
      <article className="inner-panel academy-landing-course-card academy-landing-course-card--active academy-landing-course-card--mobile-feature">
        <img src="/assets/academy/images/academy-course-introduction-v1.png" alt="" loading="lazy" />
        <div className="academy-landing-course-card__body">
          <span className="academy-course-badge">{t("freeCourseBadge")}</span>
          <h3>{translation?.title ?? t("introductionCourse")}</h3>
          <span className="academy-card-rule" aria-hidden="true" />
          <p>{translation?.short_description ?? t("freeCourseDescription")}</p>
          <dl><div><dt>{t("lessons")}</dt><dd>{loading ? "—" : course?.lessonCount ?? 0}</dd></div><div><dt>{t("duration")}</dt><dd>{duration}</dd></div><div><dt>{t("level")}</dt><dd>{course?.level ?? "—"}</dd></div></dl>
          {!user || access === "actively_enrolled" || access === "admin" ? <Link className="inner-panel academy-landing-button academy-landing-button--primary" to={access === "admin" ? coursePath : primaryPath}>{access === "admin" ? t("viewCourse") : ctaLabel}</Link> : <button className="inner-panel academy-landing-button academy-landing-button--primary" disabled={enrolling || !course} onClick={() => void enroll()}>{enrolling ? t("enrolling") : ctaLabel}</button>}
        </div>
      </article>
      <div className="academy-mobile-future-heading">
        <div><p className="academy-landing-eyebrow">Future Studies</p><p>New paths in story, history, materials, branding, and creative practice.</p></div>
        <span>01 / 05</span>
      </div>
      <div className="academy-landing-course-grid" ref={courseRailRef} onWheel={scrollCoursesWithWheel} onPointerDown={startCourseDrag} onPointerMove={moveCourseDrag} onPointerUp={stopCourseDrag} onPointerCancel={stopCourseDrag} tabIndex={0} aria-label="Academy course carousel">
        <article className="inner-panel academy-landing-course-card academy-landing-course-card--active">
          <img src="/assets/academy/images/academy-course-introduction-v1.png" alt="" loading="lazy" />
          <div className="academy-landing-course-card__body">
            <span className="academy-course-badge">{t("freeCourseBadge")}</span>
            <h3>{translation?.title ?? t("introductionCourse")}</h3>
            <span className="academy-card-rule" aria-hidden="true" />
            <p>{translation?.short_description ?? t("freeCourseDescription")}</p>
            <dl><div><dt>{t("lessons")}</dt><dd>{loading ? "—" : course?.lessonCount ?? 0}</dd></div><div><dt>{t("duration")}</dt><dd>{duration}</dd></div><div><dt>{t("level")}</dt><dd>{course?.level ?? "—"}</dd></div></dl>
            {!user || access === "actively_enrolled" || access === "admin" ? <Link className="inner-panel academy-landing-button academy-landing-button--primary" to={access === "admin" ? coursePath : primaryPath}>{access === "admin" ? t("viewCourse") : ctaLabel}</Link> : <button className="inner-panel academy-landing-button academy-landing-button--primary" disabled={enrolling || !course} onClick={() => void enroll()}>{enrolling ? t("enrolling") : ctaLabel}</button>}
          </div>
        </article>
        <article className="inner-panel academy-landing-course-card academy-landing-course-card--coming">
          <img src="/assets/academy/images/academy-course-foundations-v1.png" alt="" loading="lazy" />
          <div className="academy-landing-course-card__body">
            <span className="academy-course-badge">{t("paidCourseBadge")}</span>
            <h3>{t("paidCourseTitle")}</h3>
            <span className="academy-card-rule" aria-hidden="true" />
            <p>{t("paidCourseDescription")}</p>
            <button className="inner-panel academy-landing-button academy-landing-button--disabled" type="button" disabled>{t("paidCourseComingSoon")}</button>
          </div>
        </article>
        {futureCourses.slice(0,4).map((future) => <article className="inner-panel academy-landing-course-card academy-landing-course-card--future" key={future.title}>
          <img src={future.image} alt="" loading="lazy" />
          <div className="academy-landing-course-card__body">
            <span className="academy-course-badge">{t("paidCourseBadge")}</span>
            <h3>{future.title}</h3>
            <span className="academy-card-rule" aria-hidden="true" />
            <p>{future.description}</p>
            <dl><div><dt>{t("level")}</dt><dd>{future.level}</dd></div></dl>
            <button className="inner-panel academy-landing-button academy-landing-button--disabled" type="button" disabled>{t("paidCourseComingSoon")}</button>
          </div>
        </article>)}
      </div>
      <p className="academy-landing-closing">{t("landingClosing")}</p>
    </section>
  </main>;
}
