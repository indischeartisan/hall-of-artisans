import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import EntranceHallPage from "./pages/EntranceHallPage";
import LobbyPage from "./pages/LobbyPage";
import ChamberOfCreationPage from "./pages/ChamberOfCreationPage";
import ArtisanBenchPage from "./pages/ArtisanBenchPage";
import AcademyRouteFallback from "./features/academy/components/AcademyRouteFallback";
import BespokeAtelierPage from "./pages/BespokeAtelierPage";
import LibraryPage from "./pages/LibraryPage";
import ArtisanRegisterPage from "./pages/ArtisanRegisterPage";
import MyArtisanIdPage from "./pages/MyArtisanIdPage";
import HallArchive from "./pages/HallArchive";
import ArtisanLoginPage from "./pages/ArtisanLoginPage";
import ArtisanForgotPasswordPage from "./pages/ArtisanForgotPasswordPage";
import ArtisanResetPasswordPage from "./pages/ArtisanResetPasswordPage";
import MyDraftsPage from "./pages/MyDraftsPage";
import OrderDetailPage from "./features/orders/OrderDetailPage";
import CheckoutPage from "./features/orders/CheckoutPage";
import DescribeCreationPage from "./features/describe-creation/DescribeCreationPage";
import AdminDashboardLayout from "./features/admin/AdminDashboardLayout";
import { AdminCreationsPage, AdminCustomersPage, AdminOrdersPage, AdminOverviewPage } from "./features/admin/AdminDashboardPages";
import AdminLibraryPage from "./features/admin/AdminLibraryPage";
import AdminHallArchivePage from "./features/admin/AdminHallArchivePage";
import StaffLoginPage from "./features/admin/StaffLoginPage";
import PerfumerWorkspaceLayout from "./features/perfumer/PerfumerWorkspaceLayout";
import { PerfumerCompletedWorksPage, PerfumerCreationsPage, PerfumerOverviewPage, PerfumerProfilePage } from "./features/perfumer/PerfumerWorkspacePages";
import AftercarePreviewPage from "./features/aftercare/AftercarePreviewPage";
import BetaBadge from "./components/BetaBadge";

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
    <><BetaBadge/><Suspense fallback={<AcademyRouteFallback />}><Routes>
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
    </Routes></Suspense></>
  );
}
