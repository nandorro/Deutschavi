// Juego 7 · La hora (Tema 3)
(function () {
  const { pick } = U;
  Juegos.hora = crearJuego({
    clave: "hora", titulo: "La hora", subtitulo: "Wie spät ist es?",
    modos: ["Formal (24 h)", "Coloquial (12 h)"],
    nueva(modo) {
      const H = HoraDe;
      const h = pick(modo === 0 ? H.HORAS_FORMAL : H.HORAS_COLOQUIAL);
      const m = pick(modo === 0 ? H.MIN_FORMAL : H.MIN_COLOQUIAL);
      const correctas = modo === 0 ? H.formal(h, m) : H.coloquial(h, m);
      return {
        etiqueta: "¿Cómo se dice la hora en alemán?", cuerpo: H.texto(h, m), clase: "numero-grande",
        pista: modo === 0
          ? "Formato oficial: la hora, la palabra <b>Uhr</b> y los minutos."
          : "Recuerda: <b>halb</b> + la hora siguiente (8:30 = halb neun); <b>nach</b> / <b>vor</b> para los minutos.",
        tipo: "teclear", campo: "La hora en alemán", placeholder: "p. ej. Es ist halb neun",
        correctas, canon: correctas[0],
      };
    },
  });
})();
