// Utilidades comunes: comparar texto, letras en rojo, azar, marcador y mensajes amables.
(function (root) {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const normaliza = (s) => s.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
  // Equivalencias de teclado español: ae/oe/ue/ss
  const plegar = (s) => normaliza(s).replace(/ä/g, "ae").replace(/ö/g, "oe")
    .replace(/ü/g, "ue").replace(/ß/g, "ss");

  // "ok" exacta · "alt" correcta escrita con ae/oe/ue/ss · "ko" incorrecta
  function evaluar(respuesta, correctas) {
    const r = normaliza(respuesta);
    if (correctas.some((c) => normaliza(c) === r)) return "ok";
    if (correctas.some((c) => plegar(c) === plegar(r))) return "alt";
    return "ko";
  }

  // Marca qué letras de a y b coinciden (subsecuencia común más larga).
  function marcas(a, b) {
    const A = a.toLowerCase(), B = b.toLowerCase();
    const n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const okA = new Array(n).fill(false), okB = new Array(m).fill(false);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { okA[i] = okB[j] = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
      else j++;
    }
    return [okA, okB];
  }

  // [palabra correcta con las letras falladas en rojo, respuesta del alumno con lo que sobra tachado]
  function diffHtml(correcta, respuesta) {
    const b = respuesta.normalize("NFC").trim();
    const [okA, okB] = marcas(correcta, b);
    const pinta = (texto, ok, clase, verEspacio) => Array.from(texto).map((ch, i) =>
      ok[i] ? esc(ch)
        : `<span class="${clase}">${ch === " " && verEspacio ? "·" : esc(ch)}</span>`).join("");
    return [pinta(correcta, okA, "mal", true), pinta(b, okB, "extra", false)];
  }

  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // Palabras de una frase; la puntuación va pegada a su palabra.
  const separar = (frase) => frase.trim().split(/\s+/);
  const esMayus = (tok) => !!tok && tok[0] !== tok[0].toLowerCase();

  // ---- almacenamiento (puede fallar en modo privado: siempre con try/catch)
  // Si el navegador no deja guardar (p. ej. pestaña privada), se usa la memoria de la página.
  const memoria = {};
  const almacen = {
    leer(k, def) {
      try { const v = localStorage.getItem(k); if (v) return JSON.parse(v); } catch (e) { /* usar memoria */ }
      return k in memoria ? JSON.parse(memoria[k]) : def;
    },
    guardar(k, v) {
      memoria[k] = JSON.stringify(v);
      try { localStorage.setItem(k, memoria[k]); } catch (e) { /* sin almacenamiento */ }
    },
  };

  // ---- marcador (aciertos · intentos · racha), recordado entre visitas
  const KEY = "deutschavi_marcador_v1";
  const marcadorDe = (juego) => (almacen.leer(KEY, {})[juego] || { a: 0, i: 0, r: 0 });
  function registrar(juego, acierto) {
    const todo = almacen.leer(KEY, {});
    const m = todo[juego] || { a: 0, i: 0, r: 0 };
    m.i++;
    if (acierto) { m.a++; m.r++; } else m.r = 0;
    todo[juego] = m;
    almacen.guardar(KEY, todo);
  }
  function marcadorHtml(juego) {
    const m = marcadorDe(juego);
    return `<div class="marcador"><div><b>${m.a}</b><span>Aciertos</span></div>` +
      `<div><b>${m.i}</b><span>Intentos</span></div>` +
      `<div><b>${m.r} ♥</b><span>Racha</span></div></div>`;
  }

  const ACIERTOS = ["¡Muy bien! Diagnóstico acertado.", "¡Sehr gut! Eso estaba perfecto.",
    "¡Excelente! Tu alemán goza de buena salud.", "¡Alles gut! Lo has clavado.",
    "¡Estupendo! Sigue así, doctor/a."];
  const FALLOS = ["No pasa nada, así se aprende. Mira cómo se escribe:",
    "¡Casi! Cada error es parte de la recuperación. Así es:",
    "Tranquilo/a, ya lo tienes casi. Fíjate en esto:",
    "Un pequeño ajuste y listo. Así se escribe:"];
  const resultadoOk = (extra = "") =>
    `<div class="resultado ok"><div class="titulo">${pick(ACIERTOS)}</div>${extra}</div>`;
  const resultadoKo = (html) =>
    `<div class="resultado ko"><div class="titulo">${pick(FALLOS)}</div>${html}</div>`;
  const tarjeta = (etiqueta, html, clase = "frase-grande") =>
    `<div class="tarjeta"><div class="etiqueta">${esc(etiqueta)}</div><div class="${clase}">${html}</div></div>`;

  const api = { esc, normaliza, plegar, evaluar, diffHtml, rand, pick, shuffle, separar, esMayus,
    almacen, registrar, marcadorDe, marcadorHtml, resultadoOk, resultadoKo, tarjeta };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.U = api;
})(typeof window !== "undefined" ? window : globalThis);
