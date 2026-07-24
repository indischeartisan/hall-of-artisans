(function () {
try {
if (window.__hoaArtisanBenchCleanup) window.__hoaArtisanBenchCleanup();
const bridgeController = new AbortController();
window.__hoaArtisanBenchCleanup = () => bridgeController.abort();
const { concentrations, materials } = window.fragranceData;
const { autoBalance, calculateLayerTotals, calculateTotal, checkFormula, dominantDirections, formulaLayer, generateBrief, generateName, generateSuggestedNames, getMaterial, materialLayers } = window.formulaEngine;

let state = {
  concentration: 'edp',
  perfumeName: '',
  nameEdited: false,
  suggestedNames: [],
  lastBrief: null,
  formula: []
};

function buildBenchSnapshot() {
  const check = checkFormula(state.formula, state.concentration);
  return {
    concentration: state.concentration,
    perfumeName: state.perfumeName,
    nameEdited: state.nameEdited,
    suggestedNames: [...state.suggestedNames],
    formula: state.formula.map((item) => ({ id: item.id, layer: item.layer, percent: Number(item.percent) })),
    formulaMetadata: {
      concentration: state.concentration,
      total: check.total,
      layerTotals: { top: check.layerTotals.top || 0, heart: check.layerTotals.heart || 0, base: check.layerTotals.base || 0 },
      profile: { ...check.profile },
      warnings: [...check.warnings],
      positives: [...check.positives]
    },
    fragranceBrief: state.lastBrief ? { ...state.lastBrief } : null,
    storyCard: buildStoryCardData()
  };
}

function emitBenchState() {
  window.dispatchEvent(new CustomEvent('hoa:artisan-bench-state-change', { detail: buildBenchSnapshot() }));
}

function validLoadedState(value) {
  return value && typeof value === 'object' && typeof value.concentration === 'string' &&
    typeof value.perfumeName === 'string' && Array.isArray(value.formula) &&
    value.formula.every((item) => item && typeof item.id === 'string' && Number.isFinite(Number(item.percent)) && getMaterial(item.id));
}

window.addEventListener('hoa:artisan-bench-request-state', emitBenchState, { signal: bridgeController.signal });
window.addEventListener('hoa:artisan-bench-load-state', (event) => {
  if (!validLoadedState(event.detail)) return;
  state = {
    concentration: event.detail.concentration,
    perfumeName: event.detail.perfumeName,
    nameEdited: Boolean(event.detail.nameEdited),
    suggestedNames: Array.isArray(event.detail.suggestedNames) ? event.detail.suggestedNames.filter((name) => typeof name === 'string') : [],
    lastBrief: event.detail.fragranceBrief || null,
    formula: event.detail.formula.map((item) => ({ id: item.id, layer: item.layer, percent: Number(item.percent) }))
  };
  updateAll();
  renderBrief();
  renderMessages();
  emitBenchState();
}, { signal: bridgeController.signal });

let addTargetLayer = 'top';
let storyCardRenderTimer = 0;
let storyCardRenderId = 0;
let openMaterialId = null;
let openCategoryName = null;

const $ = (id) => document.getElementById(id);
const layerDefaultPercent = { top: 5, heart: 10, base: 15 };
const directionLabels = ['Fresh', 'Green', 'Floral', 'Gourmand', 'Woody', 'Powdery', 'Clean', 'Dark', 'Atmospheric'];
const storyCard = window.storyCardGenerator;
const materialIconMap = {
  Citrus: '🍋',
  Fruity: '🍐',
  Floral: '🌹',
  Green: '☘',
  'Tea & Aromatic': '🍃',
  Spicy: '✦',
  Gourmand: '✧',
  Woods: '🪵',
  Earthy: '⌁',
  'Amber & Resin': '◆',
  Musk: '⚗',
  'Marine & Air': '◌',
  'Leather & Tobacco': '◈',
  Powdery: '✺',
  Atmospheric: '☾'
};

function selectedConcentration() {
  return concentrations.find((item) => item.id === state.concentration) || concentrations[1];
}

function renderConcentrations() {
  $('concentrationButtons').innerHTML = concentrations.map((item) => (
    `<button class="choice-button ${state.concentration === item.id ? 'active' : ''}" data-concentration="${item.id}">${item.name}</button>`
  )).join('');

  const selected = selectedConcentration();
  $('concentrationDescription').textContent = selected.description;
  Object.entries(selected.guidance).forEach(([layer, range]) => {
    const target = document.querySelector(`[data-range="${layer}"]`);
    if (target) target.textContent = `${range[0]}-${range[1]}%`;
  });
}

function currentProfile() {
  return checkFormula(state.formula, state.concentration).profile;
}

function renderFormulaDirection() {
  const profile = currentProfile();
  const activeLabels = state.formula.length ? dominantDirections(profile, 5) : [];
  $('formulaDirection').innerHTML = activeLabels.length ? activeLabels.map((label) => {
    const key = label === 'Gourmand' ? 'sweetness' : label === 'Dark' ? 'darkness' : label === 'Atmospheric' ? 'strangeness' : label.toLowerCase();
    const value = profile[key] || 0;
    return `<span class="direction-chip active">
      <strong>${label}</strong>
      <em>${value}%</em>
    </span>`;
  }).join('') : '<span class="direction-empty">Detected from your selected materials.</span>';
}

function ensurePerfumeName({ force = false } = {}) {
  if (force) {
    state.perfumeName = generateName(state.formula);
    state.nameEdited = true;
  }
  $('perfumeNameInput').value = state.perfumeName;
  $('nextPerfumeName').textContent = state.perfumeName || 'Untitled creation';
}

function renderSuggestedNames(names = state.suggestedNames) {
  $('suggestedNames').innerHTML = names.length ? names.map((name) => (
    `<button type="button" class="suggested-name" data-suggested-name="${name}">${name}</button>`
  )).join('') : '';
}

function refreshNameSuggestions() {
  state.suggestedNames = generateSuggestedNames(state.formula, 5);
  renderSuggestedNames();
}

function getPerfumerIdentity() {
  try {
    const stored = localStorage.getItem('hallArtisanProfile') || localStorage.getItem('hallOfArtisans.perfumerId') || localStorage.getItem('hallOfArtisans.artisanId');
    if (!stored) return { hasPerfumerId: false };
    const data = JSON.parse(stored);
    const artisanId = data.artisanId || data.perfumerId || '';
    return {
      hasPerfumerId: Boolean(artisanId),
      creatorName: data.fullName || data.name || data.creatorName || 'Guest Perfumer',
      artisanId,
      archiveNo: data.archiveNo || `HOA-2026-${String(Math.abs(hashText(artisanId || data.name || 'guest')) % 90000 + 10000).padStart(5, '0')}`
    };
  } catch (error) {
    return { hasPerfumerId: false };
  }
}

function hashText(text) {
  return String(text).split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function sentenceCase(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function topMaterials(limit = 4) {
  return [...state.formula]
    .sort((a, b) => b.percent - a.percent)
    .map((item) => getMaterial(item.id))
    .filter(Boolean)
    .slice(0, limit);
}

function buildConceptLine(directions) {
  const has = (label) => directions.includes(label);
  if (has('Green') && has('Clean')) return 'A quiet morning in a glasshouse.';
  if (has('Dark') && has('Woody')) return 'A shadowed walk through polished woods.';
  if (has('Floral') && has('Powdery')) return 'Soft petals resting on old parchment.';
  if (has('Gourmand')) return 'A golden sweetness remembered after dusk.';
  if (has('Fresh')) return 'Clear air moving through sunlit leaves.';
  return 'A composed memory from The Hall.';
}

function buildStoryDescription(materialsList, directions) {
  const names = materialsList.map((item) => item.name.toLowerCase());
  if (directions.includes('Green') && names.some((name) => name.includes('tea'))) {
    return 'Fresh tea leaves, sunlight on wet plants, and soft woods lingering in the air.';
  }
  if (directions.includes('Dark')) {
    return `${names.slice(0, 3).join(', ') || 'deep notes'} unfold with quiet warmth and a long polished trail.`;
  }
  return `${names.slice(0, 3).join(', ') || 'selected materials'} gather into a balanced trail with a memorable drydown.`;
}

function buildDirectionTags(profile, brief) {
  const tags = dominantDirections(profile, 5);
  const hasTea = state.formula.some((item) => /tea/i.test(getMaterial(item.id)?.name || ''));
  const result = [];
  tags.forEach((tag) => {
    if (result.length < 5 && !result.includes(tag)) result.push(tag);
  });
  if (hasTea && !result.includes('Tea')) result.splice(Math.min(2, result.length), 0, 'Tea');
  if (brief?.olfactiveFamily) {
    brief.olfactiveFamily.split(',').map((item) => item.trim()).forEach((tag) => {
      if (result.length < 5 && tag && !result.includes(tag)) result.push(tag);
    });
  }
  return result.slice(0, 5);
}

function buildStoryCardData() {
  ensurePerfumeName();
  const brief = generateBrief(state.formula, state.concentration, state.perfumeName || 'Untitled Creation');
  const profile = checkFormula(state.formula, state.concentration).profile;
  const directions = state.formula.length ? dominantDirections(profile, 5) : [];
  const materialsList = topMaterials(5);
  return {
    isEmpty: !state.formula.length && !state.perfumeName,
    concentration: selectedConcentration().label,
    perfumeName: state.perfumeName,
    conceptLine: buildConceptLine(directions),
    description: buildStoryDescription(materialsList, directions),
    directionTags: state.formula.length ? buildDirectionTags(profile, brief) : [],
    profile,
    notes: brief.notes,
    identity: getPerfumerIdentity()
  };
}

function updateStoryCardActions() {
  const isAuthenticated = window.__hoaArtisanBenchAuthenticated === true;
  const shareButton = $('shareStoryCard');
  const previewMessage = 'Sign in or register to share this Story Card.';
  $('downloadStoryCard').disabled = false;
  $('downloadStoryCard').classList.remove('locked');
  if (shareButton) {
    shareButton.disabled = !isAuthenticated;
  }
  $('storyCardMessage').textContent = isAuthenticated ? 'Story Card sharing is available for your signed-in account.' : previewMessage;
}

window.addEventListener('hoa:artisan-bench-auth-change', updateStoryCardActions, { signal: bridgeController.signal });

async function renderStoryCardPreview() {
  if (!storyCard || !$('storyCardPreview')) return;
  const renderId = ++storyCardRenderId;
  try {
    const canvas = await storyCard.renderPreview($('storyCardPreview'), buildStoryCardData());
    if (renderId !== storyCardRenderId) return;
    canvas.setAttribute('aria-label', 'Fragrance Brief Story Card preview');
    updateStoryCardActions();
  } catch (error) {
    $('storyCardPreview').innerHTML = `<div class="message warn">Story card preview failed: ${error.message}</div>`;
  }
}

function scheduleStoryCardPreview() {
  window.clearTimeout(storyCardRenderTimer);
  storyCardRenderTimer = window.setTimeout(renderStoryCardPreview, 120);
}

function materialMatchesQuery(item, query) {
  if (!query) return true;
  const family = Array.isArray(item.family) ? item.family : [item.family];
  const haystack = [item.name, item.category, materialLayers(item).join(' '), item.description, ...(item.tags || []), ...family].join(' ').toLowerCase();
  return haystack.includes(query);
}

function layerLabel(item) {
  return materialLayers(item).map((layer) => layer.toUpperCase()).join(' / ');
}

function pairingLabel(item) {
  return (item.pairsWith || [])
    .map(getMaterial)
    .filter(Boolean)
    .slice(0, 3)
    .map((pair) => pair.name)
    .join(', ');
}

function renderMaterialLibrary() {
  const query = $('materialSearch')?.value?.toLowerCase().trim() || '';
  const grouped = materials.reduce((acc, item) => {
    if (!materialMatchesQuery(item, query)) return acc;
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const entries = Object.entries(grouped);
  $('categoryList').innerHTML = entries.length ? entries.map(([category, items]) => `
    <details class="category inner-panel" data-category="${category}" ${openCategoryName === category ? 'open' : ''}>
      <summary>
        <span class="category-icon" aria-hidden="true"></span>
        <span class="category-name">${category}</span>
        <span class="category-count">${items.length}</span>
      </summary>
      ${items.map((item) => {
        const isOpen = openMaterialId === item.id;
        return `<article class="material-item inner-panel ${isOpen ? 'is-open' : ''}">
        <button type="button" class="material-info-button" data-toggle-material="${item.id}" aria-expanded="${isOpen}">
          <span>${item.name}</span>
          <small>${item.category} | ${layerLabel(item)}</small>
          <em>${(item.tags || []).slice(0, 3).join(' / ')}</em>
          <p>${item.description}</p>
          <small class="pairing-hint">Pairs with: ${pairingLabel(item) || 'artisan judgement'}</small>
        </button>
        <div class="material-layer-actions" aria-label="Add ${item.name} to formula">
          ${materialLayers(item).map((layer) => `<button type="button" class="mini-layer-button" data-material="${item.id}" data-layer="${layer}">${layer}</button>`).join('')}
        </div>
      </article>`;
      }).join('')}
    </details>
  `).join('') : '<div class="message warn">No basic materials match this search.</div>';
}

function renderFormula() {
  ['top', 'heart', 'base'].forEach((layer) => {
    const items = state.formula.filter((item) => formulaLayer(item) === layer);
    $(`${layer}List`).innerHTML = items.map((item) => {
      const material = getMaterial(item.id);
      const icon = materialIconMap[material.category] || '✦';
      return `<div class="selected-material inner-panel compact-material-row">
        <header>
          <span class="selected-material-name"><span class="material-note-icon" aria-hidden="true">${icon}</span>${material.name}</span>
          <span class="selected-material-controls"><span class="material-percent">${item.percent}%</span><button class="remove-btn panel-button" data-remove="${item.id}" aria-label="Remove ${material.name}">×</button></span>
        </header>
        <input type="range" min="1" max="60" value="${item.percent}" data-percent="${item.id}" aria-label="${material.name} percentage" />
      </div>`;
    }).join('');
  });

  const totals = calculateLayerTotals(state.formula);
  const total = calculateTotal(state.formula);
  $('topTotal').textContent = `${totals.top || 0}%`;
  $('heartTotal').textContent = `${totals.heart || 0}%`;
  $('baseTotal').textContent = `${totals.base || 0}%`;
  $('totalPercent').textContent = `${total}%`;
  document.querySelectorAll('[data-layer-total]').forEach((target) => {
    const layer = target.dataset.layerTotal;
    target.textContent = `${totals[layer] || 0}%`;
  });
  renderAnalysis();
  renderFormulaDirection();
  ensurePerfumeName();
  scheduleStoryCardPreview();
  emitBenchState();
}

function renderAnalysis() {
  const result = checkFormula(state.formula, state.concentration);
  const labels = ['freshness', 'sweetness', 'warmth', 'green', 'floral', 'woody', 'powdery', 'clean', 'darkness', 'strangeness', 'intensity', 'longevity'];
  $('profileBars').innerHTML = labels.map((key) => `
    <div class="bar">
      <div class="bar-label"><span>${key}</span><span>${result.profile[key]}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${result.profile[key]}%"></div></div>
    </div>
  `).join('');
}

function renderMessages() {
  if (!state.formula.length) {
    $('formulaMessages').innerHTML = '';
    return;
  }
  const result = checkFormula(state.formula, state.concentration);
  $('formulaMessages').innerHTML = [
    ...result.positives.map((text) => `<div class="message good">OK - ${text}</div>`),
    ...result.warnings.map((text) => `<div class="message warn">Check - ${text}</div>`)
  ].join('');
}

function renderDialog() {
  const query = $('dialogMaterialSearch')?.value?.toLowerCase().trim() || '';
  const available = materials.filter((item) => materialLayers(item).includes(addTargetLayer) && !state.formula.some((entry) => entry.id === item.id));
  const valid = available.filter((item) => materialMatchesQuery(item, query));
  const grouped = valid.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});
  $('dialogMaterials').innerHTML = valid.length ? Object.entries(grouped).map(([category, items]) => `
    <section class="dialog-material-group">
      <h3>${category}</h3>
      <div class="dialog-material-grid">
        ${items.map((item) => `
          <button class="panel-button dialog-material-option" value="${item.id}" data-dialog-material="${item.id}" data-layer="${addTargetLayer}">
            <span class="dialog-material-name">${item.name}</span>
            <span class="dialog-material-meta">${layerLabel(item)} note</span>
            <span class="dialog-material-description">${item.description}</span>
          </button>
        `).join('')}
      </div>
    </section>
  `).join('') : `<div class="message warn">${query ? 'No materials match this search.' : 'All materials in this layer are already in the formula.'}</div>`;
}

function journeyMaterials(layer) {
  return state.formula
    .filter((item) => formulaLayer(item) === layer)
    .map((item) => getMaterial(item.id))
    .filter(Boolean);
}

function joinJourneyNames(items) {
  const names = items.map((item) => item.name);
  if (!names.length) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

const journeyFamilyFacets = {
  Citrus: 'sparkling citrus',
  Fruity: 'ripe fruit',
  Floral: 'petal softness',
  Green: 'crisp botanical greens',
  'Tea & Aromatic': 'steeped aromatic freshness',
  Spicy: 'radiant spice',
  Gourmand: 'creamy gourmand warmth',
  Woods: 'dry woods',
  Earthy: 'rooted earthiness',
  'Amber & Resin': 'glowing resin',
  Musk: 'soft skin musk',
  'Marine & Air': 'cool mineral air',
  'Leather & Tobacco': 'smoky texture',
  Powdery: 'velvet powder',
  Atmospheric: 'cinematic atmosphere'
};

function joinJourneyWords(words) {
  if (words.length === 1) return words[0];
  if (words.length === 2) return `${words[0]} and ${words[1]}`;
  return `${words.slice(0, -1).join(', ')}, and ${words[words.length - 1]}`;
}

function compactJourneyNames(items) {
  if (items.length <= 6) return joinJourneyNames(items);
  return `${joinJourneyNames(items.slice(0, 4))}, and ${items.length - 4} other selected notes`;
}

function blendNarrative(items, stage, directions) {
  const facets = [...new Set(items.map((item) => journeyFamilyFacets[item.category] || 'distinctive texture'))];
  const effect = {
    opening: `Together, these facets merge into a ${directions} opening where each note supports the others rather than appearing separately.`,
    transition: `Together, the materials soften into one another, carrying the first impression toward a fuller and more connected heart.`,
    signature: `Together, these notes form the perfume's recognisable signature on skin, balancing their individual characters into one continuous impression.`,
    drydown: `Together, the materials fuse into a close-to-skin signature, leaving a layered trail instead of a single dominant note.`
  };
  if (items.length === 1) return `${items[0].name} leads with ${facets[0]}. ${effect[stage]}`;
  return `The blend of ${compactJourneyNames(items)} combines ${joinJourneyWords(facets)}. ${effect[stage]}`;
}

function buildDrydownJourney(brief) {
  const top = journeyMaterials('top');
  const heart = journeyMaterials('heart');
  const base = journeyMaterials('base');
  const signature = [...heart, ...base];
  const directions = dominantDirections(brief.profile, 3).map((item) => item.toLowerCase()).join(', ') || 'balanced';
  const concentration = selectedConcentration().name;

  return [
    {
      time: '0–15 min',
      label: 'Opening',
      cue: 'First impression',
      text: top.length
        ? blendNarrative(top, 'opening', directions)
        : 'The opening stays deliberately quiet, allowing the composition to reveal itself without a sharp first flash.',
      detail: `Projection · ${top.length ? 'bright and noticeable' : 'soft and close'}`
    },
    {
      time: '30 min–2h',
      label: 'Early Heart',
      cue: 'The transition',
      text: heart.length
        ? `As the opening softens, ${blendNarrative(heart, 'transition', directions)}`
        : 'The opening eases gradually into the base, creating a linear and minimal evolution on skin.',
      detail: `Presence · ${heart.length ? 'rounded and expressive' : 'clean and understated'}`
    },
    {
      time: '2–6h',
      label: 'Heart',
      cue: 'Signature on skin',
      text: `The fragrance now reads as ${directions}. ${signature.length ? blendNarrative(signature, 'signature', directions) : 'Its central character becomes smoother as the base takes more space.'}`,
      detail: `Wear · ${concentration} with a ${brief.profile.longevity >= 60 ? 'lasting' : 'gentle'} presence`
    },
    {
      time: '6h+',
      label: 'Drydown',
      cue: 'Lasting impression',
      text: base.length
        ? blendNarrative(base, 'drydown', directions)
        : 'Without a dedicated base, the fragrance fades into a lighter skin scent and may have a shorter final trail.',
      detail: `Trail · ${base.length ? 'intimate, warm, and persistent' : 'light and fleeting'}`
    }
  ];
}

function renderBrief() {
  ensurePerfumeName();
  if (!state.formula.length && !state.perfumeName) {
    state.lastBrief = null;
    $('drydownTimeline').innerHTML = '<div class="message warn">Add materials to see the drydown simulation.</div>';
    $('briefOutput').innerHTML = 'Add materials and enter a perfume name to generate a fragrance brief.';
    updateStoryCardActions();
    scheduleStoryCardPreview();
    emitBenchState();
    return;
  }

  const brief = generateBrief(state.formula, state.concentration, state.perfumeName || 'Untitled Creation');
  state.lastBrief = brief;
  $('drydownTimeline').innerHTML = buildDrydownJourney(brief).map((item) => (
    `<div class="timeline-card inner-panel"><strong>${item.time}</strong><span class="journey-cue">${item.cue}</span><h3>${item.label}</h3><p>${item.text}</p><small class="journey-detail">${item.detail}</small></div>`
  )).join('');

  $('briefOutput').innerHTML = `
    <h3>${brief.perfumeName}</h3>
    <p><strong>${brief.olfactiveFamily}</strong> | ${brief.concentration}</p>
    <p>${brief.concept}</p>
    <hr>
    <p><strong>Top Notes:</strong> ${brief.notes.top.join(', ') || '-'}</p>
    <p><strong>Heart Notes:</strong> ${brief.notes.heart.join(', ') || '-'}</p>
    <p><strong>Base Notes:</strong> ${brief.notes.base.join(', ') || '-'}</p>
    <hr>
    <p><strong>Internal Perfumer Brief:</strong><br>${brief.internalBrief}</p>
  `;
  updateStoryCardActions();
  scheduleStoryCardPreview();
  emitBenchState();
}

function addMaterialToFormula(materialId, targetLayer) {
  if (state.formula.some((item) => item.id === materialId)) {
    $('formulaMessages').innerHTML = '<div class="message warn">This material is already in the formula.</div>';
    return;
  }

  const material = getMaterial(materialId);
  if (!material) return;
  const layer = materialLayers(material).includes(targetLayer) ? targetLayer : materialLayers(material)[0];
  state.formula.push({ id: materialId, layer, percent: layerDefaultPercent[layer] || 10 });
  renderFormula();
}

function updateAll() {
  renderConcentrations();
  renderFormulaDirection();
  renderMaterialLibrary();
  renderFormula();
  ensurePerfumeName();
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;

  const concentration = target.dataset.concentration;
  if (concentration) {
    state.concentration = concentration;
    updateAll();
  }

  const toggleMaterialId = target.dataset.toggleMaterial;
  if (toggleMaterialId) {
    openMaterialId = openMaterialId === toggleMaterialId ? null : toggleMaterialId;
    renderMaterialLibrary();
    return;
  }

  const materialId = target.dataset.material;
  if (materialId) addMaterialToFormula(materialId, target.dataset.layer);

  const suggestedName = target.dataset.suggestedName;
  if (suggestedName) {
    state.perfumeName = suggestedName;
    state.nameEdited = true;
    $('perfumeNameInput').value = state.perfumeName;
    $('nextPerfumeName').textContent = state.perfumeName;
    renderBrief();
  }

  const removeId = target.dataset.remove;
  if (removeId) {
    state.formula = state.formula.filter((item) => item.id !== removeId);
    renderFormula();
  }

  const addLayer = target.dataset.add;
  if (addLayer) {
    addTargetLayer = addLayer;
    $('dialogMaterialSearch').value = '';
    renderDialog();
    $('materialDialog').showModal();
    window.setTimeout(() => $('dialogMaterialSearch').focus(), 0);
  }

  const dialogMaterial = target.dataset.dialogMaterial;
  if (dialogMaterial) {
    event.preventDefault();
    addMaterialToFormula(dialogMaterial, target.dataset.layer || addTargetLayer);
    $('materialDialog').close();
  }

  if (target.classList.contains('locked')) {
    ensurePerfumeName();
    const action = target.textContent.toLowerCase().includes('story') ? 'Story Card' : 'Make It Real submission';
    const message = action === 'Story Card' ? 'Create your Perfumer ID to download the 1080 × 1920 PNG story card.' : `${action} will use "${state.perfumeName}" after Perfumer ID login is enabled.`;
    $('formulaMessages').innerHTML = `<div class="message warn">${message}</div>`;
    if ($('storyCardMessage')) $('storyCardMessage').textContent = message;
  }
}, { signal: bridgeController.signal });

document.addEventListener('toggle', (event) => {
  if (!event.target.matches('.category')) return;
  if (!event.target.open) {
    if (openCategoryName === event.target.dataset.category) openCategoryName = null;
    return;
  }
  openCategoryName = event.target.dataset.category;
  document.querySelectorAll('.category[open]').forEach((category) => {
    if (category !== event.target) category.removeAttribute('open');
  });
}, { capture: true, signal: bridgeController.signal });

document.addEventListener('input', (event) => {
  const percentId = event.target.dataset.percent;
  if (percentId) {
    state.formula = state.formula.map((item) => (
      item.id === percentId ? { ...item, percent: Number(event.target.value) } : item
    ));
    renderFormula();
  }

  if (event.target.id === 'materialSearch') renderMaterialLibrary();
  if (event.target.id === 'dialogMaterialSearch') renderDialog();

  if (event.target.id === 'perfumeNameInput') {
    state.perfumeName = event.target.value.trim();
    state.nameEdited = true;
    if (!state.perfumeName) {
      state.suggestedNames = [];
      renderSuggestedNames();
    }
    $('nextPerfumeName').textContent = state.perfumeName || 'Untitled creation';
    renderBrief();
  }
}, { signal: bridgeController.signal });

$('suggestNames').addEventListener('click', () => {
  refreshNameSuggestions();
});

$('randomizeName').addEventListener('click', () => {
  const names = generateSuggestedNames(state.formula, 8);
  const choice = names[Math.floor(Math.random() * names.length)] || generateName(state.formula);
  state.perfumeName = choice;
  state.nameEdited = true;
  $('perfumeNameInput').value = choice;
  $('nextPerfumeName').textContent = choice;
  state.suggestedNames = names.slice(0, 5);
  renderSuggestedNames();
  renderBrief();
});

$('autoBalance').addEventListener('click', () => {
  state.formula = autoBalance(state.formula);
  renderFormula();
});

$('clearFormula').addEventListener('click', () => {
  state.formula = [];
  state.perfumeName = '';
  state.nameEdited = false;
  state.suggestedNames = [];
  renderSuggestedNames();
  renderFormula();
  renderMessages();
  renderBrief();
});

$('checkFormula').addEventListener('click', renderMessages);

$('generateBrief').addEventListener('click', () => {
  renderMessages();
  renderBrief();
});

$('downloadStoryCard').addEventListener('click', async () => {
  try {
    const safeName = state.perfumeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'fragrance-brief';
    $('storyCardMessage').textContent = 'Exporting 1080 x 1920 story card...';
    await storyCard.downloadStoryCard(buildStoryCardData(), `fragrance-brief-${safeName}.png`);
    $('storyCardMessage').textContent = 'Your Fragrance Brief story card has been downloaded.';
  } catch (error) {
    $('storyCardMessage').textContent = `Download failed: ${error.message}`;
  }
});

$('shareStoryCard').addEventListener('click', async () => {
  if (window.__hoaArtisanBenchAuthenticated !== true) {
    $('storyCardMessage').textContent = 'Sign in or register to share this Story Card.';
    return;
  }
  try {
    const safeName = state.perfumeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'fragrance-brief';
    const filename = `fragrance-brief-${safeName}.png`;
    $('storyCardMessage').textContent = 'Preparing your Story Card...';
    const canvas = await storyCard.createStoryCardCanvas(buildStoryCardData());
    const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Unable to prepare the Story Card image.')), 'image/png'));
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: state.perfumeName || 'Fragrance Brief Story Card' });
      $('storyCardMessage').textContent = 'Your Story Card has been shared.';
    } else {
      await storyCard.downloadStoryCard(buildStoryCardData(), filename);
      $('storyCardMessage').textContent = 'Sharing is unavailable in this browser, so the Story Card was downloaded instead.';
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      $('storyCardMessage').textContent = 'Story Card sharing was cancelled.';
    } else {
      $('storyCardMessage').textContent = `Share failed: ${error.message}`;
    }
  }
});

$('saveDraft').addEventListener('click', () => {
  emitBenchState();
  window.dispatchEvent(new CustomEvent('hoa:artisan-bench-save-request', { detail: buildBenchSnapshot() }));
});

window.addEventListener('hoa:artisan-bench-preview-request', () => {
  renderMessages();
  renderBrief();
  scheduleStoryCardPreview();
  emitBenchState();
}, { signal: bridgeController.signal });

updateAll();
renderMessages();
renderBrief();
updateStoryCardActions();
scheduleStoryCardPreview();
emitBenchState();
window.dispatchEvent(new CustomEvent('hoa:artisan-bench-ready'));
} catch (error) {
  const target = document.getElementById('formulaMessages') || document.body;
  target.innerHTML = '<div class="message warn">Expert Lab data could not load: ' + error.message + '</div>';
  console.error(error);
}
})();

