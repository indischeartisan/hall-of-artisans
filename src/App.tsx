import { Navigate, Route, Routes } from "react-router";
import EntranceHallPage from "./pages/EntranceHallPage";
import LobbyPage from "./pages/LobbyPage";
import ChamberOfCreationPage from "./pages/ChamberOfCreationPage";
import ArtisanBenchPage from "./pages/ArtisanBenchPage";
import AcademyPage from "./pages/AcademyPage";
import BespokeAtelierPage from "./pages/BespokeAtelierPage";
import LibraryPage from "./pages/LibraryPage";
import ArtisanRegisterPage from "./pages/ArtisanRegisterPage";
import MyArtisanIdPage from "./pages/MyArtisanIdPage";
import HallArchive from "./pages/HallArchive";
import ArtisanLoginPage from "./pages/ArtisanLoginPage";
import MyDraftsPage from "./pages/MyDraftsPage";
import OrderDetailPage from "./features/orders/OrderDetailPage";
import CheckoutPage from "./features/orders/CheckoutPage";
import DescribeCreationPage from "./features/describe-creation/DescribeCreationPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EntranceHallPage />} />
      <Route path="/hall" element={<LobbyPage />} />
      <Route path="/chamber-of-creation" element={<ChamberOfCreationPage />} />
      <Route path="/artisan-bench" element={<ArtisanBenchPage />} />
      <Route path="/describe-your-creation" element={<DescribeCreationPage />} />
      <Route path="/my-drafts" element={<MyDraftsPage />} />
      <Route path="/my-orders/:requestId" element={<OrderDetailPage />} />
      <Route path="/checkout/:requestId" element={<CheckoutPage />} />
      <Route path="/academy" element={<AcademyPage />} />
      <Route path="/bespoke-atelier" element={<BespokeAtelierPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/artisan-register" element={<ArtisanRegisterPage />} />
      <Route path="/artisan-login" element={<ArtisanLoginPage />} />
      <Route path="/my-artisan-id" element={<MyArtisanIdPage />} />
      <Route path="/hall-archive" element={<HallArchive />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
