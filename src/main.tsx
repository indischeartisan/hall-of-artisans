import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./styles/entrance-hall.css";
import "./styles/lobby.css";
import "./styles/chamber-of-creation.css";
import "./styles/artisan-bench-shell.css";
import "./styles/artisan-profile.css";
import "./styles/my-artisan-id.css";
import "./styles/my-drafts.css";
import "./styles/drafts-modal.css";
import "./styles/drafts-modal-scroll.css";
import "./styles/order-detail.css";
import "./styles/order-detail-overrides.css";
import "./styles/creation-preparation.css";
import "./styles/creation-preview-editorial.css";
import "./styles/package-selection.css";
import "./styles/package-layout-overrides.css";
import "./styles/order-preparation-layer.css";
import "./styles/artisan-review-room.css";
import "./styles/approval-room.css";
import "./styles/fulfillment-room.css";
import "./styles/closed-project-room.css";
import "./styles/customer-project-room.css";
import "./styles/simple-project-state.css";
import "./styles/proposal-decision.css";
import "./styles/payment-transition.css";
import "./styles/order-picker-groups.css";
import "./styles/admin-portal.css";
import "./styles/admin-header.css";
import "./styles/admin-dashboard.css";
import "./styles/admin-lifecycle.css";
import "./styles/admin-assignment.css";
import "./styles/perfumer-workspace.css";
import "./styles/perfumer-customer-projects.css";
import "./styles/perfumer-review-document.css";
import "./styles/aftercare.css";
import "./styles/staff-login.css";
import "./styles/admin-library.css";
import "./styles/admin-library-upload.css";
import "./styles/admin-hall-archive.css";
import "./styles/describe-creation.css";
import "./styles/describe-creation-overrides.css";
import "./styles/bright-title-clarity.css";
import "./styles/beta-environment.css";
import "./styles/accessibility.css";
// Keep the shared phone/PWA header contract after page-specific header overrides.
import "./styles/mobile-global-header.css";
// Keep this after shared mobile styles: it is the sole owner of the phone Formula presentation.
// Shared Artisan Bench chrome and the other mobile tabs live in the shell file.
import "./styles/artisan-bench-formula-mobile.css";
// Installed tablet PWA overrides are isolated from both phone and desktop CSS.
import "./styles/artisan-bench-tablet-pwa.css";
import { DraftProvider } from "./contexts/DraftContext";
import { AuthProvider } from "./contexts/AuthContext";

const standaloneMedia = window.matchMedia("(display-mode: standalone)");
const viewportMeta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
const defaultViewportContent = viewportMeta?.content ?? "width=device-width, initial-scale=1.0";
const syncPwaDisplayMode = () => {
  const isIosStandalone = "standalone" in navigator
    && (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isStandalone = standaloneMedia.matches || isIosStandalone;
  const shortestScreenSide = Math.min(window.screen.width, window.screen.height);
  const isDesktopOperatingSystem = /Windows NT/i.test(navigator.userAgent)
    || (/Macintosh/i.test(navigator.userAgent) && navigator.platform !== "MacIntel");
  const isTabletPlatform = /Android|iPad/i.test(navigator.userAgent)
    || (/Linux/i.test(navigator.userAgent) && !isDesktopOperatingSystem)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isTouchTablet = isTabletPlatform && navigator.maxTouchPoints > 0 && shortestScreenSide >= 600;

  document.documentElement.dataset.pwaMode = isStandalone ? "standalone" : "browser";
  document.documentElement.dataset.tabletDevice = isTouchTablet ? "true" : "false";
  document.documentElement.dataset.tabletPwa = isStandalone && isTouchTablet ? "true" : "false";
  if (viewportMeta) {
    viewportMeta.content = isTouchTablet
      ? "width=700, initial-scale=1.0, viewport-fit=cover"
      : defaultViewportContent;
  }
};

syncPwaDisplayMode();
standaloneMedia.addEventListener("change", syncPwaDisplayMode);
window.addEventListener("resize", syncPwaDisplayMode, { passive: true });

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider><DraftProvider><App /></DraftProvider></AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
