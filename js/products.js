/*
 * Auri's Lab — caricamento e rendering dei prodotti da data/products.json.
 * Nessun backend: il catalogo è un file statico, modificabile a mano.
 * I campi testuali del prodotto sono bilingue ({it, en}); la lingua attiva
 * si legge da <html lang>. I percorsi verso i file condivisi (dati, immagini,
 * altre pagine) sono relativi alla root: da /en/ serve risalire di un livello.
 */

const LANG = document.documentElement.lang === "en" ? "en" : "it";
const BASE = location.pathname.replace(/\/+$/, "").startsWith("/en") ? "../" : "";

const UI = {
  it: {
    loadingCatalog: "Caricamento catalogo…",
    catalogUnavailable: "Catalogo non disponibile al momento. Scrivici su WhatsApp per l'elenco completo.",
    noResults: "Nessuna borsa disponibile in questo momento. Torna presto, oppure scrivici su WhatsApp per sapere quando arriva il prossimo pezzo.",
    productUnavailable: "Catalogo non disponibile",
    productUnavailableHint: "Riprova più tardi, oppure scrivici su WhatsApp.",
    notFoundTitle: "Borsa non trovata",
    notFoundHint: "Il prodotto che cerchi non è più disponibile o il link non è corretto.",
    backToCatalog: "Torna al catalogo",
    catalogLabel: "Catalogo",
    waCta: "Scrivi su WhatsApp",
    waCtaProduct: "Scrivi su WhatsApp per questa borsa",
    materials: "Materiali",
    dimensions: "Dimensioni",
    leadTime: "Tempo di realizzazione",
    available: "Disponibile",
    onOrder: "Su ordinazione",
    statusAvailable: "Disponibile ora, pronta per la spedizione.",
    statusOnOrder: (leadTime) => `Su ordinazione${leadTime ? ` — tempo di realizzazione stimato: ${leadTime}` : ""}.`,
    waAvailable: (nome) => `Ciao! Sono interessata alla borsa ${nome}, ho visto che è disponibile. È ancora in vendita?`,
    waOnOrder: (nome) => `Ciao! Sono interessata alla borsa ${nome} su ordinazione. Potreste darmi maggiori informazioni?`,
  },
  en: {
    loadingCatalog: "Loading catalog…",
    catalogUnavailable: "The catalog isn't available right now. Message us on WhatsApp for the full list.",
    noResults: "No bags available right now. Check back soon, or message us on WhatsApp to know when the next piece arrives.",
    productUnavailable: "Catalog unavailable",
    productUnavailableHint: "Please try again later, or message us on WhatsApp.",
    notFoundTitle: "Bag not found",
    notFoundHint: "The product you're looking for is no longer available, or the link is incorrect.",
    backToCatalog: "Back to the catalog",
    catalogLabel: "Catalog",
    waCta: "Message on WhatsApp",
    waCtaProduct: "Message on WhatsApp about this bag",
    materials: "Materials",
    dimensions: "Dimensions",
    leadTime: "Production time",
    available: "Available",
    onOrder: "Made to order",
    statusAvailable: "Available now, ready to ship.",
    statusOnOrder: (leadTime) => `Made to order${leadTime ? ` — estimated production time: ${leadTime}` : ""}.`,
    waAvailable: (nome) => `Hi! I'm interested in the ${nome} bag, I saw it's available. Is it still for sale?`,
    waOnOrder: (nome) => `Hi! I'm interested in the ${nome} bag, made to order. Could you give me more information?`,
  },
};

const t = UI[LANG];

function loc(field) {
  return field && typeof field === "object" ? field[LANG] : field;
}

async function loadProducts() {
  const res = await fetch(`${BASE}data/products.json`);
  if (!res.ok) throw new Error("Impossibile caricare il catalogo prodotti");
  return res.json();
}

function waMessageFor(product) {
  return product.stato === "disponibile" ? t.waAvailable(product.nome) : t.waOnOrder(product.nome);
}

function statusBadge(product) {
  return product.stato === "disponibile"
    ? `<span class="badge badge--available">${t.available}</span>`
    : `<span class="badge badge--order">${t.onOrder}</span>`;
}

function productCardHTML(product) {
  const categoria = loc(product.categoria);
  return `
    <article class="product-card">
      <a href="prodotto.html?id=${encodeURIComponent(product.id)}" class="product-card-media">
        ${statusBadge(product)}
        <img src="${BASE}${product.immagine_principale}" alt="Borsa ${product.nome}, ${categoria}" loading="lazy" width="400" height="500">
      </a>
      <div class="product-card-body">
        <span class="category">${categoria}</span>
        <h3><a href="prodotto.html?id=${encodeURIComponent(product.id)}">${product.nome}</a></h3>
        <p>${loc(product.descrizione_breve)}</p>
        <div class="product-card-footer">
          <span class="price">${loc(product.prezzo_display)}</span>
          <a class="btn btn-primary" data-wa-link data-wa-message="${waMessageFor(product).replace(/"/g, "&quot;")}">
            ${t.waCta}
          </a>
        </div>
      </div>
    </article>
  `;
}

/* ---- Home: anteprima prodotti ------------------------------------------ */
async function initHomePreview() {
  const mount = document.getElementById("home-products");
  if (!mount) return;
  try {
    const products = await loadProducts();
    const preview = products.slice(0, 4);
    mount.innerHTML = preview.map(productCardHTML).join("");
    wireContactLinks(mount);
  } catch (err) {
    mount.innerHTML = `<p class="empty-state">${t.catalogUnavailable}</p>`;
  }
}

/* ---- Catalogo: griglia completa + filtro -------------------------------- */
async function initCatalogPage() {
  const mount = document.getElementById("catalog-grid");
  if (!mount) return;

  let products = [];
  try {
    products = await loadProducts();
  } catch (err) {
    mount.innerHTML = `<p class="empty-state">${t.catalogUnavailable}</p>`;
    return;
  }

  const filterButtons = document.querySelectorAll(".filter-btn");

  function render(filter) {
    const filtered = filter === "available"
      ? products.filter((p) => p.stato === "disponibile")
      : products;

    if (filtered.length === 0) {
      mount.innerHTML = `<p class="empty-state">${t.noResults}</p>`;
      return;
    }

    mount.innerHTML = filtered.map(productCardHTML).join("");
    wireContactLinks(mount);
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      render(btn.dataset.filter);
    });
  });

  render("all");
}

/* ---- Pagina prodotto singola --------------------------------------------- */
function specRow(label, value) {
  if (!value) return "";
  return `<tr><th>${label}</th><td>${value}</td></tr>`;
}

async function initProductPage() {
  const mount = document.getElementById("product-detail");
  if (!mount) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  let products = [];
  try {
    products = await loadProducts();
  } catch (err) {
    mount.innerHTML = `<div class="product-not-found"><h1>${t.productUnavailable}</h1><p class="lede">${t.productUnavailableHint}</p></div>`;
    return;
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    mount.innerHTML = `
      <div class="product-not-found">
        <h1>${t.notFoundTitle}</h1>
        <p class="lede">${t.notFoundHint}</p>
        <a href="catalogo.html" class="btn btn-primary" style="margin-top:20px;">${t.backToCatalog}</a>
      </div>`;
    return;
  }

  const categoria = loc(product.categoria);
  document.title = `${product.nome} — Auri's Lab`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", `${product.nome}: ${loc(product.descrizione_breve)}`);

  const images = product.immagini && product.immagini.length ? product.immagini : [product.immagine_principale];

  const statusText = product.stato === "disponibile"
    ? t.statusAvailable
    : t.statusOnOrder(loc(product.tempo_realizzazione));

  mount.innerHTML = `
    <div class="breadcrumb">
      <a href="catalogo.html">${t.catalogLabel}</a> / <span>${product.nome}</span>
    </div>
    <div class="product-detail">
      <div class="product-gallery">
        <div class="gallery-main">
          <img id="gallery-main-img" src="${BASE}${images[0]}" alt="Borsa ${product.nome}, ${categoria}" width="400" height="500">
        </div>
        <div class="gallery-thumbs" role="tablist" aria-label="Altre foto del prodotto">
          ${images.map((src, i) => `
            <button type="button" role="tab" aria-current="${i === 0 ? "true" : "false"}" data-src="${BASE}${src}" aria-label="Foto ${i + 1} di ${product.nome}">
              <img src="${BASE}${src}" alt="" loading="lazy" width="72" height="90">
            </button>
          `).join("")}
        </div>
      </div>
      <div class="product-info">
        <span class="category">${categoria}</span>
        <h1>${product.nome}</h1>
        <p class="price">${loc(product.prezzo_display)}</p>
        <div class="status-line">${statusBadge(product)} <span>${statusText}</span></div>
        <p class="product-description">${loc(product.descrizione_estesa)}</p>
        <table class="spec-table">
          ${specRow(t.materials, loc(product.materiali))}
          ${specRow(t.dimensions, loc(product.dimensioni))}
          ${specRow(t.leadTime, loc(product.tempo_realizzazione))}
        </table>
        <a class="btn btn-primary btn-block" data-wa-link data-wa-message="${waMessageFor(product).replace(/"/g, "&quot;")}">
          ${t.waCtaProduct}
        </a>
      </div>
    </div>
  `;

  wireContactLinks(mount);

  const thumbs = mount.querySelectorAll(".gallery-thumbs button");
  const mainImg = mount.querySelector("#gallery-main-img");
  thumbs.forEach((btn) => {
    btn.addEventListener("click", () => {
      thumbs.forEach((b) => b.setAttribute("aria-current", "false"));
      btn.setAttribute("aria-current", "true");
      mainImg.src = btn.dataset.src;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHomePreview();
  initCatalogPage();
  initProductPage();
});
