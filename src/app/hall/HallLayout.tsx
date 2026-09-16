import { Outlet } from "react-router";

// Hall screens retain their existing page-owned header and visual system.
// This layout is the composition boundary for the /hall namespace.
export default function HallLayout() {
  return <div className="hall-app" data-app-section="hall"><Outlet /></div>;
}
