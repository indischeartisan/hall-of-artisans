import type { ReactNode } from "react";

export default function EditorialSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`indische-editorial-section ${className}`.trim()}>{children}</section>;
}
