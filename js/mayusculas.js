// Juego 4 · ¿Qué mayúscula falta? (sustantivos, nombres propios, Sie...)
window.Juegos = window.Juegos || {};
Juegos.mayusculas = {
  iniciar(el) {
    const { esc, pick, separar, esMayus } = U;
    const FRASES = window.FRASES.filter((f) => f.semana <= SEMANA_ACTUAL);
    // Modo fácil: hace falta al menos un sustantivo que no sea la primera palabra.
    const FACIL = FRASES.filter((f) => separar(f.de).slice(1).some(esMayus));
    let facil = true, f = null, toks = [], objetivo = null, sel = new Set(), res = null;

    function nueva() {
      const pool = facil ? FACIL : FRASES;
      let n;
      do { n = pick(pool); } while (pool.length > 1 && f && n.de === f.de);
      f = n;
      toks = separar(f.de);
      objetivo = facil ? pick(toks.map((t, j) => j).filter((j) => j > 0 && esMayus(toks[j]))) : null;
      sel = new Set(); res = null;
      pintar(true);
    }

    const necesarias = () => facil ? new Set([objetivo]) : new Set(toks.map((t, j) => j).filter((j) => esMayus(toks[j])));
    const minuscula1 = (t) => t[0].toLowerCase() + t.slice(1);
    const visible = (t, j) => facil ? (j === objetivo ? minuscula1(t) : t) : t.toLowerCase();

    function comprobar() {
      const need = necesarias();
      const ok = need.size === sel.size && [...need].every((j) => sel.has(j));
      U.registrar("mayusculas", ok);
      res = { ok, sel: new Set(sel) };
      pintar(true);
    }

    function pintar(enfocar) {
      let cuerpo = "";
      if (res === null) {
        const consigna = facil
          ? "Toca la palabra que debería llevar mayúscula."
          : "Toca <b>todas</b> las palabras que deben ir con mayúscula (sustantivos, nombres propios, la primera palabra de la frase y «Sie» de cortesía).";
        cuerpo = `<p>${consigna}</p>
          <div class="fichas">${toks.map((t, j) => `<button class="chip ${sel.has(j) ? "marcada" : ""}" data-j="${j}">${esc(visible(t, j))}</button>`).join("")}</div>
          <button class="btn primario" id="comprobar" ${sel.size ? "" : "disabled"}>Comprobar ✚</button>`;
      } else {
        const need = necesarias();
        const partes = toks.map((t, j) => {
          if (need.has(j) && res.sel.has(j)) return `<span class="bien">${esc(t)}</span>`;
          if (need.has(j)) return `<span class="mal">${esc(t)}</span>`;
          if (res.sel.has(j)) return `<span class="sobra">${esc(t)}</span>`;
          return esc(visible(t, j));
        });
        const linea = `<div class="cinta">${partes.join(" ")}</div>`;
        cuerpo = (res.ok ? U.resultadoOk(linea)
          : U.resultadoKo(linea + `<div class="pista">En rojo, la mayúscula que faltaba${facil ? "" : "; tachado, una palabra que no la necesitaba"}. Recuerda: los sustantivos siempre se escriben con mayúscula.</div>`)) +
          `<button id="sig" class="btn primario">Siguiente →</button>`;
      }

      el.innerHTML = cabecera("¿Qué mayúscula falta?", "En alemán, todos los sustantivos se escriben con mayúscula") +
        U.marcadorHtml("mayusculas") +
        `<div class="segmentos">
           <button class="seg ${facil ? "activo" : ""}" data-m="1">Fácil: falta una</button>
           <button class="seg ${facil ? "" : "activo"}" data-m="0">Avanzado: todas</button></div>` +
        U.tarjeta("Significado", esc(f.es)) + cuerpo;

      el.querySelectorAll(".seg").forEach((b) => b.onclick = () => { facil = b.dataset.m === "1"; nueva(); });
      el.querySelectorAll("[data-j]").forEach((b) => b.onclick = () => {
        const j = Number(b.dataset.j);
        if (facil) { sel = sel.has(j) ? new Set() : new Set([j]); }
        else { sel.has(j) ? sel.delete(j) : sel.add(j); }
        pintar(false);
      });
      const c = el.querySelector("#comprobar");
      if (c) c.onclick = comprobar;
      const sig = el.querySelector("#sig");
      if (sig) { sig.onclick = nueva; if (enfocar) sig.focus(); }
    }

    nueva();
  },
};
