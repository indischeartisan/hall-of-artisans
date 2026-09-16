import { NavLink } from "react-router";

const navigation = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/hall", label: "The Hall" }
];

export default function IndischeHeader() {
  return <header className="indische-header">
    <NavLink className="indische-wordmark" to="/" aria-label="Indische Artisan home">
      <span>Indische</span> Artisan
    </NavLink>
    <nav className="indische-primary-nav" aria-label="Indische Artisan navigation">
      {navigation.map(({ to, label, end }) => <NavLink end={end} key={to} to={to}>{label}</NavLink>)}
    </nav>
    <NavLink className="indische-account-link" to="/account">My Indische</NavLink>
  </header>;
}
