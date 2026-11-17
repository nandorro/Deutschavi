// Juego 6 · El Perfekt en una frase (Tema 3 y Tema 3.5)
(function () {
  const { esc, pick } = U;
  const { AUX, PRONOMBRES } = PerfektDe;
  let anterior = null;
  const nuevo = (lista, clave) => {
    const pool = lista.filter((x) => x[clave] !== anterior);
    const x = pick(pool.length ? pool : lista);
    anterior = x[clave];
    return x;
  };

  Juegos.perfekt = crearJuego({
    clave: "perfekt", titulo: "El Perfekt en una frase", subtitulo: "Auxiliar en posición 2, Partizip II al final",
    modos: ["Escribe el Perfekt", "Completa la frase"],
    nueva(modo) {
      if (modo === 0) {
        const v = nuevo(window.PERFEKT.filter((x) => x.semana <= SEMANA_ACTUAL), "inf");
        const [pron, etiqueta] = pick(PRONOMBRES);
        const aux = AUX[v.aux][pron], canon = `${aux} ${v.part}`;
        return {
          etiqueta: "Escribe el Perfekt: auxiliar + Partizip II",
          cuerpo: `${esc(etiqueta)} · ${esc(v.inf)}`, clase: "numero-grande",
          pista: `Significado: <b>${esc(v.es)}</b>`, tipo: "teclear", campo: "Perfekt",
          placeholder: "p. ej. habe gemacht", correctas: [canon, `${pron} ${canon}`], canon,
          extra: `<div class="pista">${esc(v.razon)}</div><div class="pista">${esc(pron)} ${esc(canon)}</div>`,
        };
      }
      const frases = window.PERFEKT_FRASES.filter((x) => x.semana <= SEMANA_ACTUAL);
      const f = nuevo(frases, "de");
      const pal = f.de.split(/\s+/);
      const fin = pal.length - 1, signos = pal[fin].slice(f.part.length);
      pal[1] = "_____"; pal[fin] = "_____" + signos;
      const canon = `${f.aux} ${f.part}`;
      return {
        etiqueta: "Completa la frase en Perfekt", cuerpo: esc(pal.join(" ")),
        pista: `Verbo: <b>${esc(f.inf)}</b> · ${esc(f.es)}`, tipo: "teclear", campo: "Auxiliar + Partizip II",
        placeholder: "p. ej. bin gefahren", correctas: [canon], canon,
        extra: `<div class="pista">${esc(f.de)}</div>`,
      };
    },
  });
})();
