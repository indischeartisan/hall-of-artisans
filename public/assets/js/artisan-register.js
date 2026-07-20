const specialtyQuizGroups = [
  {
    id: "direction",
    label: "Scent Direction",
    options: ["Fresh", "Clean", "Green", "Floral", "Gourmand", "Woody", "Powdery", "Dark", "Experimental"],
  },
  {
    id: "mood",
    label: "Scent Mood",
    options: ["Bright", "Misty", "Warm", "Cold", "Nostalgic", "Elegant", "Mysterious", "Playful"],
  },
  {
    id: "style",
    label: "Artisan Style",
    options: ["Storyteller", "Explorer", "Collector", "Archivist", "Dreamer", "Composer", "Experimentalist", "Observer"],
  },
];

const specialtySelection = {
  direction: "Fresh",
  mood: "Bright",
  style: "Storyteller",
};

const idCardTemplate = {
  path: "assets/images/artisan-id-card-template.webp",
  width: 1080,
  height: 1920,
};

const idCardTextPositions = {
  name: { top: "52.75%", left: "36.4%", width: "49%", align: "left", fontSize: 34 },
  artisanId: { top: "59.48%", left: "36.4%", width: "49%", align: "left", fontSize: 32 },
  specialty: { top: "66.32%", left: "36.4%", width: "49%", align: "left", fontSize: 30 },
  status: { top: "73.08%", left: "36.4%", width: "49%", align: "left", fontSize: 30 },
  registeredWithin: { top: "80.62%", left: "36.4%", width: "49%", align: "left", fontSize: 30 },
};

let currentCardData = {
  name: "Farras Agung",
  artisanId: "HA-2026-0142",
  specialty: "Bright Fresh Storyteller",
  status: "Registered Artisan",
  registeredWithin: "Indische World",
};

const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const form = document.getElementById("artisanRegisterForm");
const specialtyDropdowns = document.getElementById("specialtyDropdowns");
const specialtyPreview = document.getElementById("specialtyPreview");
const formMessage = document.getElementById("formMessage");
const actionMessage = document.getElementById("actionMessage");
const downloadButton = document.getElementById("downloadCard");
const shareButton = document.getElementById("shareCard");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setMenu(open) {
  mainNav.classList.toggle("open", open);
  header.classList.toggle("menu-active", open);
  document.body.classList.toggle("nav-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 18);
}

function getSpecialty() {
  return `${specialtySelection.mood} ${specialtySelection.direction} ${specialtySelection.style}`;
}

function syncSpecialtyPreview() {
  const specialty = getSpecialty();
  specialtyPreview.textContent = specialty;
  updateCard({ specialty });
}

function closeSpecialtyDropdowns(except) {
  specialtyDropdowns.querySelectorAll(".specialty-select").forEach((select) => {
    if (select === except) return;

    select.classList.remove("open");
    select.querySelector(".specialty-select-toggle").setAttribute("aria-expanded", "false");
    select.querySelector(".specialty-select-menu").hidden = true;
  });
}

function setSpecialtyDropdown(groupId, value) {
  specialtySelection[groupId] = value;
  const select = specialtyDropdowns.querySelector(`[data-group="${groupId}"]`);
  if (!select) return;

  select.querySelector(".specialty-selected").textContent = value;
  select.querySelectorAll(".specialty-option").forEach((option) => {
    option.classList.toggle("active", option.dataset.value === value);
  });
  syncSpecialtyPreview();
}

function renderSpecialtyDropdowns() {
  specialtyDropdowns.innerHTML = specialtyQuizGroups.map((group) => `
    <div class="specialty-select" data-group="${group.id}">
      <span class="specialty-select-label">${group.label}</span>
      <button class="specialty-select-toggle" type="button" aria-expanded="false">
        <span class="specialty-selected">${specialtySelection[group.id]}</span>
        <span class="specialty-caret" aria-hidden="true"></span>
      </button>
      <div class="specialty-select-menu" hidden>
        ${group.options.map((option) => `
          <button class="specialty-option${specialtySelection[group.id] === option ? " active" : ""}" type="button" data-value="${option}">
            ${option}
          </button>
        `).join("")}
      </div>
    </div>
  `).join("");

  specialtyDropdowns.querySelectorAll(".specialty-select-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const select = toggle.closest(".specialty-select");
      const menu = select.querySelector(".specialty-select-menu");
      const willOpen = !select.classList.contains("open");

      closeSpecialtyDropdowns(select);
      select.classList.toggle("open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
      menu.hidden = !willOpen;
    });
  });

  specialtyDropdowns.querySelectorAll(".specialty-option").forEach((option) => {
    option.addEventListener("click", () => {
      const select = option.closest(".specialty-select");
      setSpecialtyDropdown(select.dataset.group, option.dataset.value);
      closeSpecialtyDropdowns();
    });
  });
}

function createMockArtisanId(name, email) {
  // Mock only: later persistence should replace this with a backend/database sequence.
  const source = `${name.trim().toLowerCase()}|${email.trim().toLowerCase()}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) % 9000;
  }
  return `HA-2026-${String(1000 + hash).padStart(4, "0")}`;
}

function applyIdCardTextPositions() {
  const card = document.getElementById("artisanCard");
  const previewWidth = card ? card.getBoundingClientRect().width : 330;

  Object.entries(idCardTextPositions).forEach(([key, position]) => {
    const element = document.querySelector(`.id-card-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`);
    if (!element) return;

    element.style.top = position.top;
    element.style.left = position.left;
    element.style.width = position.width;
    element.style.textAlign = position.align;
    element.style.fontSize = `${(position.fontSize / idCardTemplate.width) * previewWidth}px`;
  });
}

function ArtisanIdCardTemplate(data) {
  return {
    name: data.name,
    artisanId: data.artisanId,
    specialty: data.specialty,
    status: data.status,
    registeredWithin: data.registeredWithin,
  };
}

function updateCard(nextData) {
  currentCardData = ArtisanIdCardTemplate({
    ...currentCardData,
    ...nextData,
  });

  document.getElementById("cardName").textContent = currentCardData.name;
  document.getElementById("cardId").textContent = currentCardData.artisanId;
  document.getElementById("cardSpecialty").textContent = currentCardData.specialty;
  document.getElementById("cardStatus").textContent = currentCardData.status;
  document.getElementById("cardWithin").textContent = currentCardData.registeredWithin;
  document.getElementById("welcomeName").textContent = currentCardData.name;
}

function handleSubmit(event) {
  event.preventDefault();
  formMessage.textContent = "";

  if (!form.checkValidity()) {
    formMessage.textContent = "Please complete the required register fields first.";
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const name = data.get("fullName");
  const email = data.get("emailAddress");
  const artisanId = createMockArtisanId(name, email);

  updateCard({
    name,
    artisanId,
    specialty: getSpecialty(),
    status: "Registered Artisan",
    registeredWithin: "Indische World",
  });

  localStorage.setItem("hallOfArtisans.perfumerId", JSON.stringify({
    name,
    creatorName: name,
    artisanId,
    perfumerId: artisanId,
    status: "Registered Artisan",
    registeredWithin: "Indische World",
  }));

  formMessage.textContent = `Your preview Artisan ID has been created: ${artisanId}.`;
  document.getElementById("artisan-id-card").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
}

function showActionMessage(message) {
  actionMessage.textContent = message;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

function percentToPixel(value, base) {
  if (typeof value === "string" && value.endsWith("%")) {
    return (parseFloat(value) / 100) * base;
  }
  return Number.parseFloat(value);
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  lines.push(line);

  lines.forEach((textLine, index) => {
    context.fillText(textLine, x, y + index * lineHeight);
  });
}

async function exportArtisanIdCard({ share = false } = {}) {
  const previousDownloadText = downloadButton.textContent;
  const previousShareText = shareButton.textContent;

  try {
    downloadButton.disabled = true;
    shareButton.disabled = true;
    downloadButton.textContent = "Preparing Card...";
    if (share) shareButton.textContent = "Preparing Story...";
    showActionMessage("");

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const template = await loadImage(idCardTemplate.path);
    const canvas = document.createElement("canvas");
    canvas.width = idCardTemplate.width;
    canvas.height = idCardTemplate.height;

    const context = canvas.getContext("2d");
    context.drawImage(template, 0, 0, canvas.width, canvas.height);
    context.fillStyle = "#183020";
    context.textBaseline = "middle";
    context.font = "38px Georgia, Garamond, 'Times New Roman', serif";

    Object.entries(idCardTextPositions).forEach(([key, position]) => {
      const value = currentCardData[key];
      const x = percentToPixel(position.left, canvas.width);
      const y = percentToPixel(position.top, canvas.height);
      const maxWidth = percentToPixel(position.width, canvas.width);
      const fontSize = position.fontSize;

      context.font = `${fontSize}px Georgia, Garamond, 'Times New Roman', serif`;
      context.textAlign = position.align || "left";
      drawWrappedText(context, value, x, y, maxWidth, fontSize * 1.08);
    });

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("The browser could not create the PNG file."));
      }, "image/png");
    });

    const filename = `artisan-id-${currentCardData.artisanId}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    if (share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Artisan ID Card",
        text: "My Hall of Artisans ID Card",
        files: [file],
      });
      showActionMessage("Your Artisan ID Card is ready to share.");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showActionMessage(share
      ? "Download the card and upload it manually to Instagram Story."
      : "Your Artisan ID Card has been downloaded.");
  } catch (error) {
    showActionMessage("Export failed. Please try again after the template finishes loading.");
    console.error(error);
  } finally {
    downloadButton.disabled = false;
    shareButton.disabled = false;
    downloadButton.textContent = previousDownloadText;
    shareButton.textContent = previousShareText;
  }
}

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", applyIdCardTextPositions);
updateHeader();
renderSpecialtyDropdowns();
applyIdCardTextPositions();
updateCard(currentCardData);
syncSpecialtyPreview();

menuToggle.addEventListener("click", () => setMenu(!mainNav.classList.contains("open")));
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainNav.classList.contains("open")) {
    setMenu(false);
    menuToggle.focus();
  }

  if (event.key === "Escape") {
    closeSpecialtyDropdowns();
  }
});

document.addEventListener("click", (event) => {
  if (!specialtyDropdowns.contains(event.target)) {
    closeSpecialtyDropdowns();
  }
});

form.addEventListener("submit", handleSubmit);

downloadButton.addEventListener("click", () => {
  exportArtisanIdCard();
});

shareButton.addEventListener("click", () => {
  exportArtisanIdCard({ share: true });
});

document.querySelectorAll("a[href]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    document.body.classList.add("page-leaving");
    window.setTimeout(() => {
      window.location.href = link.href;
    }, reduceMotion ? 0 : 260);
  });
});
