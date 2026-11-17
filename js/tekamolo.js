// Juego TeKaMoLo · ordena los bloques de tiempo, causa, modo y lugar. Si aciertas: ¡TEKAMOLO!
window.Juegos = window.Juegos || {};
Juegos.tekamolo = {
  iniciar(el) {
    const { esc, pick, shuffle } = U;
    const T = TekamoloDe;
    let f = null, bl = [], orden = [], elegidas = [], res = null;

    function nueva() {
      let n;
      do { n = pick(T.FRASES); } while (T.FRASES.length > 1 && f && n.es === f.es);
      f = n;
      bl = T.bloques(f);
      orden = bl.map((_, i) => i);
      for (let k = 0; k < 30; k++) {          // que no salga ya en orden TEKAMOLO
        orden = shuffle(orden);
        if (T.palabra(orden.map((j) => bl[j].tipo)) !== "TEKAMOLO") break;
      }
      elegidas = []; res = null;
      pintar(true);
    }

    function comprobar() {
      const tipos = elegidas.map((j) => bl[j].tipo);
      const r = T.evaluar(tipos);
      U.registrar("tekamolo", r.ok);
      res = { ok: r.ok, palabra: r.palabra, tipos };
      pintar(true);
    }

    // Frase correcta con cada bloque rotulado (TE / KA / MO / LO)
    const frasePintada = () => `<div class="cinta">${esc(f.sv)} ${bl.map((b) =>
      `<span class="bloque bloque-${b.tipo.toLowerCase()}" title="${esc(T.NOMBRE[b.tipo])}">${esc(b.texto)}<sup>${b.tipo}</sup></span>`).join(" ")}.</div>`;
    const silabas = (tipos) => tipos.map((t) => `<span class="sil sil-${t.toLowerCase()}">${t}</span>`).join("");

    function pintar(enfocar) {
      let cuerpo = "";
      if (res === null) {
        const libres = orden.filter((j) => !elegidas.includes(j));
        const bandeja = `<span class="ficha fija">${esc(f.sv)}</span>` + (elegidas.length
          ? elegidas.map((j) => `<button class="ficha" data-quitar="${j}" title="Toca para quitar">${esc(bl[j].texto)}</button>`).join("")
          : `<span class="vacia">Toca los bloques de abajo…</span>`);
        cuerpo = `<div class="bandeja">${bandeja}</div>
          <div class="fichas">${libres.map((j) => `<button class="chip" data-j="${j}">${esc(bl[j].texto)}</button>`).join("")}</div>
          <div class="fila-botones">
            <button class="btn" id="deshacer" ${elegidas.length ? "" : "disabled"}>↩ Deshacer</button>
            <button class="btn" id="reiniciar" ${elegidas.length ? "" : "disabled"}>✕ Reiniciar</button>
            <button class="btn primario" id="comprobar" ${libres.length ? "disabled" : ""}>Comprobar ✚</button>
          </div>`;
      } else if (res.ok) {
        cuerpo = U.resultadoOk(`<div class="tekamolo-grande">TEKAMOLO!!!!!!</div><div class="silabas">${silabas(res.tipos)}</div>
          ${frasePintada()}<div class="pista">Temporal · Kausal · Modal · Lokal</div>`) +
          `<button id="sig" class="btn primario">Siguiente →</button>`;
      } else {
        cuerpo = U.resultadoKo(`<div class="tekamolo-grande ko">${esc(res.palabra)}</div><div class="silabas">${silabas(res.tipos)}</div>
          <div class="pista"><b>Da fehlt noch etwas!</b> „${esc(res.palabra)}“ ist nicht das Zauberwort. Es heißt <b>TEKAMOLO</b>:
          erst <b>Te</b>mporal, dann <b>Ka</b>usal, dann <b>Mo</b>dal und zuletzt <b>Lo</b>kal.</div>
          <div class="nota">Te = cuándo · Ka = por qué · Mo = cómo · Lo = dónde. Falta algo en tu orden. El orden correcto es:</div>
          ${frasePintada()}`) + `<button id="sig" class="btn primario">Siguiente →</button>`;
      }

      el.innerHTML = cabecera("TeKaMoLo", "Zeit · Grund · Art und Weise · Ort") +
        U.marcadorHtml("tekamolo") + U.tarjeta("Significado", esc(f.es)) + cuerpo;

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
