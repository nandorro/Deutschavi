// Juego «¿Cómo se dice?» · vocabulario y frases del Tema 3.5 (bebidas, carta, mesa, ciudad, transporte)
(function () {
  const { esc, pick, shuffle } = U;
  const limpia = (s) => s.replace(/[.!?¡¿\s]+$/g, "").replace(/^[¡¿\s]+/g, "");
  const sinArt = (s) => s.replace(/^(der|die|das) /, "");
  const palabras = () => window.PALABRAS.lista.filter((x) => x.semana <= SEMANA_ACTUAL);
  const frases = () => window.FRASES_REST.filter((x) => x.semana <= SEMANA_ACTUAL);
  let anterior = null;

  const elegirOtro = (lista, clave) => { let x; do { x = pick(lista); } while (lista.length > 1 && x[clave] === anterior); return x; };

  Juegos.comosedice = crearJuego({
    clave: "comosedice", titulo: "¿Cómo se dice?", subtitulo: "Vocabulario y frases del restaurante, la ciudad y el transporte",
    modos: ["Español → alemán", "Alemán → español", "Frases (elige)", "Frases (escribe)"],
    nueva(modo) {
      if (modo >= 2) {
        const todas = frases();
        const f = elegirOtro(modo === 3 ? todas.filter((x) => x.escribir) : todas, "es");
        anterior = f.es;
        const correctas = f.de.map(limpia);
        const extra = `<div class="pista">${esc(f.de.join("  /  "))}</div>`;
        if (modo === 3) {
          return {
            etiqueta: `En el restaurante · ${f.rol}: escríbelo en alemán`, cuerpo: esc(f.es),
            tipo: "teclear", campo: "En alemán", placeholder: "p. ej. Guten Appetit", correctas, canon: f.de[0], extra,
          };
        }
        const otras = shuffle(todas.filter((x) => x !== f)).slice(0, 3).map((x) => x.de[0]);
        return {
          etiqueta: `En el restaurante · ${f.rol}: ¿cómo se dice?`, cuerpo: esc(f.es),
          tipo: "elegir", opciones: shuffle([f.de[0], ...otras]), correctas, canon: f.de[0], extra,
        };
      }
      const todas = palabras();
      const p = elegirOtro(todas, "es");
      anterior = p.es;
      const cat = window.PALABRAS.categorias[p.cat];
      const extra = `<div class="pista">${esc(p.de.join("  /  "))} = ${esc(p.es)}</div><div class="pista">${esc(cat)}</div>`;
      if (modo === 0) {
        const nombre = /^(der|die|das) /.test(p.de[0]);
        return {
          etiqueta: `¿Cómo se dice en alemán? · ${cat}`, cuerpo: esc(p.es), clase: "numero-grande",
          pista: nombre ? "Escríbelo <b>con su artículo</b> (der, die o das)." : "Es un verbo: escribe el infinitivo.",
          tipo: "teclear", campo: "En alemán", placeholder: nombre ? "p. ej. das Bier" : "p. ej. bestellen",
          correctas: [...p.de, ...p.de.map(sinArt)], canon: p.de[0], extra,
        };
      }
      const mismos = todas.filter((x) => x !== p && x.cat === p.cat);
      const pool = shuffle(mismos.length >= 3 ? mismos : todas.filter((x) => x !== p)).slice(0, 3);
      return {
        etiqueta: `¿Qué significa? · ${cat}`, cuerpo: esc(p.de[0]), clase: "numero-grande",
        tipo: "elegir", opciones: shuffle([p.es, ...pool.map((x) => x.es)]), correctas: [limpia(p.es)], canon: p.es, extra,
      };
    },
  });
})();
