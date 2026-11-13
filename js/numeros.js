// Juego 1 · Números: aparece la cifra y se escribe en alemán.
window.Juegos = window.Juegos || {};
Juegos.numeros = {
  iniciar(el) {
    const { rand, pick, esc } = U;
    const NIVELES = [
      { nombre: "Del 0 al 20", sem: 1, gen: () => rand(0, 20) },
      { nombre: "Del 21 al 100", sem: 1, gen: () => rand(21, 100) },
      { nombre: "Del 100 al 999", sem: 2, gen: () => rand(100, 999) },
      { nombre: "Del 1.000 al 999.999", sem: 2,
        gen: () => pick([() => rand(1000, 9999), () => rand(10000, 99999), () => rand(100000, 999999)])() },
      { nombre: "Millones", sem: 2,
        gen: () => rand(1, 9) * 1000000 + pick([0, 0, 500000, 100000, 250000, 300000]) },
    ].filter((n) => n.sem <= SEMANA_ACTUAL);

    let nivel = 0, q = null, res = null;

    function nueva() {
      let n;
      do { n = NIVELES[nivel].gen(); } while (n === q);
      q = n; res = null;
      pintar(true);
    }

    function pintar(enfocar) {
      let cuerpo = "";
      if (res === null) {
        cuerpo = `<form id="f" autocomplete="off">
            <label for="resp">Tu respuesta</label>
            <input id="resp" type="text" inputmode="text" enterkeyhint="done" autocapitalize="off"
                   autocorrect="off" spellcheck="false" autocomplete="off" placeholder="p. ej. einundzwanzig">
            <button class="btn primario" type="submit">Comprobar ✚</button>
          </form>
          <p class="nota">¿Sin teclado alemán? Escribe ä = ae, ö = oe, ü = ue y ß = ss.</p>
          <p id="aviso" class="aviso" hidden>Escribe tu respuesta y pulsa «Comprobar». Sin presión, tómate tu tiempo.</p>`;
      } else {
        const canon = NumerosDe.palabra(q);
        if (res.v === "ok") {
          cuerpo = U.resultadoOk(`<div class="palabra"><span class="bien">${esc(canon)}</span></div>`);
        } else if (res.v === "alt") {
          cuerpo = U.resultadoOk(`<div>¡Correcto! Con teclado alemán se escribe: <span class="palabra"><span class="bien">${esc(canon)}</span></span></div>`);
        } else {
          const [bien, tuya] = U.diffHtml(canon, res.resp);
          cuerpo = U.resultadoKo(`<div class="palabra">${bien}</div>
            <div class="tuya">Tu respuesta: ${tuya}</div>
            <div class="pista">En rojo, las letras que faltaban o no coincidían.</div>`);
        }
        cuerpo += `<button id="sig" class="btn primario">Siguiente →</button>`;
      }
      el.innerHTML = cabecera("Números", "Escribe la cifra en alemán, todo junto y sin prisa") +
        U.marcadorHtml("numeros") +
        `<label for="nivel">Nivel</label>
         <select id="nivel">${NIVELES.map((n, i) => `<option value="${i}" ${i === nivel ? "selected" : ""}>${n.nombre}</option>`).join("")}</select>` +
        U.tarjeta("¿Cómo se escribe en alemán?", NumerosDe.conPuntos(q), "numero-grande") + cuerpo;

      el.querySelector("#nivel").onchange = (e) => { nivel = Number(e.target.value); nueva(); };
      const f = el.querySelector("#f");
      if (f) {
        const input = el.querySelector("#resp");
        f.onsubmit = (e) => {
          e.preventDefault();
          if (!input.value.trim()) { el.querySelector("#aviso").hidden = false; return; }
          const v = U.evaluar(input.value, NumerosDe.formasValidas(q));
          U.registrar("numeros", v !== "ko");
          res = { v, resp: input.value };
          pintar(true);
        };
        if (enfocar) input.focus();
      }
      const sig = el.querySelector("#sig");
      if (sig) { sig.onclick = nueva; if (enfocar) sig.focus(); }
    }

    nueva();
  },
};
