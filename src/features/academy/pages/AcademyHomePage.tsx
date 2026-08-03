import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getPublishedCourses, type CourseWithTranslations } from "../services/academyCatalogService";
import { useAcademyLocale } from "../hooks/useAcademyLocale";
import { resolveAcademyTranslation } from "../utils/resolveAcademyTranslation";

export default function AcademyHomePage() {
  const { locale, t } = useAcademyLocale();
  const [course, setCourse] = useState<CourseWithTranslations | null>(null);
  useEffect(() => { let active=true; void getPublishedCourses().then((items)=>{if(active)setCourse(items[0]??null);}).catch(()=>undefined); return()=>{active=false;}; }, []);
  const translation = course ? resolveAcademyTranslation(course.academy_course_translations, locale) : null;
  const faq = [["faqVideoQ","faqVideoA"],["faqBeginnerQ","faqBeginnerA"],["faqMaterialsQ","faqMaterialsA"],["faqMobileQ","faqMobileA"],["faqPaidQ","faqPaidA"]] as const;
  return <main className="academy-page academy-home" aria-labelledby="academy-title">
    <section className="academy-hero-panel academy-conservatory-hero">
      <p className="academy-eyebrow">{t("school")}</p><h1 id="academy-title">{t("title")}</h1><p className="academy-lead">{t("heroIntro")}</p>
      <div className="academy-actions"><Link className="academy-button academy-button--primary" to={course ? `/academy/courses/${course.slug}` : "/academy/courses"}>{t("beginStudies")}</Link><Link className="academy-button" to="/academy/courses">{t("exploreCourses")}</Link></div>
    </section>
    <section className="academy-editorial-section"><p className="academy-eyebrow">{t("title")}</p><h2>{t("introductionTitle")}</h2><p>{t("introductionBody")}</p></section>
    <section className="academy-editorial-section" aria-labelledby="method-title"><h2 id="method-title">{t("learningMethod")}</h2><div className="academy-method-grid">{(["read","observe","record"] as const).map((key,index)=><article key={key}><span>0{index+1}</span><h3>{t(key)}</h3><p>{t(`${key}Body` as "readBody"|"observeBody"|"recordBody")}</p></article>)}</div></section>
    <section className="academy-course-feature"><div><p className="academy-eyebrow">{t("free")} · {t("limitedBeta")}</p><h2>{translation?.title ?? t("introductionCourse")}</h2><p>{translation?.short_description ?? t("catalogIntro")}</p></div><Link className="academy-button academy-button--primary" to={course ? `/academy/courses/${course.slug}` : "/academy/courses"}>{t("viewCourse")}</Link></section>
    <section className="academy-course-feature academy-course-feature--coming"><div><p className="academy-eyebrow">{t("comingSoon")}</p><h2>{t("foundationCourse")}</h2><p>{t("faqPaidA")}</p></div></section>
    <section className="academy-philosophy"><p className="academy-eyebrow">{t("philosophy")}</p><blockquote>{t("philosophyBody")}</blockquote></section>
    <section className="academy-editorial-section"><h2>{t("faq")}</h2><div className="academy-faq">{faq.map(([question,answer])=><details key={question}><summary>{t(question)}</summary><p>{t(answer)}</p></details>)}</div></section>
  </main>;
}
