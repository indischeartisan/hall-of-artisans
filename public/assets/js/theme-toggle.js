(() => {
  const storageKey = "hoa-theme";
  const body = document.body;
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const setTheme = (theme) => {
    const isDark = theme === "dark";
    body.dataset.theme = isDark ? "dark" : "bright";
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "Switch to bright mode" : "Switch to dark mode");
    toggle.querySelector(".theme-toggle-icon").textContent = isDark ? "\u2600" : "\u263E";
    toggle.querySelector(".theme-toggle-label").textContent = isDark ? "Bright Mode" : "Dark Mode";
  };

  const savedTheme = localStorage.getItem(storageKey);
  const defaultTheme = body.dataset.theme === "dark" ? "dark" : "bright";
  setTheme(savedTheme === "dark" || savedTheme === "bright" ? savedTheme : defaultTheme);

  toggle.addEventListener("click", () => {
    const nextTheme = body.dataset.theme === "dark" ? "bright" : "dark";
    setTheme(nextTheme);
    localStorage.setItem(storageKey, nextTheme);
  });
})();
