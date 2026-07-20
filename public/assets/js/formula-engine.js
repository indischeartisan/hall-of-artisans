(function () {
const { materials, concentrations } = window.fragranceData;

const profileKeys = ['freshness', 'sweetness', 'warmth', 'green', 'floral', 'woody', 'powdery', 'clean', 'darkness', 'strangeness', 'intensity', 'longevity'];

function getMaterial(id) {
  return materials.find((item) => item.id === id);
}

function materialLayers(material) {
  if (!material) return [];
  return Array.isArray(material.layer) ? material.layer : [material.layer];
}

function formulaLayer(item) {
  const material = getMaterial(item.id);
  return item.layer || materialLayers(material)[0];
}

function scoreToPercent(value) {
  const score = Number(value || 0);
  return score <= 10 ? score * 10 : score;
}

function calculateLayerTotals(formula) {
  return ['top', 'heart', 'base'].reduce((acc, layer) => {
    acc[layer] = formula
      .filter((item) => formulaLayer(item) === layer)
      .reduce((sum, item) => sum + Number(item.percent || 0), 0);
    return acc;
  }, {});
}

function calculateTotal(formula) {
  return formula.reduce((sum, item) => sum + Number(item.percent || 0), 0);
}

function autoBalance(formula) {
  const total = calculateTotal(formula);
  if (!total) return formula;

  const balanced = formula.map((item) => ({
    ...item,
    percent: Math.max(1, Math.round((Number(item.percent || 0) / total) * 100))
  }));

  const sumExceptLast = balanced.slice(0, -1).reduce((sum, item) => sum + item.percent, 0);
  return balanced.map((item, index) => (
    index === balanced.length - 1 ? { ...item, percent: Math.max(1, 100 - sumExceptLast) } : item
  ));
}

function calculateProfile(formula) {
  const total = calculateTotal(formula) || 1;
  const profile = Object.fromEntries(profileKeys.map((key) => [key, 0]));

  formula.forEach((item) => {
    const material = getMaterial(item.id);
    if (!material) return;
    profileKeys.forEach((key) => {
      profile[key] += (scoreToPercent(material[key]) * Number(item.percent || 0)) / total;
    });
  });

  return Object.fromEntries(profileKeys.map((key) => [key, Math.min(100, Math.round(profile[key]))]));
}

function checkFormula(formula, concentrationId) {
  const total = calculateTotal(formula);
  const layerTotals = calculateLayerTotals(formula);
  const concentration = concentrations.find((item) => item.id === concentrationId) || concentrations[1];
  const warnings = [];
  const positives = [];

  if (total !== 100) warnings.push(`Total is ${total}%. Balance it to exactly 100%.`);
  else positives.push('Formula total is balanced at 100%.');

  if ((layerTotals.top || 0) > 30) warnings.push(`Top is above 30% (${layerTotals.top || 0}%). The opening may feel too volatile.`);
  if ((layerTotals.base || 0) < 25) warnings.push(`Base is below 25% (${layerTotals.base || 0}%). The drydown may fade too quickly.`);
  if (!(layerTotals.base || 0)) warnings.push('The formula has no base notes.');
  if (!(layerTotals.heart || 0)) warnings.push('The formula has no heart notes.');

  ['top', 'heart', 'base'].forEach((layer) => {
    const [min, max] = concentration.guidance[layer];
    const value = layerTotals[layer] || 0;
    if (value < min) warnings.push(`${layer.toUpperCase()} is low (${value}%). Suggested range for ${concentration.name}: ${min}-${max}%.`);
    if (value > max) warnings.push(`${layer.toUpperCase()} is high (${value}%). Suggested range for ${concentration.name}: ${min}-${max}%.`);
  });

  const profile = calculateProfile(formula);
  if (profile.longevity >= 60) positives.push('Longevity direction is promising.');
  if (profile.intensity >= 75) warnings.push('Intensity is high. Consider softening with musk, woods, or powdery material.');
  if (formula.filter((item) => scoreToPercent(getMaterial(item.id)?.intensity) >= 75).length >= 3) warnings.push('Several high-intensity materials are selected. Use smaller percentages or add softer anchors.');
  if (formula.length >= 5) positives.push('The formula has enough material structure for a useful brief.');

  const selectedIds = new Set(formula.map((item) => item.id));
  const suggestions = Array.from(new Set(formula.flatMap((item) => getMaterial(item.id)?.pairsWith || [])))
    .filter((id) => !selectedIds.has(id))
    .map(getMaterial)
    .filter(Boolean)
    .slice(0, 4)
    .map((item) => item.name);

  if (suggestions.length) positives.push(`Pairing suggestions: ${suggestions.join(', ')}.`);
  if (warnings.length === 0) positives.push('Direction is clear and ready to generate a brief.');

  return { total, layerTotals, profile, warnings, positives };
}

function titleCase(text) {
  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dominantDirections(profile, limit = 3) {
  const map = {
    freshness: 'Fresh',
    green: 'Green',
    floral: 'Floral',
    sweetness: 'Gourmand',
    woody: 'Woody',
    powdery: 'Powdery',
    clean: 'Clean',
    darkness: 'Dark',
    strangeness: 'Atmospheric'
  };

  return Object.entries(map)
    .map(([key, label]) => ({ key, label, value: profile[key] || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((item) => item.label);
}

function materialPoetry(materialsByLayer, directions) {
  const top = materialsByLayer.top[0]?.name || '';
  const heart = materialsByLayer.heart[0]?.name || '';
  const base = materialsByLayer.base[0]?.name || '';
  const allNames = [...materialsByLayer.top, ...materialsByLayer.heart, ...materialsByLayer.base].map((item) => item.name);

  const anchor = allNames.find((name) => /tea|rose|violet|moss|green|garden|rain|forest|glass|mist|wood|vanilla|iris|fig/i.test(name)) || heart || top || base || 'Morning';
  const firstWord = anchor.split(' ')[0];
  const hasTea = allNames.some((name) => /tea|matcha|earl grey|oolong/i.test(name));
  const hasGreen = directions.includes('Green') || allNames.some((name) => /green|leaf|grass|mint|moss|basil/i.test(name));
  const hasFloral = directions.includes('Floral') || allNames.some((name) => /rose|violet|jasmine|floral|flower|iris|peony/i.test(name));
  const hasAtmosphere = directions.includes('Atmospheric') || allNames.some((name) => /mist|rain|air|library|glass|room|window|street/i.test(name));
  const hasWood = directions.includes('Woody') || allNames.some((name) => /wood|cedar|sandal|vetiver|moss|oud/i.test(name));

  return { top, heart, base, anchor, firstWord, hasTea, hasGreen, hasFloral, hasAtmosphere, hasWood };
}

function generateSuggestedNames(formula, count = 5) {
  const check = checkFormula(formula, 'edp');
  const directions = dominantDirections(check.profile, 3);
  const selected = formula
    .map((item) => ({ ...item, material: getMaterial(item.id) }))
    .filter((item) => item.material);
  const materialsByLayer = {
    top: selected.filter((item) => formulaLayer(item) === 'top').map((item) => item.material),
    heart: selected.filter((item) => formulaLayer(item) === 'heart').map((item) => item.material),
    base: selected.filter((item) => formulaLayer(item) === 'base').map((item) => item.material)
  };
  const poetry = materialPoetry(materialsByLayer, directions);
  const mainDirection = directions[0] || 'Fresh';
  const secondDirection = directions[1] || 'Floral';

  const pool = [
    poetry.hasTea ? 'Morning Tea Garden' : `${poetry.firstWord} Before Dawn`,
    poetry.hasGreen ? 'The Green Conservatory' : `${poetry.firstWord} Reverie`,
    poetry.hasAtmosphere ? 'Through The Glasshouse' : 'Glasshouse Reverie',
    poetry.hasWood ? 'Moss and Morning Light' : `${poetry.firstWord} Afternoon`,
    poetry.hasFloral ? 'Rose Before Dawn' : `${mainDirection} Reverie`,
    `${titleCase(secondDirection.toLowerCase())} After Rain`,
    poetry.hasGreen ? 'Forest Shower' : 'Sunlit Garden',
    `${poetry.firstWord} Under Glass`,
    'The Quiet Conservatory',
    `${poetry.firstWord} at First Light`,
    `${mainDirection} Room`,
    `${poetry.firstWord} and Morning Light`
  ];

  return Array.from(new Set(pool.filter(Boolean))).slice(0, count);
}

function generateName(formula) {
  return generateSuggestedNames(formula, 1)[0] || 'Morning Tea Garden';
}

function generateBrief(formula, concentrationId = 'edp', perfumeNameOverride = '') {
  const concentration = concentrations.find((item) => item.id === concentrationId) || concentrations[1];
  const check = checkFormula(formula, concentrationId);
  const selected = formula
    .map((item) => ({ ...item, material: getMaterial(item.id) }))
    .filter((item) => item.material);
  const byLayer = (layer) => selected.filter((item) => formulaLayer(item) === layer);
  const profile = check.profile;

  const dominantFamilies = dominantDirections(profile, 3);
  const perfumeName = perfumeNameOverride.trim() || generateName(formula);

  return {
    perfumeName,
    concentration: concentration.label,
    olfactiveFamily: dominantFamilies.join(' | '),
    concept: `${perfumeName} is a ${dominantFamilies.join(', ').toLowerCase()} composition created at The Hall of Artisans. The formula begins with ${byLayer('top').map((item) => item.material.name).join(', ') || 'a quiet opening'}, grows into ${byLayer('heart').map((item) => item.material.name).join(', ') || 'a soft heart'}, and settles into ${byLayer('base').map((item) => item.material.name).join(', ') || 'a subtle base'}.`,
    notes: {
      top: byLayer('top').map((item) => `${item.material.name} ${item.percent}%`),
      heart: byLayer('heart').map((item) => `${item.material.name} ${item.percent}%`),
      base: byLayer('base').map((item) => `${item.material.name} ${item.percent}%`)
    },
    drydown: [
      { time: '0-15 min', label: 'Opening', text: byLayer('top').length ? `The opening reveals ${byLayer('top').map((item) => item.material.name).join(', ')}.` : 'The opening is soft and restrained.' },
      { time: '30 min-2h', label: 'Early Heart', text: byLayer('heart').length ? `${byLayer('heart')[0].material.name} begins to define the heart.` : 'The heart remains minimal.' },
      { time: '2-6h', label: 'Heart', text: byLayer('heart').length ? 'The heart materials become rounder and more blended.' : 'The formula transitions gently.' },
      { time: '6h+', label: 'Drydown', text: byLayer('base').length ? `The base settles into ${byLayer('base').map((item) => item.material.name).join(', ')}.` : 'The drydown may fade quickly.' }
    ],
    profile,
    internalBrief: `Creation name: ${perfumeName}. Target: ${concentration.label}. Direction: ${dominantFamilies.join(', ')}. Formula balance: Top ${check.layerTotals.top || 0}%, Heart ${check.layerTotals.heart || 0}%, Base ${check.layerTotals.base || 0}%. This name should follow the creation into Hall Archive, Story Card, and Make It Real submission. Final formula should be refined and tested by Indische artisans/perfumers before production.`
  };
}


window.formulaEngine = {
  getMaterial,
  materialLayers,
  formulaLayer,
  calculateLayerTotals,
  calculateTotal,
  autoBalance,
  calculateProfile,
  checkFormula,
  dominantDirections,
  generateSuggestedNames,
  generateName,
  generateBrief
};
})();

