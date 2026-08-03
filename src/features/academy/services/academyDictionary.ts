import type { AcademyLocale } from "../types/academyLocale";

export const academyDictionary = {
  en: {
    title: "The Academy",
    school: "A School of Scent & Story",
    homeIntro: "A free introductory course is being prepared for curious noses and new storytellers.",
    foundationCourse: "Foundations of Creative Perfumery",
    foundationStatus: "Coming Soon",
    introductionCourse: "Introduction to the World of Perfumery",
    preparationStatus: "In Preparation",
    courses: "Courses",
    myAcademy: "My Academy",
    noCourses: "You do not have any active courses yet.",
    noCoursesHint: "Your learning path will appear here when Academy courses open.",
    backToHall: "Return to The Hall",
    viewCourses: "View courses",
    courseDetail: "Course Preview",
    coursePlaceholder: "This course page is ready for curriculum content in a later phase.",
    lessonReader: "Lesson Reader",
    lessonPlaceholder: "The quiet reading shell is ready. Structured lesson blocks will arrive in a later phase.",
    notFound: "This Academy page could not be found.",
    loading: "Opening The Academy…",
    navigation: "Academy navigation",
    artisanId: "Artisan ID",
    welcome: "Welcome",
    unavailableName: "Artisan"
  },
  id: {
    title: "The Academy",
    school: "Sekolah Aroma & Cerita",
    homeIntro: "Course pengantar gratis sedang disiapkan untuk pencinta aroma dan pencerita baru.",
    foundationCourse: "Fondasi Perfumery Kreatif",
    foundationStatus: "Segera Hadir",
    introductionCourse: "Pengantar Dunia Perfumery",
    preparationStatus: "Sedang Disiapkan",
    courses: "Course",
    myAcademy: "Academy Saya",
    noCourses: "Anda belum memiliki course aktif.",
    noCoursesHint: "Jalur belajar Anda akan tampil di sini saat course Academy dibuka.",
    backToHall: "Kembali ke The Hall",
    viewCourses: "Lihat course",
    courseDetail: "Pratinjau Course",
    coursePlaceholder: "Halaman course ini siap menerima curriculum pada phase berikutnya.",
    lessonReader: "Pembaca Lesson",
    lessonPlaceholder: "Ruang baca telah siap. Structured lesson blocks akan hadir pada phase berikutnya.",
    notFound: "Halaman Academy ini tidak ditemukan.",
    loading: "Membuka The Academy…",
    navigation: "Navigasi Academy",
    artisanId: "Artisan ID",
    welcome: "Selamat datang",
    unavailableName: "Artisan"
  }
} as const;

export type AcademyMessageKey = keyof typeof academyDictionary.en;

export function translateAcademy(locale: AcademyLocale, key: AcademyMessageKey): string {
  return academyDictionary[locale][key] ?? academyDictionary.en[key];
}
