/*
 * Auri's Lab — pannello admin: autenticazione e helper condivisi.
 * Stesso progetto Supabase del sito pubblico. Le policy RLS lasciano leggere/
 * scrivere TUTTI i prodotti (bozze incluse) solo a chi ha fatto login; il sito
 * pubblico invece vede solo pubblicato = true. Login/registrazione utenti si
 * gestiscono da Supabase Studio (Authentication > Users), non da qui.
 */

const adminClient = window.supabaseClient || supabase.createClient(
  "https://ktoxehrtcmkbkpawdfvb.supabase.co",
  "sb_publishable_MATBwj-ILmgTy3gL_zcIGg_oqtyrssv"
);
window.supabaseClient = adminClient;

/** Da chiamare in cima ad ogni pagina admin (tranne login.html): reindirizza al login se non autenticati. */
async function requireAuth() {
  const { data: { session } } = await adminClient.auth.getSession();
  if (!session) {
    location.href = "login.html";
    return null;
  }
  return session;
}

function wireLogout() {
  const btn = document.getElementById("admin-logout");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    await adminClient.auth.signOut();
    location.href = "login.html";
  });
}

/** Rimuove i segni diacritici (accenti) da una stringa gia' normalizzata NFD, senza usare
 *  caratteri unicode letterali nel sorgente (solo i loro code point, per evitare problemi
 *  di codifica): i segni combinanti stanno nel range U+0300-U+036F. */
function stripDiacritics(nfdText) {
  return nfdText
    .split("")
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x0300 || code > 0x036f;
    })
    .join("");
}

/** Trasforma un nome borsa in uno slug URL-safe da usare come id prodotto. */
function slugify(text) {
  return stripDiacritics((text || "").toString().normalize("NFD"))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
