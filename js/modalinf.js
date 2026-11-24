// Juego «Modal + infinitivo» · el modal en la posición 2 (o 1 en preguntas) y el infinitivo al final
(function () {
  const { esc, pick, shuffle } = U;
  const A = ModalInfDe, { USO } = ModalesDe;
  const items = () => window.MODALINF.filter((x) => x.semana <= SEMANA_ACTUAL);
  const quita = (s) => s.replace(/[.!?¡¿\s]+$/g, "");              // el motor quita la puntuación final
  let anterior = null;

  Juegos.modalinf = crearJuego({
    clave: "modalinf", titulo: "Modal + infinitivo", subtitulo: "El modal en su sitio y el infinitivo al final",
    modos: ["¿Dónde va el infinitivo?", "Escribe la frase", "Preguntas"],
    nueva(modo) {
      let c;
      do { c = A.azar(pick, items(), modo === 2 ? "pregunta" : "frase"); } while (A.correcta(c) === anterior);
      anterior = A.correcta(c);
      const regla = c.tipo === "frase"
        ? "El modal va en la <b>posición 2</b> y el verbo principal se queda en <b>infinitivo al final</b>."
        : "En una pregunta sin palabra interrogativa el modal abre la frase (<b>posición 1</b>) y el infinitivo va al final.";
      const extra = `<div class="pista">${regla}</div><div class="pista">${esc(A.correcta(c))}</div>`;
      const uso = `<b>${esc(c.modal)}</b> (${esc(USO[c.modal])})`;
      if (modo === 1) {
        return {
          etiqueta: "Escribe la frase en alemán", cuerpo: esc(c.es), pista: `Verbo modal: ${uso} · infinitivo: <b>${esc(c.inf)}</b>`,
          tipo: "teclear", campo: "Tu frase en alemán", placeholder: "p. ej. Ich kann Deutsch sprechen",
          correctas: [quita(A.correcta(c))], canon: A.correcta(c), extra,
        };
      }
      return {
        etiqueta: modo === 0 ? "¿Dónde va el infinitivo? Elige la frase correcta" : "Elige la pregunta bien formada",
        cuerpo: esc(c.es), pista: `Verbo modal: ${uso} · infinitivo: <b>${esc(c.inf)}</b>`,
        tipo: "elegir", opciones: shuffle(A.opciones(c)), correctas: [quita(A.correcta(c))], canon: A.correcta(c), extra,
      };
    },
  });
})();
