// Juego 8 · Vocabulario del Tema 3.5: artículo y plural
(function () {
  const { esc, pick } = U;
  let anterior = null;
  Juegos.vocabulario = crearJuego({
    clave: "vocabulario", titulo: "Vocabulario: artículo y plural", subtitulo: "Bebidas, restaurante, ciudad y transporte",
    modos: ["¿der, die o das?", "El plural"],
    nueva(modo) {
      const todos = window.VOCAB.filter((x) => x.semana <= SEMANA_ACTUAL && (modo === 0 || x.plural));
      const pool = todos.filter((x) => x.sing !== anterior);
      const n = pick(pool.length ? pool : todos);
      anterior = n.sing;
      const ficha = `<div class="pista"><b>${esc(n.art)} ${esc(n.sing)}</b>` +
        (n.plural ? ` · plural: die ${esc(n.plural)}` : " · sin plural") + ` · ${esc(n.es)}</div>`;
      if (modo === 0) {
        return {
          etiqueta: "¿Qué artículo lleva?", cuerpo: `${esc(n.sing)}<div class="pista">${esc(n.es)}</div>`, clase: "numero-grande",
          tipo: "elegir", opciones: ["der", "die", "das"], correctas: [n.art], canon: `${n.art} ${n.sing}`, extra: ficha,
        };
      }
      return {
        etiqueta: "Escribe el plural", cuerpo: `${esc(n.art)} ${esc(n.sing)}<div class="pista">${esc(n.es)}</div>`,
        clase: "numero-grande", tipo: "teclear", campo: "Plural", placeholder: "p. ej. die Tische",
        correctas: [n.plural, `die ${n.plural}`], canon: `die ${n.plural}`, extra: ficha,
      };
    },
  });
})();
