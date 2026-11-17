// Auxiliares del Perfekt: presente de haben y sein (Tema 1) y pronombres.
(function (root) {
  const AUX = {
    haben: { ich: "habe", du: "hast", er: "hat", wir: "haben", ihr: "habt", sie: "haben" },
    sein: { ich: "bin", du: "bist", er: "ist", wir: "sind", ihr: "seid", sie: "sind" },
  };
  // Pronombre → etiqueta que se enseña (sie plural se distingue de er/sie/es)
  const PRONOMBRES = [["ich", "ich"], ["du", "du"], ["er", "er"], ["wir", "wir"], ["ihr", "ihr"], ["sie", "sie (ellos)"]];
  const api = { AUX, PRONOMBRES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PerfektDe = api;
})(typeof window !== "undefined" ? window : globalThis);
