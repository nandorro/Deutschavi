// Juego Aduso · ¿dónde va el verbo? Posición 1 o 2, con adverbios de tiempo y de lugar
(function () {
  const { esc, pick, shuffle } = U;
  const A = AdusoDe;
  let anterior = null;

  Juegos.aduso = crearJuego({
    clave: "aduso", titulo: "Aduso", subtitulo: "¿Dónde va el verbo? Posición 1 o 2",
    modos: ["Elige la frase", "¿Posición 1 o 2?"],
    nueva(modo) {
      const c = A.azar(pick, pick(A.ORDEN_TIPOS.filter((t) => t !== anterior)));   // no repite el tipo seguido
      anterior = c.tipo;
      const extra = `<div class="pista"><b>${esc(c.nombre)}</b>: ${esc(c.regla)}</div>
        <div class="pista">${esc(A.correcta(c))}</div>`;
      if (modo === 0) {
        return {
          etiqueta: "¿Dónde va el verbo? Elige la frase correcta", cuerpo: esc(c.es),
          pista: `Verbo: <b>${esc(c.verbo)}</b>`, tipo: "elegir", opciones: shuffle(A.opciones(c)),
          correctas: [A.correcta(c).replace(/[.?!]+$/, "")], canon: A.correcta(c), extra,   // el motor quita la puntuación final
        };
      }
      return {
        etiqueta: `${c.nombre}: ¿en qué posición va el verbo?`,
        cuerpo: `${esc(c.partes.join(" · "))}`, clase: "numero-grande",
        pista: `Verbo: <b>${esc(c.verbo)}</b> — ${esc(c.es)}`, tipo: "elegir", opciones: ["Posición 1", "Posición 2"],
        correctas: ["Posición " + c.pos], canon: "Posición " + c.pos, extra,
      };
    },
  });
})();
