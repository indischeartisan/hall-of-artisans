import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getCourseCurriculum, getPublishedCourses, type CourseWithTranslations } from "../services/academyCatalogService";
import { useAcademyLocale } from "../hooks/useAcademyLocale";
import { resolveAcademyTranslation } from "../utils/resolveAcademyTranslation";

type CatalogCourse = CourseWithTranslations & { lessonCount: number };
export default function AcademyCoursesPage() {
  const { locale,t }=useAcademyLocale(); const [courses,setCourses]=useState<CatalogCourse[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const load=()=>{setLoading(true);setError("");void getPublishedCourses().then(async(items)=>Promise.all(items.map(async course=>({...course,lessonCount:(await getCourseCurriculum(course.id)).reduce((sum,module)=>sum+module.academy_lessons.length,0)})))).then(setCourses).catch((reason:unknown)=>setError(reason instanceof Error?reason.message:t("courseLoadError"))).finally(()=>setLoading(false));};
  useEffect(load,[]);
  return <main className="academy-page" aria-labelledby="academy-courses-title"><header className="academy-page-heading"><p className="academy-eyebrow">{t("title")}</p><h1 id="academy-courses-title">{t("courses")}</h1><p>{t("catalogIntro")}</p></header>
    {loading?<p className="academy-status" role="status">{t("loading")}</p>:error?<div className="academy-status" role="alert"><p>{t("courseLoadError")}</p><button className="academy-button" onClick={load}>{t("retry")}</button></div>:null}
    {!loading&&!error&&courses.length===0?<section className="academy-empty-state"><h2>{t("noPublishedCourses")}</h2><p>{t("noPublishedHint")}</p></section>:null}
    {!loading&&!error?<section className="academy-course-list">{courses.map(course=>{const translation=resolveAcademyTranslation(course.academy_course_translations,locale);return <article className="academy-card academy-catalog-card" key={course.id}><div className="academy-cover-fallback" aria-hidden="true">A</div><span>{t("free")} · {t("limitedBeta")}</span><h2>{translation?.title??course.slug}</h2><p>{translation?.short_description}</p><dl><div><dt>{t("level")}</dt><dd>{course.level}</dd></div><div><dt>{t("duration")}</dt><dd>{course.estimated_minutes} {t("minutes")}</dd></div><div><dt>{t("lessons")}</dt><dd>{course.lessonCount}</dd></div></dl><Link className="academy-button" to={`/academy/courses/${course.slug}`}>{t("viewCourse")}</Link></article>;})}<article className="academy-card academy-card--muted"><span>{t("comingSoon")}</span><h2>{t("foundationCourse")}</h2><p>{t("faqPaidA")}</p></article></section>:null}
  </main>;
}
