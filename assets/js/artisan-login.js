const form = document.getElementById("artisanLoginForm"); const message = document.getElementById("loginMessage"); const header = document.getElementById("siteHeader"); const menuToggle = document.getElementById("menuToggle"); const mainNav = document.getElementById("mainNav");
function setMenu(open) { mainNav.classList.toggle("open", open); header.classList.toggle("menu-active", open); document.body.classList.toggle("nav-open", open); menuToggle.setAttribute("aria-expanded", String(open)); }
menuToggle.addEventListener("click", () => setMenu(!mainNav.classList.contains("open"))); mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
form.addEventListener("submit", (event) => {
  event.preventDefault(); message.textContent = ""; if (!form.checkValidity()) { message.textContent = "Please enter your email and password."; form.reportValidity(); return; }
  let profile; try { profile = JSON.parse(localStorage.getItem("hallArtisanProfile")); } catch { profile = null; }
  const email = String(new FormData(form).get("email")).trim().toLowerCase();
  if (!profile || String(profile.email).toLowerCase() !== email) { message.textContent = "No matching Artisan profile is stored in this browser."; return; }
  window.location.href = "my-artisan-id.html";
});
