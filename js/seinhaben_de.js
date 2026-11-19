// Tema 3 · sein y haben en presente y en Präteritum (bin/war, habe/hatte…) combinados en frases.
(function (root) {
  const PRESENS = {
    sein: { ich: "bin", du: "bist", er: "ist", wir: "sind", ihr: "seid", sie: "sind" },
    haben: { ich: "habe", du: "hast", er: "hat", wir: "haben", ihr: "habt", sie: "haben" },
  };
  const PRAETERITUM = {
    sein: { ich: "war", du: "warst", er: "war", wir: "waren", ihr: "wart", sie: "waren" },
    haben: { ich: "hatte", du: "hattest", er: "hatte", wir: "hatten", ihr: "hattet", sie: "hatten" },
  };
  const NOMBRE = (verbo, tiempo) => `${verbo} en ${tiempo === "praesens" ? "presente" : "Präteritum"}`;

  // forma = la palabra que va en el hueco; verbo/tiempo se calculan al buscarla en las tablas
  const FRASES = [
    { de: "Gestern war ich sehr müde.", es: "Ayer estaba muy cansado/a.", pron: "ich", forma: "war" },
    { de: "Hattest du gestern Zeit?", es: "¿Tuviste / tenías tiempo ayer?", pron: "du", forma: "hattest" },
    { de: "Wir waren letzten Sommer in Spanien.", es: "El verano pasado estuvimos en España.", pron: "wir", forma: "waren" },
    { de: "Heute bin ich müde.", es: "Hoy estoy cansado/a.", pron: "ich", forma: "bin" },
    { de: "Ich habe heute Zeit.", es: "Hoy tengo tiempo.", pron: "ich", forma: "habe" },
    { de: "Gestern hatte ich Hunger.", es: "Ayer tenía hambre.", pron: "ich", forma: "hatte" },
    { de: "Er war gestern krank.", es: "Ayer estuvo enfermo.", pron: "er", forma: "war" },
    { de: "Sie hat jetzt Durst.", es: "Ahora tiene sed.", pron: "er", forma: "hat" },
    { de: "Wo warst du gestern?", es: "¿Dónde estuviste ayer?", pron: "du", forma: "warst" },
    { de: "Ihr wart letzte Woche in Berlin.", es: "La semana pasada estuvisteis en Berlín.", pron: "ihr", forma: "wart" },
    { de: "Wir haben morgen einen Termin.", es: "Mañana tenemos una cita.", pron: "wir", forma: "haben" },
    { de: "Die Patienten waren gestern im Krankenhaus.", es: "Los pacientes estuvieron ayer en el hospital.", pron: "sie", forma: "waren" },
    { de: "Du bist heute sehr freundlich.", es: "Hoy eres muy amable.", pron: "du", forma: "bist" },
    { de: "Ihr habt heute eine Prüfung.", es: "Hoy tenéis un examen.", pron: "ihr", forma: "habt" },
    { de: "Der Arzt hatte gestern keine Zeit.", es: "Ayer el médico no tenía tiempo.", pron: "er", forma: "hatte" },
    { de: "Ich war letztes Jahr in Spanien.", es: "El año pasado estuve en España.", pron: "ich", forma: "war" },
    { de: "Hast du Kopfschmerzen?", es: "¿Tienes dolor de cabeza?", pron: "du", forma: "hast" },
    { de: "Wir sind heute zu Hause.", es: "Hoy estamos en casa.", pron: "wir", forma: "sind" },
    { de: "Das Kind hatte gestern Fieber.", es: "Ayer el niño tenía fiebre.", pron: "er", forma: "hatte" },
    { de: "Sie waren gestern im Kino.", es: "Ayer estuvieron en el cine.", pron: "sie", forma: "waren" },
  ];

  // Las cuatro formas posibles para un pronombre: sein/haben × presente/Präteritum
  const opciones = (pron) => [PRESENS.sein[pron], PRESENS.haben[pron], PRAETERITUM.sein[pron], PRAETERITUM.haben[pron]]
    .filter((x, i, a) => a.indexOf(x) === i);
  // Qué verbo y tiempo es una forma (para explicar la respuesta)
  function analizar(pron, forma) {
    for (const verbo of ["sein", "haben"]) for (const t of ["praesens", "praeteritum"]) {
      if ((t === "praesens" ? PRESENS : PRAETERITUM)[verbo][pron] === forma) return { verbo, tiempo: t };
    }
    return null;
  }
  const hueco = (f) => f.de.replace(new RegExp(`(^|\\s)${f.forma}(?=[\\s.,?!]|$)`, "i"), "$1_____");

  const api = { PRESENS, PRAETERITUM, FRASES, opciones, analizar, hueco, NOMBRE };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SeinHabenDe = api;
})(typeof window !== "undefined" ? window : globalThis);
