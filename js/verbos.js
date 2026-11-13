// Juego 2 · Verbos separables (solo los que están en el temario).
window.Juegos = window.Juegos || {};
Juegos.verbos = {
  iniciar(el) {
    const { esc, pick, shuffle } = U;
    const VERBOS = window.VERBOS.filter((v) => v.semana <= SEMANA_ACTUAL);
    const PREFIJOS = [...new Set(VERBOS.map((v) => v.prefijo))].sort();
    let modo = 0, ayuda = true, verbo = null, frase = "", opciones = [], res = null;

    function nueva() {
      let v;
      do { v = pick(VERBOS); } while (VERBOS.length > 1 && verbo && v.infinitivo === verbo.infinitivo);
      verbo = v;
      frase = pick(v.frases);
      const otros = PREFIJOS.filter((p) => p !== v.prefijo);
      opciones = shuffle([...shuffle(otros).slice(0, 3), v.prefijo]);
      res = null;
      pintar(true);
    }

    // Sustituye la última palabra (el prefijo) por un hueco.
    function sinPrefijo(f, prefijo) {
      const pal = f.split(/\s+/), ultima = pal[pal.length - 1];
      const signos = ultima.toLowerCase().startsWith(prefijo) ? ultima.slice(prefijo.length) : "";
      pal[pal.length - 1] = "_____" + signos;
      return pal.join(" ");
    }

    function responder(valor) {
      const v = U.evaluar(valor, [verbo.prefijo]);
      U.registrar("verbos", v !== "ko");
      res = { v, resp: valor };
      pintar(true);
    }

    function pintar(enfocar) {
      let cuerpo = "";
      const resumen = `<div class="pista">${esc(verbo.infinitivo)} = <b>${esc(verbo.prefijo)}</b> + ${esc(verbo.base)} · ${esc(verbo.es)}</div>`;
      if (modo === 0) {
        let pista = `Significado: <b>${esc(verbo.es)}</b>`;
        if (ayuda) pista += ` &nbsp;·&nbsp; Verbo: <b>${esc(verbo.infinitivo)}</b>`;
        cuerpo = `<label class="interruptor"><input type="checkbox" id="ayuda" ${ayuda ? "checked" : ""}> Mostrar el verbo en infinitivo como ayuda</label>` +
          U.tarjeta("Escribe el prefijo que falta", esc(sinPrefijo(frase, verbo.prefijo))) +
          `<div class="pista">${pista}</div>`;
        if (res === null) {
          cuerpo += `<form id="f" autocomplete="off"><label for="resp">Prefijo</label>
            <input id="resp" type="text" enterkeyhint="done" autocapitalize="off" autocorrect="off"
                   spellcheck="false" autocomplete="off" placeholder="p. ej. auf">
            <button class="btn primario" type="submit">Comprobar ✚</button></form>
            <p class="nota">¿Sin teclado alemán? Escribe ä = ae, ö = oe, ü = ue y ß = ss.</p>
            <p id="aviso" class="aviso" hidden>Escribe el prefijo y pulsa «Comprobar». ¡Tú puedes!</p>`;
        }
      } else {
        cuerpo = U.tarjeta("¿Qué prefijo se separa de este verbo?",
          `${esc(verbo.infinitivo)}<div class="pista">${esc(verbo.es)}</div>`, "numero-grande");
        if (res === null) {
          cuerpo += `<div class="opciones">${opciones.map((p) => `<button class="btn opcion" data-p="${esc(p)}">${esc(p)}</button>`).join("")}</div>`;
        }
      }
      if (res !== null) {
        const completa = esc(frase);
        if (res.v !== "ko") {
          cuerpo += U.resultadoOk(`<div class="palabra"><span class="bien">${completa}</span></div>${resumen}`);
        } else {
          const [bien, tuya] = U.diffHtml(verbo.prefijo, res.resp);
          cuerpo += U.resultadoKo(`<div class="palabra">${bien}</div>
            <div class="tuya">Tu respuesta: ${tuya}</div><div class="pista">${completa}</div>${resumen}`);
        }
        cuerpo += `<button id="sig" class="btn primario">Siguiente →</button>`;
      }

      el.innerHTML = cabecera("Verbos separables", "El prefijo viaja al final de la frase") +
        U.marcadorHtml("verbos") +
        `<div class="segmentos" role="tablist">
           <button class="seg ${modo === 0 ? "activo" : ""}" data-m="0">Completa la frase</button>
           <button class="seg ${modo === 1 ? "activo" : ""}" data-m="1">¿Cuál es el prefijo?</button></div>` + cuerpo;

      el.querySelectorAll(".seg").forEach((b) => b.onclick = () => { modo = Number(b.dataset.m); nueva(); });
      const chk = el.querySelector("#ayuda");
      if (chk) chk.onchange = () => { ayuda = chk.checked; pintar(false); };
      const f = el.querySelector("#f");
      if (f) {
        const input = el.querySelector("#resp");
        f.onsubmit = (e) => {
          e.preventDefault();
          if (!input.value.trim()) { el.querySelector("#aviso").hidden = false; return; }
          responder(input.value);
        };
        if (enfocar) input.focus();
      }
      el.querySelectorAll(".opcion").forEach((b) => b.onclick = () => responder(b.dataset.p));
      const sig = el.querySelector("#sig");
      if (sig) { sig.onclick = nueva; if (enfocar) sig.focus(); }
    }

    nueva();
  },
};
