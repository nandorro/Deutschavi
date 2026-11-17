// Juego 9 · Conjuga el verbo: modales (presente) y Präteritum de sein / haben (Tema 3)
(function () {
  const { esc, pick } = U;
  const { MODALES, USO, PRAETERITUM, SIGNIFICADO } = ModalesDe;
  const { PRONOMBRES } = PerfektDe;
  let anterior = null;

  Juegos.conjugar = crearJuego({
    clave: "conjugar", titulo: "Conjuga el verbo", subtitulo: "Modales y Präteritum de sein / haben",
    modos: ["Verbos modales", "Präteritum (sein / haben)"],
    nueva(modo) {
      const tabla = modo === 0 ? MODALES : PRAETERITUM;
      let verbo, pron, etiqueta;
      do {
        verbo = pick(Object.keys(tabla));
        [pron, etiqueta] = pick(PRONOMBRES);
      } while (`${verbo}${pron}` === anterior);
      anterior = `${verbo}${pron}`;
      const forma = tabla[verbo][pron];
      const sig = modo === 0 ? USO[verbo] : SIGNIFICADO[verbo];
      return {
        etiqueta: modo === 0 ? "Escribe la forma del verbo modal" : "Escribe la forma en Präteritum",
        cuerpo: `${esc(etiqueta)} · ${esc(verbo)}`, clase: "numero-grande",
        pista: `Significado: <b>${esc(sig)}</b>`, tipo: "teclear", campo: "Verbo conjugado",
        placeholder: "p. ej. " + (modo === 0 ? "kann" : "war"),
        correctas: [forma, `${pron} ${forma}`], canon: forma,
        extra: `<div class="pista">${esc(pron)} ${esc(forma)}</div>`,
      };
    },
  });
})();
