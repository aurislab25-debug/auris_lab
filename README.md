# Auri's Lab — sito

Sito statico vanilla (HTML/CSS/JS, nessun framework, nessuna build) per il brand di borse artigianali Auri's Lab. Pronto per deploy statico su Vercel.

## Struttura

```
index.html         Home
catalogo.html       Griglia prodotti con filtro
prodotto.html        Pagina prodotto singola (legge ?id=... e mostra data/products.json)
chi-siamo.html       Storia del brand
contatti.html         WhatsApp, Instagram, email, form mailto
css/style.css        Stile unico condiviso da tutte le pagine
js/main.js            Config brand, menu mobile, wiring link WhatsApp/Instagram/email
js/products.js       Caricamento catalogo, render card prodotto, filtro, galleria
data/products.json    Catalogo prodotti — l'unico file da aggiornare per aggiungere/rimuovere borse
img/prodotti/         Foto prodotti (ora placeholder SVG generati, da sostituire con foto reali)
img/brand/             Logo, hero, foto atelier (placeholder da sostituire)
```

## Cose da configurare prima del lancio

1. ~~Numero WhatsApp reale~~ — impostato in [`js/main.js`](js/main.js) (`AURIS_CONFIG.whatsappNumber`): `+39 366 805 3210`.
2. ~~Email reale~~ — impostata in [`js/main.js`](js/main.js) (`AURIS_CONFIG.email`): `auris.lab.25@gmail.com`.
3. **Foto prodotti** — sostituire i file placeholder in `img/prodotti/` e `img/brand/` con scatti reali (stesso nome file, o aggiorna i percorsi in `data/products.json`).
4. **Dominio** — `robots.txt` e `sitemap.xml` puntano a `https://aurislab.it/`: aggiornare con il dominio Vercel/personalizzato reale (attualmente `https://auris-lab-25.vercel.app/`).

## Aggiungere o modificare un prodotto

Modifica `data/products.json`: ogni voce è un oggetto con `id` (usato nell'URL `prodotto.html?id=...`), `nome`, `categoria`, `stato` (`"disponibile"` o `"ordinazione"`), `prezzo_display`, descrizioni, `materiali`, `dimensioni`, `tempo_realizzazione` (solo per su ordinazione) e le immagini. Nessun altro file va toccato: home, catalogo e pagina prodotto si aggiornano da soli.

## Deploy

Stesso setup di JointTracker: push su GitHub, deploy automatico su Vercel. Nessuna configurazione di build necessaria (sito statico, `index.html` in root).
