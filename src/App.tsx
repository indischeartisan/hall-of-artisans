import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import AcademyRouteFallback from "./features/academy/components/AcademyRouteFallback";
import BetaBadge from "./components/BetaBadge";
import IndischeLayout from "./app/indische/IndischeLayout";
import IndischePlaceholderPage from "./app/indische/IndischePlaceholderPage";
import HallLayout from "./app/hall/HallLayout";

const EntranceHallPage = lazy(() => import("./pages/EntranceHallPage"));
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
const HallCheckoutPage = lazy(() => import("./features/orders/CheckoutPage"));
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

function LegacyPerfumerMessagesRedirect() { const location = useLocation(); return <Navigate to={`/perfumer/creations${location.search}`} replace />; }
function LegacyRedirect({ to }: { to: string }) { const location = useLocation(); return <Navigate to={`${to}${location.search}${location.hash}`} replace />; }
function LegacyPrefixRedirect({ from, to }: { from: string; to: string }) { const location = useLocation(); return <Navigate to={`${to}${location.pathname.slice(from.length)}${location.search}${location.hash}`} replace />; }
function LocalAftercarePreview() { const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"; return isLocal ? <AftercarePreviewPage /> : <Navigate to="/" replace />; }

export default function App() {
  return <><a className="skip-link" href="#main-content">Skip to main content</a><BetaBadge /><div id="main-content" tabIndex={-1}><Suspense fallback={<AcademyRouteFallback />}><Routes>
    <Route element={<IndischeLayout />}>
      <Route index element={<IndischePlaceholderPage kind="home" />} /><Route path="shop" element={<IndischePlaceholderPage kind="shop" />} /><Route path="product/:slug" element={<IndischePlaceholderPage kind="product" />} /><Route path="cart" element={<IndischePlaceholderPage kind="cart" />} /><Route path="checkout" element={<IndischePlaceholderPage kind="checkout" />} /><Route path="account" element={<IndischePlaceholderPage kind="account" />} />
    </Route>
    <Route element={<HallLayout />}>
      <Route path="hall" element={<EntranceHallPage />} /><Route path="hall/lobby" element={<LobbyPage />} /><Route path="hall/entrance" element={<LegacyRedirect to="/hall" />} /><Route path="hall/chamber" element={<ChamberOfCreationPage />} /><Route path="hall/create" element={<ArtisanBenchPage />} /><Route path="hall/describe" element={<DescribeCreationPage />} /><Route path="hall/drafts" element={<MyDraftsPage />} /><Route path="hall/orders/:requestId" element={<OrderDetailPage />} /><Route path="hall/creations/:requestId" element={<OrderDetailPage />} /><Route path="hall/checkout/:requestId" element={<HallCheckoutPage />} /><Route path="hall/bespoke" element={<BespokeAtelierPage />} /><Route path="hall/library" element={<LibraryPage />} />
      <Route path="hall/auth/register" element={<ArtisanRegisterPage />} /><Route path="hall/auth/login" element={<ArtisanLoginPage />} /><Route path="hall/auth/forgot-password" element={<ArtisanForgotPasswordPage />} /><Route path="hall/auth/reset-password" element={<ArtisanResetPasswordPage />} /><Route path="hall/artisan-id" element={<MyArtisanIdPage />} /><Route path="hall/archive" element={<HallArchive />} />
      <Route path="hall/academy" element={<AcademyLayout />}><Route index element={<AcademyHomePage />} /><Route path="courses" element={<AcademyCoursesPage />} /><Route path="courses/:courseSlug" element={<AcademyCourseDetailPage />} /><Route path="courses/:courseSlug/lessons/:lessonSlug" element={<AcademyLessonPage />} /><Route path="*" element={<AcademyNotFoundPage />} /></Route>
      <Route path="hall/my-academy" element={<AcademyLayout />}><Route index element={<MyAcademyPage />} /><Route path="courses/:courseSlug" element={<EnrolledCourseOverviewPage />} /></Route>
    </Route>
    <Route path="chamber-of-creation" element={<LegacyRedirect to="/hall/chamber" />} /><Route path="artisan-bench" element={<LegacyRedirect to="/hall/create" />} /><Route path="describe-your-creation" element={<LegacyRedirect to="/hall/describe" />} /><Route path="my-drafts" element={<LegacyRedirect to="/hall/drafts" />} /><Route path="my-orders/*" element={<LegacyPrefixRedirect from="/my-orders" to="/hall/orders" />} /><Route path="my-creations/*" element={<LegacyPrefixRedirect from="/my-creations" to="/hall/creations" />} /><Route path="checkout/:requestId" element={<LegacyPrefixRedirect from="/checkout" to="/hall/checkout" />} /><Route path="academy/*" element={<LegacyPrefixRedirect from="/academy" to="/hall/academy" />} /><Route path="my-academy/*" element={<LegacyPrefixRedirect from="/my-academy" to="/hall/my-academy" />} /><Route path="bespoke-atelier" element={<LegacyRedirect to="/hall/bespoke" />} /><Route path="library" element={<LegacyRedirect to="/hall/library" />} /><Route path="artisan-register" element={<LegacyRedirect to="/hall/auth/register" />} /><Route path="artisan-login" element={<LegacyRedirect to="/hall/auth/login" />} /><Route path="artisan-forgot-password" element={<LegacyRedirect to="/hall/auth/forgot-password" />} /><Route path="artisan-reset-password" element={<LegacyRedirect to="/hall/auth/reset-password" />} /><Route path="my-artisan-id" element={<LegacyRedirect to="/hall/artisan-id" />} /><Route path="hall-archive" element={<LegacyRedirect to="/hall/archive" />} /><Route path="preview/aftercare" element={<LocalAftercarePreview />} />
    <Route path="admin" element={<AdminDashboardLayout />}><Route index element={<AdminOverviewPage />} /><Route path="creations" element={<AdminCreationsPage />} /><Route path="orders" element={<AdminOrdersPage />} /><Route path="customers" element={<AdminCustomersPage />} /><Route path="revision-requests" element={<Navigate to="/admin/customers?aftercare=ADJUSTMENT" replace />} /><Route path="repeat-orders" element={<Navigate to="/admin/customers?aftercare=REORDER" replace />} /><Route path="completed-orders" element={<Navigate to="/admin/orders?status=completed" replace />} /></Route>
    <Route path="admin/login" element={<StaffLoginPage kind="admin" />} /><Route path="admin/library" element={<AdminLibraryPage />} /><Route path="admin/hall-archive" element={<AdminHallArchivePage />} /><Route path="perfumer/login" element={<StaffLoginPage kind="perfumer" />} />
    <Route path="perfumer" element={<PerfumerWorkspaceLayout />}><Route index element={<PerfumerOverviewPage />} /><Route path="creations" element={<PerfumerCreationsPage />} /><Route path="completed" element={<PerfumerCompletedWorksPage />} /><Route path="messages" element={<LegacyPerfumerMessagesRedirect />} /><Route path="profile" element={<PerfumerProfilePage />} /></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></div></>;
}
