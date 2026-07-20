const specialtyQuizGroups = [
  { id: "direction", label: "Scent Direction", options: ["Fresh", "Clean", "Green", "Floral", "Gourmand", "Woody", "Powdery", "Dark", "Experimental"] },
  { id: "mood", label: "Scent Mood", options: ["Bright", "Misty", "Warm", "Cold", "Nostalgic", "Elegant", "Mysterious", "Playful"] },
  { id: "style", label: "Artisan Style", options: ["Storyteller", "Explorer", "Collector", "Archivist", "Dreamer", "Composer", "Experimentalist", "Observer"] },
];
const specialtySelection = { direction: "Fresh", mood: "Bright", style: "Storyteller" };
const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const form = document.getElementById("artisanRegisterForm");
const specialtyDropdowns = document.getElementById("specialtyDropdowns");
const specialtyPreview = document.getElementById("specialtyPreview");
const formMessage = document.getElementById("formMessage");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setMenu(open) {
  mainNav.classList.toggle("open", open); header.classList.toggle("menu-active", open); document.body.classList.toggle("nav-open", open);
  menuToggle.setAttribute("aria-expanded", String(open)); menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}
function updateHeader() { header.classList.toggle("scrolled", window.scrollY > 18); }
function getSpecialty() { return `${specialtySelection.mood} ${specialtySelection.direction} ${specialtySelection.style}`; }
function closeDropdowns(except) {
  specialtyDropdowns.querySelectorAll(".specialty-select").forEach((select) => { if (select === except) return; select.classList.remove("open"); select.querySelector(".specialty-select-toggle").setAttribute("aria-expanded", "false"); select.querySelector(".specialty-select-menu").hidden = true; });
}
function renderSpecialtyDropdowns() {
  specialtyDropdowns.innerHTML = specialtyQuizGroups.map((group) => `<div class="specialty-select" data-group="${group.id}"><span class="specialty-select-label">${group.label}</span><button class="specialty-select-toggle" type="button" aria-expanded="false"><span class="specialty-selected">${specialtySelection[group.id]}</span><span class="specialty-caret" aria-hidden="true"></span></button><div class="specialty-select-menu" hidden>${group.options.map((option) => `<button class="specialty-option${specialtySelection[group.id] === option ? " active" : ""}" type="button" data-value="${option}">${option}</button>`).join("")}</div></div>`).join("");
  specialtyDropdowns.querySelectorAll(".specialty-select-toggle").forEach((toggle) => toggle.addEventListener("click", () => { const select = toggle.closest(".specialty-select"); const willOpen = !select.classList.contains("open"); closeDropdowns(select); select.classList.toggle("open", willOpen); toggle.setAttribute("aria-expanded", String(willOpen)); select.querySelector(".specialty-select-menu").hidden = !willOpen; }));
  specialtyDropdowns.querySelectorAll(".specialty-option").forEach((option) => option.addEventListener("click", () => { const select = option.closest(".specialty-select"); specialtySelection[select.dataset.group] = option.dataset.value; select.querySelector(".specialty-selected").textContent = option.dataset.value; select.querySelectorAll(".specialty-option").forEach((item) => item.classList.toggle("active", item === option)); specialtyPreview.textContent = getSpecialty(); closeDropdowns(); }));
}

function createPrototypeArtisanId(name, email) {
  // Prototype only: replace this local hash with a database-safe sequential ID generator before production.
  const source = `${name.trim().toLowerCase()}|${email.trim().toLowerCase()}|${Date.now()}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) hash = (hash * 31 + source.charCodeAt(index)) % 9000;
  return `HA-${new Date().getFullYear()}-${String(1000 + hash).padStart(4, "0")}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); formMessage.textContent = "";
  if (!form.checkValidity()) { formMessage.textContent = "Please complete the required register fields first."; form.reportValidity(); return; }
  const data = new FormData(form);
  const profile = {
    fullName: String(data.get("fullName")).trim(), email: String(data.get("emailAddress")).trim(), instagramWhatsapp: String(data.get("contactHandle")).trim(),
    scentDirection: specialtySelection.direction, scentMood: specialtySelection.mood, artisanStyle: specialtySelection.style, specialty: getSpecialty(),
    artisanId: createPrototypeArtisanId(String(data.get("fullName")), String(data.get("emailAddress"))), status: "Registered Artisan", registeredAt: new Date().toISOString(),
  };
  localStorage.setItem("hallArtisanProfile", JSON.stringify(profile));
  window.location.href = "my-artisan-id.html";
});

window.addEventListener("scroll", updateHeader, { passive: true }); updateHeader(); renderSpecialtyDropdowns();
menuToggle.addEventListener("click", () => setMenu(!mainNav.classList.contains("open")));
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("click", (event) => { if (!specialtyDropdowns.contains(event.target)) closeDropdowns(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeDropdowns(); if (mainNav.classList.contains("open")) { setMenu(false); menuToggle.focus(); } } });
document.querySelectorAll('a[href]').forEach((link) => link.addEventListener("click", (event) => { const href = link.getAttribute("href"); if (!href || href.startsWith("#") || link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); document.body.classList.add("page-leaving"); window.setTimeout(() => { window.location.href = link.href; }, reduceMotion ? 0 : 260); }));


