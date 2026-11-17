// Juego 10 · El verbo modal en la frase (Tema 3)
(function () {
  const { esc, pick, shuffle } = U;
  const { MODALES, USO } = ModalesDe;
  let anterior = null;

  Juegos.modales = crearJuego({
    clave: "modales", titulo: "El verbo modal en la frase", subtitulo: "Modal en posición 2, infinitivo al final",
    modos: ["Completa la frase", "¿Qué modal es?"],
    nueva(modo) {
      if (modo === 0) {
        const todas = window.MODALES_FRASES.filter((f) => f.semana <= SEMANA_ACTUAL);
        const f = pick(todas.filter((x) => x.de !== anterior).length ? todas.filter((x) => x.de !== anterior) : todas);
        anterior = f.de;
        const forma = MODALES[f.modal][f.pron];
        const pal = f.de.split(/\s+/);
        pal[1] = "_____";
        const opciones = shuffle(Object.keys(MODALES).map((m) => MODALES[m][f.pron]));
        return {
          etiqueta: "Elige el verbo modal que falta", cuerpo: esc(pal.join(" ")),
          pista: `Significado: <b>${esc(f.es)}</b>`, tipo: "elegir", opciones, correctas: [forma], canon: forma,
          extra: `<div class="pista">${esc(f.de)}</div><div class="pista">${esc(f.modal)} = ${esc(USO[f.modal])}</div>`,
        };
      }
      const modal = pick(Object.keys(MODALES).filter((m) => m !== anterior));
      anterior = modal;
      return {
        etiqueta: "¿Qué verbo modal expresa esto?", cuerpo: esc(USO[modal]), clase: "numero-grande",
        tipo: "elegir", opciones: shuffle(Object.keys(MODALES)), correctas: [modal], canon: modal,
        extra: `<div class="pista">ich ${esc(MODALES[modal].ich)} · du ${esc(MODALES[modal].du)} · wir ${esc(MODALES[modal].wir)}</div>`,
      };
    },
  });
})();
