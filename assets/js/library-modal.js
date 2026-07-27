(function () {
  const materials = window.LIBRARY_MATERIALS || [];
  const categories = window.LIBRARY_CATEGORIES || [];
  const featuredIds = window.LIBRARY_FEATURED_IDS || [];

  const grid = document.querySelector("[data-library-grid]");
  const chipRail = document.querySelector("[data-category-chips]");
  const searchInput = document.querySelector("[data-library-search]");
  const comingSoonGrid = document.querySelector("[data-coming-soon-grid]");
  const modal = document.querySelector("[data-library-modal]");
  const modalPanel = document.querySelector("[data-library-modal-panel]");
  const closeButton = document.querySelector("[data-library-close]");

  const libraryHeader = document.querySelector("#siteHeader");
  libraryHeader?.classList.remove("global-header--light");
  libraryHeader?.classList.add("global-header--transparent");
  const savedTheme = localStorage.getItem("hoa-theme") === "dark" ? "dark" : "bright";
  document.body.dataset.theme = savedTheme;
  if (libraryHeader && !libraryHeader.querySelector(".library-theme-toggle")) {
    const themeToggle = document.createElement("button");
    themeToggle.className = "theme-toggle theme-toggle--slider library-theme-toggle";
    themeToggle.type = "button";
    themeToggle.innerHTML = '<span class="theme-toggle-track" aria-hidden="true"><span class="theme-toggle-option theme-toggle-sun">&#9728;</span><span class="theme-toggle-option theme-toggle-moon">&#9790;</span><span class="theme-toggle-thumb"></span></span>';
    const syncThemeToggle = () => {
      const dark = document.body.dataset.theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(dark));
      themeToggle.setAttribute("aria-label", dark ? "Switch to bright mode" : "Switch to dark mode");
    };
    themeToggle.addEventListener("click", () => {
      const next = document.body.dataset.theme === "dark" ? "bright" : "dark";
      document.body.dataset.theme = next;
      localStorage.setItem("hoa-theme", next);
      syncThemeToggle();
    });
    syncThemeToggle();
    libraryHeader.append(themeToggle);
  }

  document.querySelector(".indische-section")?.classList.add("inner-panel");
  document.querySelector(".library-cta")?.classList.add("inner-panel");
  document.querySelector(".library-cta a")?.classList.add("inner-panel");

  let activeCategory = "Featured Materials";
  let query = "";

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function toList(value) {
    return Array.isArray(value) ? value : [value].filter(Boolean);
  }

  function matchesSearch(material) {
    if (!query) return true;
    const haystack = [
      material.name,
      material.category,
      material.type,
      material.description,
      material.bestUsedFor,
      material.avoidIf,
      ...toList(material.families),
      ...toList(material.mood),
      ...toList(material.suggestedRole),
      ...toList(material.pairsWellWith)
    ].join(" ");
    return normalize(haystack).includes(query);
  }

  function matchesCategory(material) {
    if (query && activeCategory === "Featured Materials") return material.status === "active";
    if (activeCategory === "Featured Materials") return material.status === "active" && featuredIds.includes(material.id);
    if (activeCategory === "All") return material.status === "active";
    if (activeCategory === "Indische Materials") return material.status === "coming-soon";
    return material.status === "active" && (material.category === activeCategory || (material.families || []).includes(activeCategory));
  }

  function materialIconMarkup(material) {
    if (material.iconImage) {
      return `<img src="${material.iconImage}" alt="" loading="lazy" decoding="async">`;
    }

    return material.icon || "✦";
  }

  function materialCard(material) {
    const tags = (material.mood || []).slice(0, 3).map((tag) => `<span>${tag}</span>`).join("");
    const classification = (material.families || [material.category || material.type])[0];
    return `
      <article class="library-card inner-panel" data-material-id="${material.id}" data-open-material="${material.id}" role="button" tabindex="0" aria-label="Open ${material.name}">
        <div class="library-card-ornament" aria-hidden="true"></div>
        <div class="material-illustration" aria-hidden="true">${materialIconMarkup(material)}</div>
        <h2>${material.name}</h2>
        <div class="material-tags">${tags}</div>
        <p class="material-classification">${classification}</p>
      </article>
    `;
  }

  function lockedCard(material) {
    return `
      <article class="locked-material" aria-disabled="true">
        <div class="locked-art" aria-hidden="true">${material.icon || "✦"}</div>
        <span class="lock-mark" aria-hidden="true">🔒</span>
        <h3>${material.name}</h3>
        <p>Coming Soon</p>
      </article>
    `;
  }

  function renderChips() {
    chipRail.innerHTML = categories.map((category) => {
      const active = category === activeCategory ? " active" : "";
      return `<button class="category-chip${active}" type="button" data-category="${category}">${category}</button>`;
    }).join("");
  }

  function renderMaterials() {
    const visible = materials.filter((material) => matchesCategory(material) && matchesSearch(material));
    const active = visible.filter((material) => material.status === "active");
    const locked = materials.filter((material) => {
      return material.status === "coming-soon"
        && (activeCategory === "Indische Materials" || activeCategory === "All")
        && matchesSearch(material);
    });

    grid.innerHTML = active.length
      ? active.map(materialCard).join("")
      : `<p class="library-empty">No active materials match this view.</p>`;

    comingSoonGrid.innerHTML = locked.map(lockedCard).join("");
    document.body.classList.toggle("show-indische-only", activeCategory === "Indische Materials");
  }

  function fieldList(title, items) {
    const list = toList(items);
    return `
      <section class="detail-field">
        <h3>${title}</h3>
        <p>${list.join(", ")}</p>
      </section>
    `;
  }

  function openMaterial(id) {
    const material = materials.find((item) => item.id === id);
    if (!material || material.status !== "active") return;

    modalPanel.innerHTML = `
      <div class="detail-heading">
        <div class="detail-icon" aria-hidden="true">${materialIconMarkup(material)}</div>
        <div>
          <p class="detail-kicker">${material.type}</p>
          <h2>${material.name}</h2>
        </div>
      </div>
      <div class="detail-grid">
        ${fieldList("Family", material.families)}
        ${fieldList("Mood", material.mood)}
        ${fieldList("Suggested Role", material.suggestedRole)}
        ${fieldList("Best Used For", material.bestUsedFor)}
        ${fieldList("Pairs Well With", material.pairsWellWith)}
        ${fieldList("Avoid If", material.avoidIf)}
      </div>
      <section class="detail-description">
        <h3>Description</h3>
        <p>${material.description}</p>
      </section>
    `;

    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("library-modal-open");
    closeButton.focus();
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("library-modal-open");
  }

  renderChips();
  renderMaterials();

  chipRail.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-category]");
    if (!chip) return;
    activeCategory = chip.dataset.category;
    renderChips();
    renderMaterials();
  });

  searchInput.addEventListener("input", (event) => {
    query = normalize(event.target.value);
    renderMaterials();
  });

  grid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-open-material]");
    if (!card) return;
    openMaterial(card.dataset.openMaterial);
  });

  grid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-open-material]");
    if (!card) return;
    event.preventDefault();
    openMaterial(card.dataset.openMaterial);
  });

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
  });
}());
