// Juego «Wie oft?» · todos los grupos de expresiones de frecuencia del Tema 3
(function () {
  const { esc, pick } = U;
  const F = FrecuenciaDe;
  const TODOS = [...F.VECES, ...F.UNIDADES, ...F.HABITUALES];
  let anterior = null;

  Juegos.frecuencia = crearJuego({
    clave: "frecuencia", titulo: "Wie oft?", subtitulo: "¿Con qué frecuencia? einmal, pro Woche, jeden Tag…",
    modos: ["Expresión", "Combina", "En una frase"],
    nueva(modo) {
      if (modo === 0) {
        let x;
        do { x = pick(TODOS); } while (x.de === anterior);
        anterior = x.de;
        const grupo = Object.values(F.GRUPOS).find((g) => g.lista.includes(x));
        return {
          etiqueta: "¿Cómo se dice en alemán?", cuerpo: esc(x.es), clase: "numero-grande",
          pista: "Grupos: número de veces (einmal…), unidad (pro Tag…) y habituales (jeden Tag…).",
          tipo: "teclear", campo: "En alemán", placeholder: "p. ej. zweimal", correctas: [x.de], canon: x.de,
          extra: `<div class="pista">Grupo: <b>${esc(grupo.nombre)}</b></div>`,
        };
      }
      if (modo === 1) {
        let c;
        do { c = F.combinar(pick(F.VECES), pick(F.UNIDADES)); } while (c.de === anterior);
        anterior = c.de;
        return {
          etiqueta: "Une el número de veces y la unidad de tiempo", cuerpo: esc(c.es), clase: "numero-grande",
          pista: "Estructura: <b>einmal / zweimal / dreimal…</b> + <b>pro Tag / pro Woche / im Monat / im Jahr</b>.",
          tipo: "teclear", campo: "En alemán", placeholder: "p. ej. dreimal pro Woche", correctas: [c.de], canon: c.de,
          extra: `<div class="pista">Wie oft? → ${esc(c.de)}</div>`,
        };
      }
      let a, f, s;
      do {
        a = pick(F.ACTIVIDADES);
        f = pick([...F.combinarTodas(), ...F.HABITUALES]);
        s = F.frase(a, f);
      } while (s.principal === anterior);
      anterior = s.principal;
      return {
        etiqueta: "Responde a la pregunta con una frase", cuerpo: esc(s.pregunta), clase: "frase-grande",
        pista: `Significado de la respuesta: <b>${esc(s.es)}</b>`,
        tipo: "teclear", campo: "Tu frase en alemán", placeholder: "Ich … ",
        correctas: [s.principal.replace(/\.$/, ""), s.alternativa.replace(/\.$/, "")], canon: s.principal,
        extra: `<div class="pista">También vale con la frecuencia al principio: ${esc(s.alternativa)} (el verbo sigue en la posición 2).</div>`,
      };
    },
  });
})();
