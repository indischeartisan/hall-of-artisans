(function () {
const STORY_CARD_WIDTH = 1080;
const STORY_CARD_HEIGHT = 1920;
const TEMPLATE_SRC = '/assets/images/fragrance-card-template.webp';

const storyCardLayout = {
  fragranceName: { x: 540, centerY: 662, maxWidth: 850, maxLines: 2, fontSize: 94, multiLineFontSize: 76, minFontSize: 54, lineHeight: 86 },
  creatorName: { x: 540, y: 814, maxWidth: 690, fontSize: 34, minFontSize: 23 },
  topNotes: { x: 540, centerY: 1068, maxWidth: 740, maxLines: 2, fontSize: 35, minFontSize: 25, lineHeight: 43 },
  heartNotes: { x: 540, centerY: 1355, maxWidth: 740, maxLines: 2, fontSize: 35, minFontSize: 25, lineHeight: 43 },
  baseNotes: { x: 540, centerY: 1630, maxWidth: 740, maxLines: 2, fontSize: 35, minFontSize: 25, lineHeight: 43 }
};

let cachedTemplate;

function loadImage(src) {
  if (cachedTemplate) return Promise.resolve(cachedTemplate);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => { cachedTemplate = image; resolve(image); };
    image.onerror = () => reject(new Error(`Unable to load fragrance card template: ${src}`));
    image.src = src;
  });
}

function normalizeNotes(value) {
  const withoutPercentages = (item) => String(item || '')
    .replace(/\s*[-–—:]?\s*\d+(?:[.,]\d+)?\s*%/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (Array.isArray(value)) return value.map(withoutPercentages).filter(Boolean).join(', ');
  return withoutPercentages(value).replace(/\s*,\s*/g, ', ');
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function setupText(ctx, size, { italic = false, weight = '400', letterSpacing = 0 } = {}) {
  ctx.fillStyle = '#173527';
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${letterSpacing}px`;
}

function wrapLines(ctx, text, maxWidth) {
  const words = normalizeText(text).split(' ').filter(Boolean);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || ctx.measureText(candidate).width <= maxWidth) current = candidate;
    else { lines.push(current); current = word; }
  });
  if (current) lines.push(current);
  return lines;
}

function fitText(ctx, text, layout, style) {
  let size = layout.fontSize;
  let lines = [];
  while (size >= layout.minFontSize) {
    setupText(ctx, size, style);
    lines = wrapLines(ctx, text, layout.maxWidth);
    const needsSmallerMultiline = lines.length > 1 && layout.multiLineFontSize && size > layout.multiLineFontSize;
    if (!needsSmallerMultiline && lines.length <= layout.maxLines && lines.every((line) => ctx.measureText(line).width <= layout.maxWidth)) break;
    size -= 2;
  }
  if (lines.length > layout.maxLines) {
    const kept = lines.slice(0, layout.maxLines);
    kept[layout.maxLines - 1] = lines.slice(layout.maxLines - 1).join(' ');
    while (kept[layout.maxLines - 1].length > 1 && ctx.measureText(kept[layout.maxLines - 1]).width > layout.maxWidth) {
      kept[layout.maxLines - 1] = kept[layout.maxLines - 1].slice(0, -1).trim();
    }
    lines = kept;
  }
  return { size, lines };
}

function drawCenteredBlock(ctx, text, layout, style) {
  const clean = normalizeText(text);
  if (!clean) return;
  const fitted = fitText(ctx, clean, layout, style);
  setupText(ctx, fitted.size, style);
  const lineHeight = Math.min(layout.lineHeight, fitted.size * 1.15);
  const startY = layout.centerY - ((fitted.lines.length - 1) * lineHeight) / 2;
  fitted.lines.forEach((line, index) => ctx.fillText(line, layout.x, startY + index * lineHeight));
}

function drawSingleLine(ctx, text, layout, style) {
  const clean = normalizeText(text);
  if (!clean) return;
  let size = layout.fontSize;
  setupText(ctx, size, style);
  while (ctx.measureText(clean).width > layout.maxWidth && size > layout.minFontSize) {
    size -= 2;
    setupText(ctx, size, style);
  }
  ctx.fillText(clean, layout.x, layout.y);
}

function resolveCardData(data) {
  const notes = data?.notes || {};
  return {
    isEmpty: Boolean(data?.isEmpty),
    fragranceName: data?.fragranceName || data?.perfumeName || '',
    creatorName: data?.creatorName || data?.identity?.creatorName || window.__hoaArtisanBenchCreatorName || 'Creator Name',
    topNotes: normalizeNotes(data?.topNotes ?? notes.top),
    heartNotes: normalizeNotes(data?.heartNotes ?? notes.heart),
    baseNotes: normalizeNotes(data?.baseNotes ?? notes.base)
  };
}

async function createStoryCardCanvas(data) {
  const template = await loadImage(TEMPLATE_SRC);
  const canvas = document.createElement('canvas');
  canvas.width = STORY_CARD_WIDTH;
  canvas.height = STORY_CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(template, 0, 0, STORY_CARD_WIDTH, STORY_CARD_HEIGHT);
  const card = resolveCardData(data);
  if (card.isEmpty) return canvas;
  drawCenteredBlock(ctx, card.fragranceName.toUpperCase(), storyCardLayout.fragranceName, { letterSpacing: 5 });
  drawSingleLine(ctx, `crafted by ${card.creatorName}`, storyCardLayout.creatorName, { italic: true, letterSpacing: 1 });
  drawCenteredBlock(ctx, card.topNotes, storyCardLayout.topNotes, { italic: true, letterSpacing: 1 });
  drawCenteredBlock(ctx, card.heartNotes, storyCardLayout.heartNotes, { italic: true, letterSpacing: 1 });
  drawCenteredBlock(ctx, card.baseNotes, storyCardLayout.baseNotes, { italic: true, letterSpacing: 1 });
  return canvas;
}

async function renderPreview(container, data) {
  const canvas = await createStoryCardCanvas(data);
  canvas.className = 'story-card-canvas';
  container.replaceChildren(canvas);
  return canvas;
}

async function downloadStoryCard(data, filename) {
  const canvas = await createStoryCardCanvas(data);
  const link = document.createElement('a');
  link.download = filename || 'fragrance-card.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  return canvas;
}

window.storyCardGenerator = { STORY_CARD_WIDTH, STORY_CARD_HEIGHT, TEMPLATE_SRC, storyCardLayout, normalizeNotes, resolveCardData, createStoryCardCanvas, renderPreview, downloadStoryCard };
})();
