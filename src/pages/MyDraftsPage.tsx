import { useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import DraftsModal from "../components/DraftsModal";
import GlobalHeader from "../components/GlobalHeader";

export default function MyDraftsPage() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const previousTitle = document.title;
    document.title = "My Drafts | The Hall of Artisans";
    document.body.classList.add("my-drafts-page");
    return () => {
      document.title = previousTitle;
      document.body.classList.remove("my-drafts-page");
    };
  }, []);

  return <>
    <GlobalHeader activeLabel="My Drafts" />
    <main className="drafts-shell" aria-hidden="true" />
    <DraftsModal open onClose={() => navigate("/my-artisan-id", { replace: true })} />
  </>;
}
