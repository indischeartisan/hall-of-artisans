import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import AcademyProgressBar from "../components/AcademyProgressBar";
import LessonBlockRenderer from "../components/LessonBlockRenderer";
import { getCourseBySlug, getCourseCurriculum, getLessonBySlug, resolveCourseAccess, type CourseWithTranslations, type LessonReaderRecord, type ModuleWithCurriculum } from "../services/academyCatalogService";
import { getMyProgress, upsertMyLessonProgress, type AcademyProgress } from "../services/academyProgressService";
import { useAcademyLocale } from "../hooks/useAcademyLocale";
import { getAcademyBlockContentsLabel } from "../types/academyBlockContent";
import type { AcademyLocale } from "../types/academyLocale";
import { jsonStringArray, resolveAcademyTranslation } from "../utils/resolveAcademyTranslation";

export default function AcademyLessonPage() {
  const { courseSlug = "", lessonSlug = "" } = useParams();
  const { user } = useAuth();
  const { locale, t } = useAcademyLocale();
  const [course, setCourse] = useState<CourseWithTranslations | null>(null);
  const [modules, setModules] = useState<ModuleWithCurriculum[]>([]);
  const [lesson, setLesson] = useState<LessonReaderRecord | null>(null);
  const [progress, setProgress] = useState<AcademyProgress[]>([]);
  const [access, setAccess] = useState<Awaited<ReturnType<typeof resolveCourseAccess>>>("locked");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [readerLocale, setReaderLocale] = useState<AcademyLocale>(() => {
    const stored = window.localStorage.getItem("academy-reader-locale");
    return stored === "id" || stored === "en" ? stored : locale;
  });
  const [languageOpen, setLanguageOpen] = useState(false);
  const drawerButton = useRef<HTMLButtonElement>(null);
  const languageMenu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeLanguageMenu = (event: PointerEvent) => {
      if (!languageMenu.current?.contains(event.target as Node)) setLanguageOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLanguageOpen(false);
    };
    document.addEventListener("pointerdown", closeLanguageMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeLanguageMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setCourse(null);
    setModules([]);
    setLesson(null);
    setProgress([]);
    setAccess("locked");
    void (async () => {
      try {
        const found = await getCourseBySlug(courseSlug);
        if (!found) {
          if (active) setError(t("courseUnavailable"));
          return;
        }
        const resolved = await resolveCourseAccess(courseSlug);
        const includeDrafts = resolved === "admin";
        const [curriculum, body, rows] = await Promise.all([
          getCourseCurriculum(found.id, { includeDrafts }),
          getLessonBySlug(found.id, lessonSlug, { includeDrafts }),
          user ? getMyProgress(user.id) : Promise.resolve([])
        ]);
        if (!active) return;
        setCourse(found);
        setModules(curriculum);
        setLesson(body);
        setAccess(resolved);
        setProgress(rows);
        if (!body) {
          setError(t("lessonUnavailable"));
          return;
        }
        if (user && resolved === "actively_enrolled") {
          const existing = rows.find((row) => row.lesson_id === body.id);
          const updated = await upsertMyLessonProgress({
            lesson_id: body.id,
            status: existing?.status === "completed" ? "completed" : "in_progress",
            last_block_position: existing?.last_block_position ?? 0,
            started_at: existing?.started_at ?? new Date().toISOString(),
            last_opened_at: new Date().toISOString(),
            completed_at: existing?.completed_at ?? null
          }, user.id);
          if (active) setProgress((current) => [...current.filter((row) => row.lesson_id !== body.id), updated]);
        }
      } catch (reason) {
        if (active) {
          setLesson(null);
          setError(reason instanceof Error ? reason.message : t("lessonUnavailable"));
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [courseSlug, lessonSlug, user?.id]);

  const lessons = useMemo(() => modules.flatMap((module) => module.academy_lessons), [modules]);
  const index = lessons.findIndex((item) => item.slug === lessonSlug);
  const previous = index > 0 ? lessons[index - 1] : null;
  const next = index >= 0 ? lessons[index + 1] ?? null : null;
  const progressMap = useMemo(() => new Map(progress.map((row) => [row.lesson_id, row])), [progress]);
  const currentProgress = lesson ? progressMap.get(lesson.id) : null;
  const completed = lessons.filter((item) => progressMap.get(item.id)?.status === "completed").length;
  const courseTranslation = course ? resolveAcademyTranslation(course.academy_course_translations, readerLocale) : null;
  const contentLocale = lesson?.academy_lesson_translations.some((item) => item.locale === readerLocale) ? readerLocale : "en";
  const lessonTranslation = lesson?.academy_lesson_translations.find((item) => item.locale === contentLocale) ?? null;
  const canRead = Boolean(lesson && (access === "actively_enrolled" || access === "admin" || lesson.is_preview));
  const contents = lesson?.academy_lesson_blocks.flatMap((block) => {
    const translation = block.academy_lesson_block_translations.find((item) => item.locale === contentLocale);
    const variant = block.settings && typeof block.settings === "object" && !Array.isArray(block.settings) && "variant" in block.settings ? block.settings.variant : null;
    const label = block.block_type === "rich_text" && variant !== "transition"
      ? getAcademyBlockContentsLabel(block.block_type, translation?.content, block.settings)
      : block.block_type === "exercise"
        ? (contentLocale === "id" ? "Pengamatan Terpandu" : "Guided Observation")
        : block.block_type === "summary"
          ? (contentLocale === "id" ? "Ringkasan" : "Summary")
          : null;
    return label ? [{ id: block.id, label }] : [];
  }) ?? [];

  const closeDrawer = () => {
    setDrawer(false);
    window.setTimeout(() => drawerButton.current?.focus(), 0);
  };
  const chooseLanguage = (nextLocale: AcademyLocale) => {
    setReaderLocale(nextLocale);
    window.localStorage.setItem("academy-reader-locale", nextLocale);
    setLanguageOpen(false);
  };
  const complete = async () => {
    if (!user || !lesson || access !== "actively_enrolled" || saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await upsertMyLessonProgress({ lesson_id: lesson.id, status: "completed", last_block_position: lesson.academy_lesson_blocks.length, started_at: currentProgress?.started_at ?? new Date().toISOString(), last_opened_at: new Date().toISOString(), completed_at: currentProgress?.completed_at ?? new Date().toISOString() }, user.id);
      setProgress((rows) => [...rows.filter((row) => row.lesson_id !== lesson.id), updated]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("lessonUnavailable"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="academy-page"><p className="academy-status" role="status">{t("openingLesson")}</p></main>;
  if (error && !lesson) return <main className="academy-page"><section className="academy-empty-state"><h1>{t("lessonUnavailable")}</h1><p>{error}</p><Link className="academy-button" to={`/academy/courses/${courseSlug}`}>{t("backToCourse")}</Link></section></main>;
  if (!course || !lesson || !lessonTranslation) return <main className="academy-page"><section className="academy-empty-state"><h1>{t("lessonUnavailable")}</h1><Link className="academy-button" to={`/academy/courses/${courseSlug}`}>{t("backToCourse")}</Link></section></main>;
  if (!canRead) return <main className="academy-page"><section className="academy-empty-state academy-locked"><p className="academy-eyebrow">{t("locked")}</p><h1>{lessonTranslation.title}</h1><p>{t("notEnrolled")}</p><Link className="academy-button academy-button--primary" to={`/academy/courses/${courseSlug}`}>{t("backToCourse")}</Link></section></main>;

  return <main className="academy-lesson-layout">
    <button ref={drawerButton} className="academy-contents-button" aria-expanded={drawer} onClick={() => setDrawer(true)}>{t("openContents")}</button>
    <aside className={`academy-reader-sidebar ${drawer ? "is-open" : ""}`} aria-label={t("curriculum")}>
      <button className="academy-drawer-close" onClick={closeDrawer}>{t("closeContents")}</button>
      <Link to="/my-academy">← {t("backToMyAcademy")}</Link>
      <h2>{courseTranslation?.title}</h2>
      <AcademyProgressBar completed={completed} total={lessons.length} label={t("progress")} />
      <nav><ol>{lessons.map((item) => {
        const translation = item.academy_lesson_translations.find((value) => value.locale === contentLocale);
        const status = progressMap.get(item.id)?.status;
        return <li className={item.id === lesson.id ? "active" : ""} key={item.id}>
          <Link to={`/academy/courses/${courseSlug}/lessons/${item.slug}`} onClick={() => setDrawer(false)}>{translation?.title ?? item.slug}</Link>
          {access === "admin" && item.status === "draft" ? <span className="academy-draft-badge">{locale === "id" ? "Draf" : "Draft"}</span> : null}
          <small>{access === "admin" && item.status === "draft" ? (locale === "id" ? "Pratinjau admin" : "Admin preview") : status === "completed" ? t("complete") : status === "in_progress" ? t("inProgress") : t("notStarted")}</small>
        </li>;
      })}</ol></nav>
    </aside>
    <article className="academy-reading-column">
      <header>
        <div className="academy-reader-heading-row">
          <p className="academy-eyebrow">{t("reader")} · {t("limitedBeta")}</p>
          <div className="academy-language-picker" ref={languageMenu}>
            <button type="button" aria-haspopup="menu" aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}><span aria-hidden="true">◎</span>{readerLocale === "id" ? "Bahasa Indonesia" : "English"}<span aria-hidden="true">⌄</span></button>
            {languageOpen ? <div className="academy-language-menu" role="menu" aria-label="Lesson language">
              <button type="button" role="menuitemradio" aria-checked={readerLocale === "en"} onClick={() => chooseLanguage("en")}><span>EN</span><strong>English</strong>{readerLocale === "en" ? "✓" : ""}</button>
              <button type="button" role="menuitemradio" aria-checked={readerLocale === "id"} onClick={() => chooseLanguage("id")}><span>ID</span><strong>Bahasa Indonesia</strong>{readerLocale === "id" ? "✓" : ""}</button>
            </div> : null}
          </div>
        </div>
        <h1>{lessonTranslation.title}</h1><p className="academy-opening-line">{lessonTranslation.opening_line}</p><div className="academy-reading-times"><span>{lesson.reading_minutes} {t("minutes")} {t("readingTime")}</span><span>{lesson.practice_minutes} {t("minutes")} {t("practiceTime")}</span></div><p>{lessonTranslation.introduction}</p>
      </header>
      <section className="academy-objectives"><h2>{t("objectives")}</h2><ul>{jsonStringArray(lessonTranslation.learning_objectives).map((item) => <li key={item}>{item}</li>)}</ul></section>
      {lesson.academy_lesson_blocks.map((block) => <Fragment key={block.id}>
        <LessonBlockRenderer block={block} translation={block.academy_lesson_block_translations.find((item) => item.locale === contentLocale) ?? null} />
        {lesson.slug === "what-perfumery-really-is" && block.position === 4 ? <figure className="academy-block academy-lesson-illustration"><img src="/assets/images/academy/lesson-1/perfumers-palette-v1.png" alt={contentLocale === "id" ? "Ilustrasi palet perfumer: bunga, sitrus, kayu, resin, vial, dan blotter" : "The perfumer's palette: flowers, citrus, woods, resins, vials, and blotters"} loading="lazy" /><figcaption>{contentLocale === "id" ? "Palet perfumer terbentuk dari material dengan karakter dan fungsi yang saling melengkapi." : "A perfumer's palette brings together materials with complementary character and function."}</figcaption></figure> : null}
        {lesson.slug === "what-perfumery-really-is" && block.position === 6 ? <figure className="academy-block academy-lesson-illustration"><img src="/assets/images/academy/lesson-1/formula-relationships-v1.png" alt={contentLocale === "id" ? "Ilustrasi formula parfum sebagai sistem hubungan antar material" : "A perfume formula illustrated as a system of relationships between materials"} loading="lazy" /><figcaption>{contentLocale === "id" ? "Formula bukan sekadar daftar bahan, melainkan jaringan hubungan yang membentuk satu kesatuan." : "A formula is not merely a list of materials, but a network of relationships forming a whole."}</figcaption></figure> : null}
      </Fragment>)}
      {access === "actively_enrolled" ? <div className="academy-completion"><button className="academy-button academy-button--primary" disabled={saving || currentProgress?.status === "completed"} onClick={() => void complete()}>{saving ? t("markingComplete") : currentProgress?.status === "completed" ? t("lessonComplete") : t("markComplete")}</button>{currentProgress?.status === "completed" && !next ? <p>{t("noNextLesson")}</p> : null}</div> : null}
      <nav className="academy-lesson-nav" aria-label={t("contents")}>{previous ? <Link to={`/academy/courses/${courseSlug}/lessons/${previous.slug}`}>← {t("previousLesson")}</Link> : <span />}{next ? <Link to={`/academy/courses/${courseSlug}/lessons/${next.slug}`}>{t("nextLesson")} →</Link> : <Link to={`/my-academy/courses/${courseSlug}`}>{t("courseOverview")} →</Link>}</nav>
    </article>
    <aside className="academy-reader-utility"><h2>{t("materials")}</h2><ul>{jsonStringArray(lessonTranslation.materials_needed).map((item) => <li key={item}>{item}</li>)}</ul>{contents.length ? <><h2>{t("contents")}</h2><ol>{contents.map((item) => <li key={item.id}>{item.label}</li>)}</ol></> : null}</aside>
    {drawer ? <button className="academy-drawer-backdrop" aria-label={t("closeContents")} onClick={closeDrawer} /> : null}
  </main>;
}
