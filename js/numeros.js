// Juego 1 · Números: aparece la cifra y se escribe en alemán.
// Modo automático: el nivel sube con la racha de aciertos seguidos
//   0-4 hasta 100 · 5 centenas · 10 miles · 15 cien miles · 20 millones
window.Juegos = window.Juegos || {};
Juegos.numeros = {
  iniciar(el) {
    const { rand, pick, esc } = U;
    const millones = () => rand(1, 9) * 1000000 + pick([0, 0, 500000, 100000, 250000, 300000]);

    // Escalones del modo automático (según la racha)
    const TRAMOS = [
      { desde: 0, sem: 1, nombre: "Hasta 100", gen: () => rand(0, 100) },
      { desde: 5, sem: 2, nombre: "Centenas", gen: () => rand(100, 999) },
      { desde: 10, sem: 2, nombre: "Miles", gen: () => rand(1000, 99999) },
      { desde: 15, sem: 2, nombre: "Cien miles", gen: () => rand(100000, 999999) },
      { desde: 20, sem: 2, nombre: "Millones", gen: millones },
    ].filter((t) => t.sem <= SEMANA_ACTUAL);

    // Niveles que se pueden elegir a mano
    const NIVELES = [
      { nombre: "Del 0 al 20", sem: 1, gen: () => rand(0, 20) },
      { nombre: "Del 21 al 100", sem: 1, gen: () => rand(21, 100) },
      { nombre: "Del 100 al 999", sem: 2, gen: () => rand(100, 999) },
      { nombre: "Del 1.000 al 999.999", sem: 2,
        gen: () => pick([() => rand(1000, 9999), () => rand(10000, 99999), () => rand(100000, 999999)])() },
      { nombre: "Millones", sem: 2, gen: millones },
    ].filter((n) => n.sem <= SEMANA_ACTUAL);

    const racha = () => U.marcadorDe("numeros").r;
    const tramoActual = () => TRAMOS.filter((t) => racha() >= t.desde).pop();

    let nivel = "auto", q = null, res = null;

    function nueva() {
      const gen = nivel === "auto" ? tramoActual().gen : NIVELES[nivel].gen;
      let n;
      do { n = gen(); } while (n === q);
      q = n; res = null;
      pintar(true);
    }

    function aviso() {
      if (nivel !== "auto") return "";
      const r = racha(), t = tramoActual(), sig = TRAMOS.find((x) => x.desde > r);
      const meta = sig
        ? `Con <b>${sig.desde}</b> aciertos seguidos subes a <b>${sig.nombre}</b>.`
        : "¡Has llegado al nivel máximo!";
      return `<div class="aviso-info">Nivel automático: <b>${t.nombre}</b> · racha ${r} ♥<br>${meta}</div>`;
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
          cuerpo = U.resultadoOk(`<div class="palabra"><span class="bien">${esc(canon)}</span></div>${res.cambio}`);
        } else if (res.v === "alt") {
          cuerpo = U.resultadoOk(`<div>¡Correcto! Con teclado alemán se escribe: <span class="palabra"><span class="bien">${esc(canon)}</span></span></div>${res.cambio}`);
        } else {
          const [bien, tuya] = U.diffHtml(canon, res.resp);
          cuerpo = U.resultadoKo(`<div class="palabra">${bien}</div>
            <div class="tuya">Tu respuesta: ${tuya}</div>
            <div class="pista">En rojo, las letras que faltaban o no coincidían.</div>${res.cambio}`);
        }
        cuerpo += `<button id="sig" class="btn primario">Siguiente →</button>`;
      }
      el.innerHTML = cabecera("Números", "Escribe la cifra en alemán, todo junto y sin prisa") +
        U.marcadorHtml("numeros") + aviso() +
        `<label for="nivel">Nivel</label>
         <select id="nivel"><option value="auto" ${nivel === "auto" ? "selected" : ""}>Automático (sube con tu racha)</option>
           ${NIVELES.map((n, i) => `<option value="${i}" ${i === nivel ? "selected" : ""}>${n.nombre}</option>`).join("")}</select>` +
        U.tarjeta("¿Cómo se escribe en alemán?", NumerosDe.conPuntos(q), "numero-grande") + cuerpo;

      el.querySelector("#nivel").onchange = (e) => {
        nivel = e.target.value === "auto" ? "auto" : Number(e.target.value);
        nueva();
      };
      const f = el.querySelector("#f");
      if (f) {
        const input = el.querySelector("#resp");
        f.onsubmit = (e) => {
          e.preventDefault();
          if (!input.value.trim()) { el.querySelector("#aviso").hidden = false; return; }
          const antes = nivel === "auto" ? tramoActual() : null;
          const v = U.evaluar(input.value, NumerosDe.formasValidas(q));
          U.registrar("numeros", v !== "ko");
          let cambio = "";
          if (antes) {
            const ahora = tramoActual();
            if (ahora !== antes && v !== "ko") cambio = `<div class="pista">🎉 ¡Subes de nivel! Ahora: <b>${ahora.nombre}</b>.</div>`;
            else if (ahora !== antes) cambio = `<div class="pista">Volvemos un escalón (<b>${ahora.nombre}</b>) para coger fuerzas. ¡Tú puedes!</div>`;
          }
          res = { v, resp: input.value, cambio };
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
