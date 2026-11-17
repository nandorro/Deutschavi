// Motor común de los juegos de una pregunta por pantalla.
// Cada juego solo aporta sus preguntas; el motor pinta, comprueba, puntúa y avisa con amabilidad.
//
// crearJuego({ clave, titulo, subtitulo, modos: ["Modo A", "Modo B"], nueva(modo) → pregunta })
// Una pregunta es: { etiqueta, cuerpo (html), pista (html), tipo: "teclear" | "elegir",
//   correctas: [textos válidos], canon (texto que se muestra como correcto), opciones (si elegir),
//   placeholder, campo, extra (html tras responder) }
window.Juegos = window.Juegos || {};
function crearJuego(cfg) {
  return {
    iniciar(el) {
      const { esc } = U;
      let modo = 0, q = null, res = null;

      function nueva() { q = cfg.nueva(modo); res = null; pintar(true); }

      function responder(valor) {
        const limpio = valor.replace(/[.!?¡¿\s]+$/g, "").replace(/^[¡¿\s]+/g, "");
        const v = U.evaluar(limpio, q.correctas);
        U.registrar(cfg.clave, v !== "ko");
        res = { v, resp: valor };
        pintar(true);
      }

      // Variante correcta más parecida a lo escrito (para marcar bien las letras en rojo)
      function parecida(resp) {
        const r = resp.trim().length;
        return q.correctas.slice().sort((a, b) => Math.abs(a.length - r) - Math.abs(b.length - r))[0];
      }

      function pintar(enfocar) {
        let cuerpo = U.tarjeta(q.etiqueta, q.cuerpo, q.clase || "frase-grande");
        if (q.pista) cuerpo += `<div class="pista">${q.pista}</div>`;
        if (res === null) {
          if (q.tipo === "teclear") {
            cuerpo += `<form id="f" autocomplete="off"><label for="resp">${esc(q.campo || "Tu respuesta")}</label>
              <input id="resp" type="text" enterkeyhint="done" autocapitalize="off" autocorrect="off"
                     spellcheck="false" autocomplete="off" placeholder="${esc(q.placeholder || "")}">
              <button class="btn primario" type="submit">Comprobar ✚</button></form>
              <p class="nota">¿Sin teclado alemán? Escribe ä = ae, ö = oe, ü = ue y ß = ss.</p>
              <p id="aviso" class="aviso" hidden>Escribe tu respuesta y pulsa «Comprobar». ¡Tú puedes!</p>`;
          } else {
            cuerpo += `<div class="opciones">${q.opciones.map((o) =>
              `<button class="btn opcion" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div>`;
          }
        } else {
          if (res.v !== "ko") {
            cuerpo += U.resultadoOk(`<div class="palabra"><span class="bien">${esc(q.canon)}</span></div>${q.extra || ""}`);
          } else if (q.tipo === "teclear") {
            const [bien, tuya] = U.diffHtml(parecida(res.resp), res.resp);
            cuerpo += U.resultadoKo(`<div class="palabra">${bien}</div>
              <div class="tuya">Tu respuesta: ${tuya}</div>
              <div class="pista">En rojo, las letras que faltaban o no coincidían.</div>${q.extra || ""}`);
          } else {
            cuerpo += U.resultadoKo(`<div class="palabra"><span class="bien">${esc(q.canon)}</span></div>
              <div class="tuya">Tu respuesta: ${esc(res.resp)}</div>${q.extra || ""}`);
          }
          cuerpo += `<button id="sig" class="btn primario">Siguiente →</button>`;
        }

        const segmentos = cfg.modos.length > 1
          ? `<div class="segmentos" role="tablist">${cfg.modos.map((m, i) =>
              `<button class="seg ${i === modo ? "activo" : ""}" data-m="${i}">${esc(m)}</button>`).join("")}</div>` : "";
        el.innerHTML = cabecera(cfg.titulo, cfg.subtitulo) + U.marcadorHtml(cfg.clave) + segmentos + cuerpo;

        el.querySelectorAll(".seg").forEach((b) => b.onclick = () => { modo = Number(b.dataset.m); nueva(); });
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
        el.querySelectorAll(".opcion").forEach((b) => b.onclick = () => responder(b.dataset.o));
        const sig = el.querySelector("#sig");
        if (sig) { sig.onclick = nueva; if (enfocar) sig.focus(); }
      }

      nueva();
    },
  };
}
