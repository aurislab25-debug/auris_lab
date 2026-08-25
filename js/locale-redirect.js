/*
 * Auri's Lab — redirect automatico IT -> EN per i nuovi visitatori.
 * Caricato solo dalle pagine italiane (root), bloccante e il prima possibile
 * nell'<head>, per reindirizzare prima che la pagina venga disegnata.
 * Non tocca mai le pagine sotto /en/: un utente che ci arriva direttamente
 * (link condiviso, bandierina) resta lì, la scelta esplicita non viene mai forzata indietro.
 */
(function () {
  try {
    var saved = localStorage.getItem("auris_locale");
    var want = saved === "it" || saved === "en"
      ? saved
      : (((navigator.language || navigator.userLanguage || "") + "").toLowerCase().indexOf("it") === 0 ? "it" : "en");
    localStorage.setItem("auris_locale", want);
    if (want === "en") {
      var file = location.pathname === "/" ? "index.html" : location.pathname.replace(/^\/+/, "");
      location.replace("/en/" + file + location.search);
    }
  } catch (e) {}
})();
