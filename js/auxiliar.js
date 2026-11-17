// Juego 5 · ¿Sein o haben? (Tema 3 y Tema 3.5)
(function () {
  const { esc, pick } = U;
  let anterior = null;
  Juegos.auxiliar = crearJuego({
    clave: "auxiliar", titulo: "¿Sein o haben?", subtitulo: "El auxiliar del Perfekt, en segunda posición",
    modos: ["Auxiliar"],
    nueva() {
      const todos = window.PERFEKT.filter((v) => v.semana <= SEMANA_ACTUAL);
      const aux = Math.random() < 0.5 ? "sein" : "haben";     // mitad y mitad
      const pool = todos.filter((v) => v.aux === aux && v.inf !== anterior);
      const v = pick(pool.length ? pool : todos);
      anterior = v.inf;
      const forma = `er ${PerfektDe.AUX[v.aux].er} ${v.part}`;
      return {
        etiqueta: "¿Con qué auxiliar forma el Perfekt este verbo?",
        cuerpo: `${esc(v.inf)}<div class="pista">${esc(v.es)}</div>`, clase: "numero-grande",
        tipo: "elegir", opciones: ["haben", "sein"], correctas: [v.aux], canon: v.aux,
        extra: `<div class="pista">${esc(v.razon)}</div><div class="pista">Perfekt: <b>${esc(forma)}</b></div>`,
      };
    },
  });
})();
