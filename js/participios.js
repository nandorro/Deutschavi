// Juego «Participios por grupos» · los verbos que forman el Partizip II igual, juntos para practicar el patrón
(function () {
  const { esc, pick, shuffle } = U;
  const P = window.PARTICIPIOS;
  const grupo = (id) => P.grupos.find((g) => g.id === id);
  const miembros = (id) => P.verbos.filter((v) => v.grupo === id && v.semana <= SEMANA_ACTUAL);
  let anterior = null, gi = -1, cola = [];

  const familia = (v) => `<div class="pista"><b>${esc(grupo(v.grupo).titulo)}</b>: ${esc(grupo(v.grupo).regla)}</div>
    <div class="pista">Mismo patrón: ${miembros(v.grupo).map((m) => `${esc(m.inf)} → <b>${esc(m.part)}</b>`).join(" · ")}</div>`;

  Juegos.participios = crearJuego({
    clave: "participios", titulo: "Participios por grupos", subtitulo: "Los verbos que forman el Partizip II igual, juntos",
    modos: ["Mezclado", "Grupo a grupo", "¿Qué grupo?"],
    nueva(modo) {
      if (modo === 2) {
        const v = pick(miembros(pick(P.grupos).id));
        return {
          etiqueta: "¿Cómo forma el Partizip II?", cuerpo: `${esc(v.inf)} → ${esc(v.part)}`, clase: "numero-grande",
          pista: `Significado: <b>${esc(v.es)}</b>`, tipo: "elegir", opciones: shuffle(P.grupos.map((g) => g.titulo)),
          correctas: [grupo(v.grupo).titulo], canon: grupo(v.grupo).titulo, extra: familia(v),
        };
      }
      let v, pista;
      if (modo === 0) {
        const todos = P.verbos.filter((x) => x.semana <= SEMANA_ACTUAL);
        do { v = pick(todos); } while (todos.length > 1 && v.inf === anterior);
        pista = `Significado: <b>${esc(v.es)}</b> · auxiliar: <b>${esc(v.aux)}</b>`;
      } else {
        if (!cola.length) {                              // siguiente grupo (los miembros de un grupo van seguidos)
          gi = (gi + 1) % P.grupos.length;
          cola = shuffle(miembros(P.grupos[gi].id));
        }
        const g = P.grupos[gi];
        v = cola.shift();
        pista = `<b>Grupo ${gi + 1} de ${P.grupos.length} · ${esc(g.titulo)}</b><br>${esc(g.regla)}<br>
          Verbos de este grupo: ${miembros(g.id).map((m) => esc(m.inf)).join(" · ")}<br>Significado: <b>${esc(v.es)}</b>`;
      }
      anterior = v.inf;
      return {
        etiqueta: "Escribe el Partizip II", cuerpo: esc(v.inf), clase: "numero-grande", pista,
        tipo: "teclear", campo: "Partizip II", placeholder: "p. ej. gemacht",
        correctas: [v.part], canon: v.part, extra: familia(v),
      };
    },
  });
})();
