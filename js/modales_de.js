// Tablas del Tema 3: verbos modales (presente) y Präteritum de sein / haben.
(function (root) {
  const MODALES = {
    "können": { ich: "kann", du: "kannst", er: "kann", wir: "können", ihr: "könnt", sie: "können" },
    "müssen": { ich: "muss", du: "musst", er: "muss", wir: "müssen", ihr: "müsst", sie: "müssen" },
    "mögen": { ich: "mag", du: "magst", er: "mag", wir: "mögen", ihr: "mögt", sie: "mögen" },
    "möchten": { ich: "möchte", du: "möchtest", er: "möchte", wir: "möchten", ihr: "möchtet", sie: "möchten" },
  };
  const USO = {
    "können": "capacidad / posibilidad", "müssen": "obligación / necesidad",
    "mögen": "gusto (con sustantivos)", "möchten": "deseo cortés",
  };
  const PRAETERITUM = {
    sein: { ich: "war", du: "warst", er: "war", wir: "waren", ihr: "wart", sie: "waren" },
    haben: { ich: "hatte", du: "hattest", er: "hatte", wir: "hatten", ihr: "hattet", sie: "hatten" },
  };
  const SIGNIFICADO = { sein: "ser / estar (era, estaba, fui)", haben: "tener (tenía, tuve)" };
  const api = { MODALES, USO, PRAETERITUM, SIGNIFICADO };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ModalesDe = api;
})(typeof window !== "undefined" ? window : globalThis);
