// Juego «Sein, haben, war, hatte» · combina las formas de sein y haben (presente y Präteritum) en frases
(function () {
  const { esc, pick, shuffle } = U;
  const S = SeinHabenDe;
  let anterior = null;

  Juegos.seinhaben = crearJuego({
    clave: "seinhaben", titulo: "Sein, haben, war, hatte", subtitulo: "bin · habe · war · hatte… ¿cuál va en la frase?",
    modos: ["Completa la frase", "Escribe la frase"],
    nueva(modo) {
      let f;
      do { f = pick(S.FRASES); } while (f.de === anterior);
      anterior = f.de;
      const an = S.analizar(f.pron, f.forma);
      const explica = `<div class="pista"><b>${esc(f.forma)}</b> = ${esc(S.NOMBRE(an.verbo, an.tiempo))}. `
        + `(${an.verbo === "sein" ? "ser / estar" : "tener"}${an.tiempo === "praesens" ? ", ahora" : ", en pasado"})</div>
        <div class="pista">${esc(f.de)}</div>`;
      if (modo === 0) {
        const ini = f.de.toLowerCase().startsWith(f.forma);          // si el hueco abre la frase, va con mayúscula
        const cap = (x) => (ini ? x.charAt(0).toUpperCase() + x.slice(1) : x);
        return {
          etiqueta: "Elige la forma que falta", cuerpo: esc(S.hueco(f)),
          pista: `Significado: <b>${esc(f.es)}</b>`, tipo: "elegir", opciones: shuffle(S.opciones(f.pron).map(cap)),
          correctas: [cap(f.forma)], canon: cap(f.forma), extra: explica,
        };
      }
      return {
        etiqueta: "Escribe la frase en alemán", cuerpo: esc(f.es),
        pista: "Usa sein o haben, en presente (bin, habe…) o en Präteritum (war, hatte…).",
        tipo: "teclear", campo: "Tu frase en alemán", placeholder: "p. ej. Gestern war ich müde",
        correctas: [f.de.replace(/[.?!]+$/, "")], canon: f.de, extra: explica,
      };
    },
  });
})();
