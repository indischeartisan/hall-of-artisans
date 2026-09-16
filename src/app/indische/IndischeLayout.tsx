import { Outlet } from "react-router";
import IndischeBottomNav from "./components/IndischeBottomNav";
import IndischeHeader from "./components/IndischeHeader";

export default function IndischeLayout() {
  return (
    <div className="indische-app">
      <IndischeHeader />
      <main className="indische-main"><Outlet /></main>
      <IndischeBottomNav />
    </div>
  );
}
