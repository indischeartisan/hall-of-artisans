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
import "./styles/order-detail.css";
import "./styles/order-detail-overrides.css";
import "./styles/creation-preparation.css";
import "./styles/package-selection.css";
import "./styles/order-preparation-layer.css";
import "./styles/artisan-review-room.css";
import "./styles/approval-room.css";
import "./styles/fulfillment-room.css";
import "./styles/closed-project-room.css";
import "./styles/order-picker-groups.css";
import "./styles/admin-portal.css";
import "./styles/admin-header.css";
import "./styles/staff-login.css";
import "./styles/admin-library.css";
import "./styles/admin-library-upload.css";
import "./styles/admin-hall-archive.css";
import "./styles/describe-creation.css";
import "./styles/describe-creation-overrides.css";
import "./styles/bright-title-clarity.css";
import { DraftProvider } from "./contexts/DraftContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <DraftProvider><App /></DraftProvider>
    </BrowserRouter>
  </StrictMode>
);
