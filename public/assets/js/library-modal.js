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
    return `
      <article class="library-card" data-material-id="${material.id}">
        <div class="library-card-ornament" aria-hidden="true"></div>
        <div class="material-illustration" aria-hidden="true">${materialIconMarkup(material)}</div>
        <h2>${material.name}</h2>
        <p class="material-family">${(material.families || [material.type])[0]}</p>
        <div class="material-tags">${tags}</div>
        <button class="library-open-button" type="button" data-open-material="${material.id}">Open</button>
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
    const button = event.target.closest("[data-open-material]");
    if (!button) return;
    openMaterial(button.dataset.openMaterial);
  });

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
  });
}());
