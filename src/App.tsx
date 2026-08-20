import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import EntranceHallPage from "./pages/EntranceHallPage";
import AcademyRouteFallback from "./features/academy/components/AcademyRouteFallback";
import BetaBadge from "./components/BetaBadge";

const LobbyPage = lazy(() => import("./pages/LobbyPage"));
const ChamberOfCreationPage = lazy(() => import("./pages/ChamberOfCreationPage"));
const ArtisanBenchPage = lazy(() => import("./pages/ArtisanBenchPage"));
const BespokeAtelierPage = lazy(() => import("./pages/BespokeAtelierPage"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const ArtisanRegisterPage = lazy(() => import("./pages/ArtisanRegisterPage"));
const MyArtisanIdPage = lazy(() => import("./pages/MyArtisanIdPage"));
const HallArchive = lazy(() => import("./pages/HallArchive"));
const ArtisanLoginPage = lazy(() => import("./pages/ArtisanLoginPage"));
const ArtisanForgotPasswordPage = lazy(() => import("./pages/ArtisanForgotPasswordPage"));
const ArtisanResetPasswordPage = lazy(() => import("./pages/ArtisanResetPasswordPage"));
const MyDraftsPage = lazy(() => import("./pages/MyDraftsPage"));
const OrderDetailPage = lazy(() => import("./features/orders/OrderDetailPage"));
const CheckoutPage = lazy(() => import("./features/orders/CheckoutPage"));
const DescribeCreationPage = lazy(() => import("./features/describe-creation/DescribeCreationPage"));
const AdminDashboardLayout = lazy(() => import("./features/admin/AdminDashboardLayout"));
const AdminOverviewPage = lazy(() => import("./features/admin/AdminDashboardPages").then(module => ({ default: module.AdminOverviewPage })));
const AdminCreationsPage = lazy(() => import("./features/admin/AdminDashboardPages").then(module => ({ default: module.AdminCreationsPage })));
const AdminOrdersPage = lazy(() => import("./features/admin/AdminDashboardPages").then(module => ({ default: module.AdminOrdersPage })));
const AdminCustomersPage = lazy(() => import("./features/admin/AdminDashboardPages").then(module => ({ default: module.AdminCustomersPage })));
const AdminLibraryPage = lazy(() => import("./features/admin/AdminLibraryPage"));
const AdminHallArchivePage = lazy(() => import("./features/admin/AdminHallArchivePage"));
const StaffLoginPage = lazy(() => import("./features/admin/StaffLoginPage"));
const PerfumerWorkspaceLayout = lazy(() => import("./features/perfumer/PerfumerWorkspaceLayout"));
const PerfumerOverviewPage = lazy(() => import("./features/perfumer/PerfumerWorkspacePages").then(module => ({ default: module.PerfumerOverviewPage })));
const PerfumerCreationsPage = lazy(() => import("./features/perfumer/PerfumerWorkspacePages").then(module => ({ default: module.PerfumerCreationsPage })));
const PerfumerCompletedWorksPage = lazy(() => import("./features/perfumer/PerfumerWorkspacePages").then(module => ({ default: module.PerfumerCompletedWorksPage })));
const PerfumerProfilePage = lazy(() => import("./features/perfumer/PerfumerWorkspacePages").then(module => ({ default: module.PerfumerProfilePage })));
const AftercarePreviewPage = lazy(() => import("./features/aftercare/AftercarePreviewPage"));

const AcademyLayout = lazy(() => import("./features/academy/layouts/AcademyLayout"));
const AcademyHomePage = lazy(() => import("./features/academy/pages/AcademyHomePage"));
const AcademyCoursesPage = lazy(() => import("./features/academy/pages/AcademyCoursesPage"));
const AcademyCourseDetailPage = lazy(() => import("./features/academy/pages/AcademyCourseDetailPage"));
const AcademyLessonPage = lazy(() => import("./features/academy/pages/AcademyLessonPage"));
const AcademyNotFoundPage = lazy(() => import("./features/academy/pages/AcademyNotFoundPage"));
const MyAcademyPage = lazy(() => import("./features/academy/pages/MyAcademyPage"));
const EnrolledCourseOverviewPage = lazy(() => import("./features/academy/pages/EnrolledCourseOverviewPage"));

function LegacyPerfumerMessagesRedirect() {
  const location = useLocation();
  return <Navigate to={`/perfumer/creations${location.search}`} replace />;
}

function LocalAftercarePreview() {
  const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
  return isLocal ? <AftercarePreviewPage /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <><a className="skip-link" href="#main-content">Skip to main content</a><BetaBadge/><div id="main-content" tabIndex={-1}><Suspense fallback={<AcademyRouteFallback />}><Routes>
      <Route path="/" element={<EntranceHallPage />} />
      <Route path="/hall" element={<LobbyPage />} />
      <Route path="/chamber-of-creation" element={<ChamberOfCreationPage />} />
      <Route path="/artisan-bench" element={<ArtisanBenchPage />} />
      <Route path="/describe-your-creation" element={<DescribeCreationPage />} />
      <Route path="/my-drafts" element={<MyDraftsPage />} />
      <Route path="/my-orders/:requestId" element={<OrderDetailPage />} />
      <Route path="/my-creations/:requestId" element={<OrderDetailPage />} />
      <Route path="/checkout/:requestId" element={<CheckoutPage />} />
      <Route path="/academy" element={<AcademyLayout />}>
        <Route index element={<AcademyHomePage />} />
        <Route path="courses" element={<AcademyCoursesPage />} />
        <Route path="courses/:courseSlug" element={<AcademyCourseDetailPage />} />
        <Route path="courses/:courseSlug/lessons/:lessonSlug" element={<AcademyLessonPage />} />
        <Route path="*" element={<AcademyNotFoundPage />} />
      </Route>
      <Route path="/my-academy" element={<AcademyLayout />}>
        <Route index element={<MyAcademyPage />} />
        <Route path="courses/:courseSlug" element={<EnrolledCourseOverviewPage />} />
      </Route>
      <Route path="/bespoke-atelier" element={<BespokeAtelierPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/artisan-register" element={<ArtisanRegisterPage />} />
      <Route path="/artisan-login" element={<ArtisanLoginPage />} />
      <Route path="/artisan-forgot-password" element={<ArtisanForgotPasswordPage />} />
      <Route path="/artisan-reset-password" element={<ArtisanResetPasswordPage />} />
      <Route path="/my-artisan-id" element={<MyArtisanIdPage />} />
      <Route path="/hall-archive" element={<HallArchive />} />
      <Route path="/preview/aftercare" element={<LocalAftercarePreview />} />
      <Route path="/admin" element={<AdminDashboardLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="creations" element={<AdminCreationsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="revision-requests" element={<Navigate to="/admin/customers?aftercare=ADJUSTMENT" replace />} />
        <Route path="repeat-orders" element={<Navigate to="/admin/customers?aftercare=REORDER" replace />} />
        <Route path="completed-orders" element={<Navigate to="/admin/orders?status=completed" replace />} />
      </Route>
      <Route path="/admin/login" element={<StaffLoginPage kind="admin" />} />
      <Route path="/perfumer/login" element={<StaffLoginPage kind="perfumer" />} />
      <Route path="/perfumer" element={<PerfumerWorkspaceLayout />}>
        <Route index element={<PerfumerOverviewPage />} />
        <Route path="creations" element={<PerfumerCreationsPage />} />
        <Route path="completed" element={<PerfumerCompletedWorksPage />} />
        <Route path="messages" element={<LegacyPerfumerMessagesRedirect />} />
        <Route path="profile" element={<PerfumerProfilePage />} />
      </Route>
      <Route path="/admin/library" element={<AdminLibraryPage />} />
      <Route path="/admin/hall-archive" element={<AdminHallArchivePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></Suspense></div></>
  );
}
