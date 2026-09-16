import { NavLink } from "react-router";

const items = [
  { to: "/", label: "Home", mark: "I", end: true },
  { to: "/shop", label: "Shop", mark: "S" },
  { to: "/hall", label: "Hall", mark: "H" },
  { to: "/cart", label: "Bag", mark: "B" }
];

export default function IndischeBottomNav() {
  return <nav className="indische-bottom-nav" aria-label="Mobile navigation">
    {items.map(({ to, label, mark, end }) => <NavLink end={end} key={to} to={to}>
      <span aria-hidden="true">{mark}</span><small>{label}</small>
    </NavLink>)}
  </nav>;
}
