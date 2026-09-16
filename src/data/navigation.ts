export type NavigationItem = {
  label: string;
  href: string;
};

export const navigationItems: NavigationItem[] = [
  { label: "The Hall", href: "/hall/lobby" },
  { label: "The Academy", href: "/hall/academy" },
  { label: "The Library", href: "/hall/library" },
  { label: "Chamber of Creation", href: "/hall/chamber" },
  { label: "Bespoke Atelier", href: "/hall/bespoke" },
  { label: "Hall Archive", href: "/hall/archive" }
];
