// Tema 3 · «Wie oft?»: expresiones de frecuencia (número de veces + unidad de tiempo, y expresiones habituales).
(function (root) {
  const VECES = [
    { de: "einmal", es: "una vez" }, { de: "zweimal", es: "dos veces" }, { de: "dreimal", es: "tres veces" },
    { de: "viermal", es: "cuatro veces" }, { de: "fünfmal", es: "cinco veces" },
  ];
  const UNIDADES = [
    { de: "pro Tag", es: "al día" }, { de: "pro Woche", es: "a la semana" },
    { de: "im Monat", es: "al mes" }, { de: "im Jahr", es: "al año" },
  ];
  const HABITUALES = [
    { de: "jeden Tag", es: "todos los días" }, { de: "jede Woche", es: "todas las semanas" },
    { de: "jedes Wochenende", es: "todos los fines de semana" },
  ];
  const GRUPOS = {
    veces: { nombre: "Número de veces", lista: VECES },
    unidades: { nombre: "Unidad de tiempo", lista: UNIDADES },
    habituales: { nombre: "Expresiones habituales", lista: HABITUALES },
  };
  // verbo de «ich», de «du» y lo que sigue; es = la frase en español en primera persona
  const ACTIVIDADES = [
    { ich: "gehe", du: "gehst", resto: "ins Kino", es: "Voy al cine" },
    { ich: "trainiere", du: "trainierst", resto: "", es: "Entreno" },
    { ich: "gehe", du: "gehst", resto: "zum Arzt", es: "Voy al médico" },
    { ich: "lerne", du: "lernst", resto: "Deutsch", es: "Aprendo alemán" },
    { ich: "besuche", du: "besuchst", resto: "meine Eltern", es: "Visito a mis padres" },
    { ich: "fahre", du: "fährst", resto: "nach Spanien", es: "Viajo a España" },
    { ich: "koche", du: "kochst", resto: "Suppe", es: "Cocino sopa" },
    { ich: "kaufe", du: "kaufst", resto: "Brot", es: "Compro pan" },
  ];

  const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const unir = (...p) => p.filter(Boolean).join(" ");
  const combinar = (v, u) => ({ de: `${v.de} ${u.de}`, es: `${v.es} ${u.es}` });
  const combinarTodas = () => VECES.flatMap((v) => UNIDADES.map((u) => combinar(v, u)));
  // Frase con la frecuencia tras el verbo y variante con la frecuencia al inicio (el verbo sigue en la posición 2)
  const frase = (a, f) => ({
    principal: unir("Ich", a.ich, f.de, a.resto) + ".",
    alternativa: unir(mayus(f.de), a.ich, "ich", a.resto) + ".",
    pregunta: unir("Wie oft", a.du, "du", a.resto) + "?",
    es: `${a.es} ${f.es}.`,
  });

  const api = { VECES, UNIDADES, HABITUALES, GRUPOS, ACTIVIDADES, combinar, combinarTodas, frase, mayus };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.FrecuenciaDe = api;
})(typeof window !== "undefined" ? window : globalThis);
