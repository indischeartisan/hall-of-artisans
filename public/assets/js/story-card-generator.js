(function () {
const STORY_CARD_WIDTH = 1080;
const STORY_CARD_HEIGHT = 1920;
const TEMPLATE_SRC = 'assets/images/fragrance-brief-story-template.webp';

const storyCardLayout = {
  concentration: { x: 540, y: 540 },
  perfumeName: { x: 540, y: 626, maxWidth: 760, maxLines: 2 },
  conceptLine: { x: 540, y: 770, maxWidth: 760 },
  description: { x: 540, y: 820, maxWidth: 650, lineHeight: 34, maxLines: 2 },
  direction: { y: 955, gap: 24, height: 42 },
  profile: { labelX: 210, barX: 370, percentX: 835, y: 1064, row: 31, width: 390, height: 11 },
  notes: {
    y: 1364,
    columns: [
      { title: 'TOP NOTES', x: 255, lineX: 232 },
      { title: 'HEART NOTES', x: 540, lineX: 517 },
      { title: 'BASE NOTES', x: 825, lineX: 802 }
    ]
  },
  createdBy: { x: 300, y: 1616 },
  archiveNo: { x: 780, y: 1616 }
};

const profileLabels = [
  ['freshness', 'FRESHNESS'],
  ['sweetness', 'SWEETNESS'],
  ['warmth', 'WARMTH'],
  ['green', 'GREEN'],
  ['floral', 'FLORAL'],
  ['woody', 'WOODY'],
  ['clean', 'CLEAN'],
  ['darkness', 'DARKNESS'],
  ['strangeness', 'STRANGENESS']
];

let cachedTemplate;

function loadImage(src) {
  if (cachedTemplate) return Promise.resolve(cachedTemplate);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      cachedTemplate = image;
      resolve(image);
    };
    image.onerror = () => reject(new Error(`Unable to load story card template: ${src}`));
    image.src = src;
  });
}

function setupText(ctx, size, weight = '400', color = '#123022', spacing = 0) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = `${spacing}px`;
}

function wordsFor(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
}

function wrapLines(ctx, text, maxWidth, maxLines = 3) {
  const words = wordsFor(text);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const clipped = lines.slice(0, maxLines);
    let last = clipped[clipped.length - 1];
    while (last.length && ctx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1).trim();
    }
    clipped[clipped.length - 1] = `${last}...`;
    return clipped;
  }
  return lines;
}

function drawCenteredLines(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  wrapLines(ctx, text, maxWidth, maxLines).forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

function drawSectionTitle(ctx, text, y) {
  setupText(ctx, 21, '700', '#7a5525', 2);
  ctx.fillText(text, 540, y);
}

function drawPerfumeTitle(ctx, name) {
  const title = String(name || '').trim().toUpperCase();
  if (!title) return;
  let size = title.length > 22 ? 54 : 64;
  setupText(ctx, size, '700', '#0f3021', 7);
  let lines = wrapLines(ctx, title, storyCardLayout.perfumeName.maxWidth, storyCardLayout.perfumeName.maxLines);
  while (lines.some((line) => ctx.measureText(line).width > storyCardLayout.perfumeName.maxWidth) && size > 42) {
    size -= 2;
    setupText(ctx, size, '700', '#0f3021', 7);
    lines = wrapLines(ctx, title, storyCardLayout.perfumeName.maxWidth, storyCardLayout.perfumeName.maxLines);
  }
  const startY = storyCardLayout.perfumeName.y - (lines.length - 1) * 36;
  lines.forEach((line, index) => ctx.fillText(line, 540, startY + index * 76));
}

function drawDirectionTags(ctx, tags) {
  const cleanTags = (tags || []).slice(0, 5).map((tag) => String(tag).toUpperCase());
  const widths = cleanTags.map((tag) => Math.max(108, ctx.measureText(tag).width + 46));
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + storyCardLayout.direction.gap * Math.max(cleanTags.length - 1, 0);
  let x = 540 - totalWidth / 2;

  setupText(ctx, 18, '700', '#112b1e', 1.4);
  cleanTags.forEach((tag, index) => {
    const width = widths[index];
    const y = storyCardLayout.direction.y;
    ctx.strokeStyle = 'rgba(122, 85, 37, 0.85)';
    ctx.fillStyle = 'rgba(244, 231, 204, 0.52)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, width, storyCardLayout.direction.height, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#112b1e';
    ctx.fillText(tag, x + width / 2, y + 28);
    x += width + storyCardLayout.direction.gap;
  });
}

function drawProfile(ctx, profile) {
  drawSectionTitle(ctx, 'SCENT PROFILE', 1030);
  profileLabels.forEach(([key, label], index) => {
    const y = storyCardLayout.profile.y + index * storyCardLayout.profile.row;
    const value = Math.max(0, Math.min(100, Number(profile?.[key] || 0)));
    ctx.textAlign = 'left';
    setupText(ctx, 18, '700', '#192618', 1.8);
    ctx.textAlign = 'left';
    ctx.fillText(label, storyCardLayout.profile.labelX, y + 5);
    ctx.fillStyle = 'rgba(112, 81, 37, 0.2)';
    ctx.beginPath();
    ctx.roundRect(storyCardLayout.profile.barX, y - 8, storyCardLayout.profile.width, storyCardLayout.profile.height, 6);
    ctx.fill();
    ctx.fillStyle = '#0b3827';
    ctx.beginPath();
    ctx.roundRect(storyCardLayout.profile.barX, y - 8, storyCardLayout.profile.width * (value / 100), storyCardLayout.profile.height, 6);
    ctx.fill();
    ctx.textAlign = 'left';
    setupText(ctx, 18, '700', '#192618', 0);
    ctx.textAlign = 'left';
    ctx.fillText(`${value}%`, storyCardLayout.profile.percentX, y + 5);
  });
}

function drawNotes(ctx, notes) {
  drawSectionTitle(ctx, 'KEY NOTES', 1326);
  storyCardLayout.notes.columns.forEach((column) => {
    setupText(ctx, 19, '700', '#7a5525', 1.4);
    ctx.fillText(column.title, column.x, storyCardLayout.notes.y);
  });

  ['top', 'heart', 'base'].forEach((layer, index) => {
    const column = storyCardLayout.notes.columns[index];
    const list = (notes?.[layer] || []).slice(0, 4);
    setupText(ctx, 18, '700', '#182319', 0.8);
    list.forEach((note, noteIndex) => {
      const y = storyCardLayout.notes.y + 45 + noteIndex * 34;
      ctx.fillText(String(note).toUpperCase(), column.x, y);
      ctx.fillText('+', column.lineX - 42, y);
    });
  });
}

function drawFooter(ctx, identity) {
  setupText(ctx, 21, '700', '#7a5525', 1.7);
  ctx.fillText('CREATED BY', storyCardLayout.createdBy.x, storyCardLayout.createdBy.y);
  ctx.fillText('HALL ARCHIVE NO.', storyCardLayout.archiveNo.x, storyCardLayout.archiveNo.y);

  const hasId = Boolean(identity?.hasPerfumerId);
  setupText(ctx, hasId ? 34 : 27, '700', '#102b1e', 1.1);
  ctx.fillText(hasId ? String(identity.creatorName || 'GUEST').toUpperCase() : 'PERFUMER ID', storyCardLayout.createdBy.x, storyCardLayout.createdBy.y + 58);
  setupText(ctx, 18, '700', '#6f4d22', 1.1);
  ctx.fillText(hasId ? 'GUEST PERFUMER' : 'REQUIRED', storyCardLayout.createdBy.x, storyCardLayout.createdBy.y + 92);

  ctx.strokeStyle = 'rgba(122, 85, 37, 0.78)';
  ctx.fillStyle = 'rgba(244, 231, 204, 0.42)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(640, storyCardLayout.archiveNo.y + 26, 278, 66, 5);
  ctx.fill();
  ctx.stroke();

  setupText(ctx, hasId ? 28 : 22, '700', '#102b1e', 1.2);
  ctx.fillText(hasId ? String(identity.archiveNo || 'HOA-2026-00001') : 'ARCHIVE NO.', storyCardLayout.archiveNo.x, storyCardLayout.archiveNo.y + 70);
  if (!hasId) {
    setupText(ctx, 17, '700', '#6f4d22', 1);
    ctx.fillText('PENDING', storyCardLayout.archiveNo.x, storyCardLayout.archiveNo.y + 100);
  }
}

async function createStoryCardCanvas(data) {
  const template = await loadImage(TEMPLATE_SRC);
  const canvas = document.createElement('canvas');
  canvas.width = STORY_CARD_WIDTH;
  canvas.height = STORY_CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(template, 0, 0, STORY_CARD_WIDTH, STORY_CARD_HEIGHT);
  if (data.isEmpty) return canvas;

  setupText(ctx, 20, '700', '#6f4d22', 1.8);
  ctx.fillText(String(data.concentration || 'EAU DE PARFUM').toUpperCase(), storyCardLayout.concentration.x, storyCardLayout.concentration.y);
  drawPerfumeTitle(ctx, data.perfumeName);

  setupText(ctx, 23, '700', '#6f4d22', 1.2);
  drawCenteredLines(ctx, String(data.conceptLine || 'A QUIET MORNING IN A GLASSHOUSE.').toUpperCase(), 540, storyCardLayout.conceptLine.y, storyCardLayout.conceptLine.maxWidth, 30, 1);
  setupText(ctx, 24, '400', '#1c1a13', 0);
  drawCenteredLines(ctx, data.description || 'Fresh tea leaves, sunlight on wet plants, and soft woods lingering in the air.', 540, storyCardLayout.description.y, storyCardLayout.description.maxWidth, storyCardLayout.description.lineHeight, storyCardLayout.description.maxLines);

  drawSectionTitle(ctx, 'FRAGRANCE DIRECTION', 920);
  setupText(ctx, 18, '700', '#112b1e', 1.4);
  drawDirectionTags(ctx, data.directionTags);
  drawProfile(ctx, data.profile);
  drawNotes(ctx, data.notes);
  drawFooter(ctx, data.identity);
  return canvas;
}

async function renderPreview(container, data) {
  const canvas = await createStoryCardCanvas(data);
  canvas.className = 'story-card-canvas';
  container.innerHTML = '';
  container.appendChild(canvas);
  return canvas;
}

async function downloadStoryCard(data, filename) {
  const canvas = await createStoryCardCanvas(data);
  const link = document.createElement('a');
  link.download = filename || 'fragrance-brief-story-card.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  return canvas;
}

window.storyCardGenerator = {
  STORY_CARD_WIDTH,
  STORY_CARD_HEIGHT,
  TEMPLATE_SRC,
  storyCardLayout,
  createStoryCardCanvas,
  renderPreview,
  downloadStoryCard
};
})();
