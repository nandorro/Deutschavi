// Juego 3 · Frases desordenadas: tocar las palabras en el orden correcto.
window.Juegos = window.Juegos || {};
Juegos.frases = {
  iniciar(el) {
    const { esc, pick, shuffle, separar } = U;
    const FRASES = window.FRASES.filter((f) => f.semana <= SEMANA_ACTUAL);
    let f = null, toks = [], validas = [], orden = [], elegidas = [], res = null;

    function nueva() {
      let n;
      do { n = pick(FRASES); } while (FRASES.length > 1 && f && n.de === f.de);
      f = n;
      toks = separar(f.de);
      validas = [toks, ...f.alt.map(separar)].map((v) => v.join(" "));
      orden = toks.map((_, i) => i);
      for (let k = 0; k < 30; k++) {          // que no salga ya ordenada
        orden = shuffle(orden);
        if (!validas.includes(orden.map((j) => toks[j]).join(" "))) break;
      }
      elegidas = []; res = null;
      pintar(true);
    }

    function comprobar() {
      const dadas = elegidas.map((j) => toks[j]);
      const ok = validas.includes(dadas.join(" "));
      U.registrar("frases", ok);
      res = { ok, dadas };
      pintar(true);
    }

    function pintar(enfocar) {
      let cuerpo = "";
      if (res === null) {
        const libres = orden.filter((j) => !elegidas.includes(j));
        const bandeja = elegidas.length
          ? elegidas.map((j) => `<button class="ficha" data-quitar="${j}" title="Toca para quitar">${esc(toks[j])}</button>`).join("")
          : `<span class="vacia">Toca las palabras de abajo…</span>`;
        cuerpo = `<div class="bandeja">${bandeja}</div>
          <div class="fichas">${libres.map((j) => `<button class="chip" data-j="${j}">${esc(toks[j])}</button>`).join("")}</div>
          <div class="fila-botones">
            <button class="btn" id="deshacer" ${elegidas.length ? "" : "disabled"}>↩ Deshacer</button>
            <button class="btn" id="reiniciar" ${elegidas.length ? "" : "disabled"}>✕ Reiniciar</button>
            <button class="btn primario" id="comprobar" ${libres.length ? "disabled" : ""}>Comprobar ✚</button>
          </div>`;
      } else if (res.ok) {
        cuerpo = U.resultadoOk(`<div class="palabra"><span class="bien">${esc(res.dadas.join(" "))}</span></div>`) +
          `<button id="sig" class="btn primario">Siguiente →</button>`;
      } else {
        const partes = toks.map((t, pos) =>
          `<span class="${res.dadas[pos] === t ? "bien" : "mal"}">${esc(t)}</span>`);
        cuerpo = U.resultadoKo(`<div class="cinta">${partes.join(" ")}</div>
          <div class="tuya">Tu orden: ${esc(res.dadas.join(" "))}</div>
          <div class="pista">En rojo, las palabras que no iban en ese lugar. Recuerda: en las frases afirmativas el verbo conjugado va en la posición 2.</div>`) +
          `<button id="sig" class="btn primario">Siguiente →</button>`;
      }

      el.innerHTML = cabecera("Frases desordenadas", "Toca las palabras en el orden correcto") +
        U.marcadorHtml("frases") + U.tarjeta("Significado", esc(f.es)) + cuerpo;

      el.querySelectorAll("[data-j]").forEach((b) => b.onclick = () => { elegidas.push(Number(b.dataset.j)); pintar(false); });
      el.querySelectorAll("[data-quitar]").forEach((b) => b.onclick = () => {
        elegidas = elegidas.filter((j) => j !== Number(b.dataset.quitar)); pintar(false);
      });
      const bind = (id, fn) => { const b = el.querySelector(id); if (b) b.onclick = fn; };
      bind("#deshacer", () => { elegidas.pop(); pintar(false); });
      bind("#reiniciar", () => { elegidas = []; pintar(false); });
      bind("#comprobar", comprobar);
      const sig = el.querySelector("#sig");
      if (sig) { sig.onclick = nueva; if (enfocar) sig.focus(); }
    }

    nueva();
  },
};
