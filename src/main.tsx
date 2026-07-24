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
import "./styles/describe-creation.css";
import "./styles/describe-creation-overrides.css";
import { DraftProvider } from "./contexts/DraftContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <DraftProvider><App /></DraftProvider>
    </BrowserRouter>
  </StrictMode>
);
