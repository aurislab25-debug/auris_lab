/*
 * Auri's Lab — caricamento e rendering dei prodotti da data/products.json.
 * Nessun backend: il catalogo è un file statico, modificabile a mano.
 */

async function loadProducts() {
  const res = await fetch("data/products.json");
  if (!res.ok) throw new Error("Impossibile caricare il catalogo prodotti");
  return res.json();
}

function waMessageFor(product) {
  return product.stato === "disponibile"
    ? `Ciao! Sono interessata alla borsa ${product.nome}, ho visto che è disponibile. È ancora in vendita?`
    : `Ciao! Sono interessata alla borsa ${product.nome} su ordinazione. Potreste darmi maggiori informazioni?`;
}

function statusBadge(product) {
  return product.stato === "disponibile"
    ? `<span class="badge badge--available">Disponibile</span>`
    : `<span class="badge badge--order">Su ordinazione</span>`;
}

function productCardHTML(product) {
  return `
    <article class="product-card">
      <a href="prodotto.html?id=${encodeURIComponent(product.id)}" class="product-card-media">
        ${statusBadge(product)}
        <img src="${product.immagine_principale}" alt="Borsa ${product.nome}, ${product.categoria}" loading="lazy" width="400" height="500">
      </a>
      <div class="product-card-body">
        <span class="category">${product.categoria}</span>
        <h3><a href="prodotto.html?id=${encodeURIComponent(product.id)}">${product.nome}</a></h3>
        <p>${product.descrizione_breve}</p>
        <div class="product-card-footer">
          <span class="price">${product.prezzo_display}</span>
          <a class="btn btn-primary" data-wa-link data-wa-message="${waMessageFor(product).replace(/"/g, "&quot;")}">
            Scrivi su WhatsApp
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
    mount.innerHTML = `<p class="empty-state">Catalogo non disponibile al momento. Scrivici su WhatsApp per l'elenco completo.</p>`;
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
    mount.innerHTML = `<p class="empty-state">Catalogo non disponibile al momento. Scrivici su WhatsApp per l'elenco completo.</p>`;
    return;
  }

  const filterButtons = document.querySelectorAll(".filter-btn");

  function render(filter) {
    const filtered = filter === "available"
      ? products.filter((p) => p.stato === "disponibile")
      : products;

    if (filtered.length === 0) {
      mount.innerHTML = `<p class="empty-state">Nessuna borsa disponibile in questo momento. Torna presto, oppure scrivici su WhatsApp per sapere quando arriva il prossimo pezzo.</p>`;
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
    mount.innerHTML = `<div class="product-not-found"><h1>Catalogo non disponibile</h1><p class="lede">Riprova più tardi, oppure scrivici su WhatsApp.</p></div>`;
    return;
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    mount.innerHTML = `
      <div class="product-not-found">
        <h1>Borsa non trovata</h1>
        <p class="lede">Il prodotto che cerchi non è più disponibile o il link non è corretto.</p>
        <a href="catalogo.html" class="btn btn-primary" style="margin-top:20px;">Torna al catalogo</a>
      </div>`;
    return;
  }

  document.title = `${product.nome} — Auri's Lab`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", `${product.nome}: ${product.descrizione_breve}`);

  const images = product.immagini && product.immagini.length ? product.immagini : [product.immagine_principale];

  const statusText = product.stato === "disponibile"
    ? "Disponibile ora, pronta per la spedizione."
    : `Su ordinazione${product.tempo_realizzazione ? ` — tempo di realizzazione stimato: ${product.tempo_realizzazione}` : ""}.`;

  mount.innerHTML = `
    <div class="breadcrumb">
      <a href="catalogo.html">Catalogo</a> / <span>${product.nome}</span>
    </div>
    <div class="product-detail">
      <div class="product-gallery">
        <div class="gallery-main">
          <img id="gallery-main-img" src="${images[0]}" alt="Borsa ${product.nome}, ${product.categoria}" width="400" height="500">
        </div>
        <div class="gallery-thumbs" role="tablist" aria-label="Altre foto del prodotto">
          ${images.map((src, i) => `
            <button type="button" role="tab" aria-current="${i === 0 ? "true" : "false"}" data-src="${src}" aria-label="Foto ${i + 1} di ${product.nome}">
              <img src="${src}" alt="" loading="lazy" width="72" height="90">
            </button>
          `).join("")}
        </div>
      </div>
      <div class="product-info">
        <span class="category">${product.categoria}</span>
        <h1>${product.nome}</h1>
        <p class="price">${product.prezzo_display}</p>
        <div class="status-line">${statusBadge(product)} <span>${statusText}</span></div>
        <p class="product-description">${product.descrizione_estesa}</p>
        <table class="spec-table">
          ${specRow("Materiali", product.materiali)}
          ${specRow("Dimensioni", product.dimensioni)}
          ${specRow("Tempo di realizzazione", product.tempo_realizzazione)}
        </table>
        <a class="btn btn-primary btn-block" data-wa-link data-wa-message="${waMessageFor(product).replace(/"/g, "&quot;")}">
          Scrivi su WhatsApp per questa borsa
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
