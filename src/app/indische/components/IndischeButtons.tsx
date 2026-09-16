import { Link } from "react-router";

type ButtonProps = { to: string; children: string };

export function PrimaryButton({ to, children }: ButtonProps) {
  return <Link className="indische-button indische-button--primary" to={to}>{children}<span aria-hidden="true">↗</span></Link>;
}

export function SecondaryButton({ to, children }: ButtonProps) {
  return <Link className="indische-button indische-button--secondary" to={to}>{children}</Link>;
}
