/*
 * Auri's Lab — script condiviso da tutte le pagine.
 * Config brand, menu mobile, link WhatsApp/Instagram, anno footer.
 */

/* ---- Config: modifica qui i contatti reali del brand ------------------- */
const AURIS_CONFIG = {
  // Numero WhatsApp in formato internazionale, solo cifre (nessuno spazio, +, o trattino).
  // Esempio Italia: 39 + numero senza lo 0 iniziale -> "393331234567"
  whatsappNumber: "393668053210",
  instagramHandle: "auris.lab",
  instagramUrl: "https://www.instagram.com/auris.lab/",
  email: "auris.lab.25@gmail.com",
  city: "Torino"
};

/** Costruisce un link wa.me con messaggio precompilato ed encoding corretto. */
function buildWhatsAppLink(message) {
  const base = `https://wa.me/${AURIS_CONFIG.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Applica gli href WhatsApp/Instagram/email a tutti gli elementi con i relativi data-attribute. */
function wireContactLinks(root = document) {
  root.querySelectorAll("[data-wa-link]").forEach((el) => {
    const message = el.getAttribute("data-wa-message") || "";
    el.setAttribute("href", buildWhatsAppLink(message));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });

  root.querySelectorAll("[data-ig-link]").forEach((el) => {
    el.setAttribute("href", AURIS_CONFIG.instagramUrl);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });

  root.querySelectorAll("[data-email-link]").forEach((el) => {
    el.setAttribute("href", `mailto:${AURIS_CONFIG.email}`);
  });

  root.querySelectorAll("[data-ig-handle]").forEach((el) => {
    el.textContent = `@${AURIS_CONFIG.instagramHandle}`;
  });
}

/** Menu di navigazione mobile: toggle apertura/chiusura, chiusura su link cliccato o resize. */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 780) {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function setFooterYear() {
  const el = document.getElementById("footer-year");
  if (el) el.textContent = String(new Date().getFullYear());
}

/** Ricorda l'ultima lingua effettivamente vista, così una futura visita alla root sa se reindirizzare. */
function persistCurrentLocale() {
  try {
    localStorage.setItem("auris_locale", document.documentElement.lang === "en" ? "en" : "it");
  } catch (e) {}
}

/** Preserva eventuali query string (es. ?id=... in prodotto.html) quando si cambia lingua dal selettore. */
function wireLangSwitch() {
  if (!location.search) return;
  document.querySelectorAll(".lang-switch a").forEach((a) => {
    a.href = a.href + location.search;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  wireContactLinks();
  setFooterYear();
  persistCurrentLocale();
  wireLangSwitch();
});
