import { useLayoutEffect } from "react";

export function useLegacyStylesheets(owner: string, stylesheets: readonly string[]) {
  useLayoutEffect(() => {
    const links = stylesheets.map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.reactLegacyStyles = owner;
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach((link) => link.remove());
  }, [owner, stylesheets]);
}
