# Auri's Lab — sito

Sito statico vanilla (HTML/CSS/JS, nessun framework, nessuna build) per il brand di borse artigianali Auri's Lab. Pronto per deploy statico su Vercel.

## Struttura

```
index.html         Home (IT)
catalogo.html       Griglia prodotti con filtro (IT)
prodotto.html        Pagina prodotto singola (IT, legge ?id=... e mostra data/products.json)
chi-siamo.html       Storia del brand (IT)
contatti.html         WhatsApp, Instagram, email, form mailto (IT)
en/                    Mirror in inglese delle 5 pagine sopra, stessi nomi file, contenuti tradotti a mano
css/style.css        Stile unico condiviso da tutte le pagine (IT + EN)
js/main.js            Config brand, menu mobile, wiring link WhatsApp/Instagram/email, switcher lingua
js/products.js       Caricamento catalogo, render card prodotto, filtro, galleria — legge <html lang> e sceglie i campi it/en
js/locale-redirect.js Redirect automatico IT -> EN al primo accesso, solo sulle pagine radice (IT)
data/products.json    Catalogo prodotti — campi testuali bilingue {it, en}, l'unico file da aggiornare per aggiungere/rimuovere borse
img/prodotti/         Foto prodotti (ora placeholder SVG generati, da sostituire con foto reali)
img/brand/             Logo, hero, foto atelier (placeholder da sostituire)
```

## Lingue (IT/EN)

Il sito ha due alberi di pagine paralleli: quelle in italiano nella root e il loro mirror in inglese sotto `en/` (stessi nomi file, es. `catalogo.html` <-> `en/catalogo.html`). Ogni pagina ha URL proprio e tag `hreflang` nell'`<head>` — scelta fatta per la SEO internazionale (Google indicizza le due lingue separatamente) invece di uno swap via JS sulla stessa pagina.

- **Rilevamento automatico**: `js/locale-redirect.js`, caricato solo dalle pagine IT, reindirizza al primo accesso in base alla lingua del browser e ricorda la scelta in `localStorage` (`auris_locale`). Non reindirizza mai via da una pagina `/en/` raggiunta direttamente.
- **Switcher manuale**: bandierine "IT / EN" in header (nascosto sotto 780px per non rompere la barra di navigazione — su mobile resta comunque disponibile in footer) e footer di ogni pagina.
- **Testo statico** (titoli, paragrafi, bottoni): va tradotto e aggiornato a mano nel file `en/` corrispondente — non c'è un dizionario/i18n condiviso per l'HTML statico, solo per i dati prodotto e le stringhe generate da JS.
- **Catalogo prodotti**: bilingue nei dati (`data/products.json`), un solo file per entrambe le lingue — vedi sezione sotto.
- **Sitemap**: `sitemap.xml` elenca entrambe le versioni di ogni pagina con annotazioni `hreflang` incrociate.

⚠️ Quando modifichi una pagina IT (testo, sezioni, prodotti in evidenza), ricordati di riportare la stessa modifica nel corrispondente file `en/` — sono file HTML indipendenti, non si aggiornano da soli.

## Cose da configurare prima del lancio

1. ~~Numero WhatsApp reale~~ — impostato in [`js/main.js`](js/main.js) (`AURIS_CONFIG.whatsappNumber`): `+39 366 805 3210`.
2. ~~Email reale~~ — impostata in [`js/main.js`](js/main.js) (`AURIS_CONFIG.email`): `auris.lab.25@gmail.com`.
3. **Foto prodotti** — sostituire i file placeholder in `img/prodotti/` e `img/brand/` con scatti reali (stesso nome file, o aggiorna i percorsi in `data/products.json`).
4. **Dominio** — `robots.txt`, `sitemap.xml` e i tag `hreflang` in ogni pagina (IT ed EN) puntano a `https://aurislab.it/`: aggiornare tutti e tre insieme con il dominio Vercel/personalizzato reale (attualmente `https://auris-lab-25.vercel.app/`).

## Aggiungere o modificare un prodotto

Modifica `data/products.json`: ogni voce è un oggetto con `id` (usato nell'URL `prodotto.html?id=...`, uguale in IT ed EN), `nome` (invariato tra le lingue), `stato` (`"disponibile"` o `"ordinazione"`), le immagini, e i campi testuali bilingue `categoria`, `prezzo_display`, `descrizione_breve`, `descrizione_estesa`, `materiali`, `dimensioni`, `tempo_realizzazione` (solo per su ordinazione) — ognuno di questi è un oggetto `{ "it": "...", "en": "..." }`. Nessun altro file va toccato: home, catalogo e pagina prodotto (in entrambe le lingue) si aggiornano da soli.

## Deploy

Stesso setup di JointTracker: push su GitHub, deploy automatico su Vercel. Nessuna configurazione di build necessaria (sito statico, `index.html` in root).
