// Prueba de humo de los 4 juegos simulando toques/clics en un DOM simulado.
// Requiere jsdom (solo para probar, no para la web):  npm i jsdom
// Ejecutar:  node tests/test_juegos.js
const assert = require("assert");
const path = require("path");
const { JSDOM } = require("jsdom");
const { palabra } = require("../js/numeros_de.js");

const RAIZ = path.join(__dirname, "..");

async function abrir(ruta, urlRegistro = "") {
  const dom = await JSDOM.fromFile(path.join(RAIZ, "index.html"), {
    runScripts: "dangerously", resources: "usable", pretendToBeVisual: true,
    // los juegos se prueban sin registro (no escribir en la hoja real)
    beforeParse(w) { Object.defineProperty(w, "REGISTRO_URL", { get: () => urlRegistro, set() {} }); },
    url: "file:///" + RAIZ.replace(/\\/g, "/") + "/index.html#/" + ruta,
  });
  const w = dom.window;
  const errores = [];
  w.addEventListener("error", (e) => errores.push(e.message));
  await new Promise((r) => w.addEventListener("load", r));
  await new Promise((r) => setTimeout(r, 50));
  w.document.errores = errores;
  return w;
}
const q = (w, s) => w.document.querySelector(s);
const qa = (w, s) => [...w.document.querySelectorAll(s)];
const txt = (w) => w.document.getElementById("app").textContent;
const marcador = (w) => qa(w, ".marcador b").map((b) => b.textContent);

async function numeros() {
  const w = await abrir("numeros");
  const valor = () => Number(q(w, ".numero-grande").textContent.replace(/\./g, ""));
  const enviar = (texto) => {
    q(w, "#resp").value = texto;
    q(w, "#f").dispatchEvent(new w.Event("submit", { cancelable: true }));
  };
  const rango = (r) => r < 5 ? [0, 100] : r < 10 ? [100, 999] : r < 15 ? [1000, 99999]
    : r < 20 ? [100000, 999999] : [1000000, 9999999];

  // modo automático: el escalón depende de la racha (5 centenas, 10 miles, 15 cien miles, 20 millones)
  assert(valor() <= 100, "al inicio, hasta 100");
  for (let racha = 1; racha <= 22; racha++) {
    enviar(palabra(valor()));
    assert(q(w, ".resultado.ok"), "debía acertar " + racha);
    const sube = [5, 10, 15, 20].includes(racha);
    assert.strictEqual(q(w, ".resultado").textContent.includes("Subes de nivel"), sube, "aviso en racha " + racha);
    q(w, "#sig").click();
    const [lo, hi] = rango(racha);
    assert(valor() >= lo && valor() <= hi, `racha ${racha}: ${valor()} fuera de ${lo}-${hi}`);
  }
  // un fallo devuelve al escalón inicial, con mensaje amable
  enviar("xxx");
  assert(q(w, ".resultado.ko .palabra .mal"), "debían salir letras en rojo");
  assert(q(w, ".resultado.ko").textContent.includes("Volvemos un escalón"));
  assert.strictEqual(marcador(w)[2], "0 ♥");
  q(w, "#sig").click();
  assert(valor() <= 100, "tras fallar, vuelve a hasta 100");

  // nivel manual + variante sin teclado alemán: dreißig == dreissig
  const sel = q(w, "#nivel"); sel.value = "1"; sel.dispatchEvent(new w.Event("change"));
  for (let i = 0; i < 400 && valor() !== 30; i++) sel.dispatchEvent(new w.Event("change"));
  if (valor() === 30) {
    enviar("dreissig");
    assert(q(w, ".resultado.ok"), "dreissig debía valer");
  }
  assert.deepStrictEqual(w.document.errores, []);
}

async function verbos() {
  const w = await abrir("verbos");
  // modo 1: completar con el prefijo
  const infin = q(w, ".pista b:last-of-type").textContent;
  const v = w.VERBOS.find((x) => x.infinitivo === infin);
  q(w, "#resp").value = v.prefijo;
  q(w, "#f").dispatchEvent(new w.Event("submit", { cancelable: true }));
  assert(q(w, ".resultado.ok"));
  // modo 2: elegir prefijo
  qa(w, ".seg")[1].click();
  assert.strictEqual(qa(w, ".opcion").length, 4);
  const inf2 = q(w, ".numero-grande").childNodes[0].textContent;
  const v2 = w.VERBOS.find((x) => x.infinitivo === inf2);
  qa(w, ".opcion").find((b) => b.dataset.p === v2.prefijo).click();
  assert(q(w, ".resultado.ok"));
  q(w, "#sig").click();
  const mala = qa(w, ".opcion")[0];
  const v3 = w.VERBOS.find((x) => x.infinitivo === q(w, ".numero-grande").childNodes[0].textContent);
  (qa(w, ".opcion").find((b) => b.dataset.p !== v3.prefijo) || mala).click();
  assert(q(w, ".resultado.ko"));
  assert.deepStrictEqual(w.document.errores, []);
}

async function frases() {
  const w = await abrir("frases");
  const es = q(w, ".tarjeta .frase-grande").textContent;
  const f = w.FRASES.find((x) => x.es === es);
  const toks = f.de.split(/\s+/);
  for (const t of toks) {
    const b = qa(w, ".chip").find((c) => c.textContent === t);
    assert(b, "ficha " + t);
    b.click();
  }
  assert(!q(w, "#comprobar").disabled);
  q(w, "#comprobar").click();
  assert(q(w, ".resultado.ok"), "orden correcto debía acertar");
  q(w, "#sig").click();
  // orden incorrecto: pulsar fichas tal cual salen (casi seguro mal) y comprobar
  const hijas = qa(w, ".chip");
  hijas.forEach(() => qa(w, ".chip")[0] && qa(w, ".chip")[0].click());
  q(w, "#comprobar").click();
  assert(q(w, ".resultado"), "debía haber resultado");
  assert.deepStrictEqual(w.document.errores, []);
}

async function mayusculas() {
  const w = await abrir("mayusculas");
  assert(!w.document.errores.length, w.document.errores.join());
  const es = q(w, ".tarjeta .frase-grande").textContent;
  const f = w.FRASES.find((x) => x.es === es);
  const toks = f.de.split(/\s+/);
  // fácil: la palabra en minúscula que debería ser mayúscula
  const chips = qa(w, ".chip");
  const j = toks.findIndex((t, i) => i > 0 && t[0] !== t[0].toLowerCase() && chips[i].textContent !== t);
  assert(j > 0, "debía haber una palabra sin mayúscula");
  chips[j].click();
  q(w, "#comprobar").click();
  assert(q(w, ".resultado.ok"), "fácil: debía acertar");
  // avanzado: marcar todas las que llevan mayúscula
  q(w, "#sig").click();
  qa(w, ".seg")[1].click();
  const f2 = w.FRASES.find((x) => x.es === q(w, ".tarjeta .frase-grande").textContent);
  f2.de.split(/\s+/).forEach((t, i) => { if (t[0] !== t[0].toLowerCase()) qa(w, ".chip")[i].click(); });
  q(w, "#comprobar").click();
  assert(q(w, ".resultado.ok"), "avanzado: debía acertar");
  assert.deepStrictEqual(w.document.errores, []);
}

// ---- juegos de las semanas 4 y 5 (Perfekt, hora, vocabulario)
const escribir = (w, texto) => {
  q(w, "#resp").value = texto;
  q(w, "#f").dispatchEvent(new w.Event("submit", { cancelable: true }));
};

async function auxiliar() {
  const w = await abrir("auxiliar");
  assert(!w.document.errores.length, w.document.errores.join());
  for (let i = 0; i < 6; i++) {          // salen tanto verbos con sein como con haben
    const inf = q(w, ".numero-grande").childNodes[0].textContent;
    const v = w.PERFEKT.find((x) => x.inf === inf);
    qa(w, ".opcion").find((b) => b.dataset.o === v.aux).click();
    assert(q(w, ".resultado.ok"), "auxiliar correcto: " + inf);
    q(w, "#sig").click();
  }
  const v = w.PERFEKT.find((x) => x.inf === q(w, ".numero-grande").childNodes[0].textContent);
  qa(w, ".opcion").find((b) => b.dataset.o !== v.aux).click();
  assert(q(w, ".resultado.ko"), "auxiliar incorrecto");
  assert(q(w, ".resultado").textContent.includes(v.part), "debe enseñar el Partizip II");
  assert.deepStrictEqual(w.document.errores, []);
}

async function perfekt() {
  const w = await abrir("perfekt");
  assert(!w.document.errores.length, w.document.errores.join());
  const { AUX } = w.PerfektDe;
  // modo 1: infinitivo + pronombre → auxiliar + Partizip II
  const [etq, inf] = q(w, ".numero-grande").textContent.split(" · ");
  const v = w.PERFEKT.find((x) => x.inf === inf);
  const pron = etq.split(" ")[0];
  escribir(w, `${AUX[v.aux][pron]} ${v.part}`);
  assert(q(w, ".resultado.ok"), `perfekt ${pron} ${inf}`);
  q(w, "#sig").click();
  escribir(w, "xxx");
  assert(q(w, ".resultado.ko"));
  q(w, "#sig").click();
  // modo 2: completar una frase del temario
  qa(w, ".seg")[1].click();
  const hueco = q(w, ".tarjeta .frase-grande").textContent;
  const f = w.PERFEKT_FRASES.find((x) => x.de.split(" ")[0] === hueco.split(" ")[0] &&
    x.de.split(" ").length === hueco.split(" ").length && x.de.includes(hueco.split(" ")[2]));
  assert(f, "frase del hueco: " + hueco);
  escribir(w, `${f.aux} ${f.part}`);
  assert(q(w, ".resultado.ok"), "completar frase");
  assert.deepStrictEqual(w.document.errores, []);
}

async function hora() {
  const w = await abrir("hora");
  assert(!w.document.errores.length, w.document.errores.join());
  for (const modo of [0, 1]) {
    qa(w, ".seg")[modo].click();
    for (let i = 0; i < 5; i++) {
      const [h, m] = q(w, ".numero-grande").textContent.split(":").map(Number);
      const ok = modo === 0 ? w.HoraDe.formal(h, m) : w.HoraDe.coloquial(h, m);
      escribir(w, ok[i % ok.length] + (i % 2 ? "." : ""));
      assert(q(w, ".resultado.ok"), `hora ${h}:${m} modo ${modo}`);
      q(w, "#sig").click();
    }
  }
  escribir(w, "keine ahnung");
  assert(q(w, ".resultado.ko"));
  assert.deepStrictEqual(w.document.errores, []);
}

async function vocabulario() {
  const w = await abrir("vocabulario");
  assert(!w.document.errores.length, w.document.errores.join());
  const nombre = () => q(w, ".numero-grande").childNodes[0].textContent;
  for (let i = 0; i < 3; i++) {
    const n = w.VOCAB.find((x) => x.sing === nombre());
    qa(w, ".opcion").find((b) => b.dataset.o === n.art).click();
    assert(q(w, ".resultado.ok"), "artículo " + n.sing);
    q(w, "#sig").click();
  }
  const n0 = w.VOCAB.find((x) => x.sing === nombre());
  qa(w, ".opcion").find((b) => b.dataset.o !== n0.art).click();
  assert(q(w, ".resultado.ko"));
  q(w, "#sig").click();
  qa(w, ".seg")[1].click();
  for (let i = 0; i < 3; i++) {
    const art = q(w, ".numero-grande").childNodes[0].textContent.split(" ");
    const n = w.VOCAB.find((x) => x.sing === art.slice(1).join(" "));
    assert(n.plural, "solo salen sustantivos con plural");
    escribir(w, i % 2 ? `die ${n.plural}` : n.plural);
    assert(q(w, ".resultado.ok"), "plural " + n.sing);
    q(w, "#sig").click();
  }
  assert.deepStrictEqual(w.document.errores, []);
}

async function conjugar() {
  const w = await abrir("conjugar");
  assert(!w.document.errores.length, w.document.errores.join());
  const { MODALES, PRAETERITUM } = w.ModalesDe;
  for (const [modo, tabla] of [[0, MODALES], [1, PRAETERITUM]]) {
    qa(w, ".seg")[modo].click();
    for (let i = 0; i < 4; i++) {
      const [etq, verbo] = q(w, ".numero-grande").textContent.split(" · ");
      const pron = etq.split(" ")[0];
      const forma = tabla[verbo][pron];
      escribir(w, i % 2 ? `${pron} ${forma}` : forma);
      assert(q(w, ".resultado.ok"), `${pron} ${verbo}`);
      q(w, "#sig").click();
    }
  }
  escribir(w, "xxx");
  assert(q(w, ".resultado.ko"));
  assert.deepStrictEqual(w.document.errores, []);
}

async function modales() {
  const w = await abrir("modales");
  assert(!w.document.errores.length, w.document.errores.join());
  const { MODALES, USO } = w.ModalesDe;
  for (let i = 0; i < 4; i++) {
    const hueco = q(w, ".tarjeta .frase-grande").textContent;
    const f = w.MODALES_FRASES.find((x) => x.de.split(" ")[0] === hueco.split(" ")[0] && x.de.split(" ").slice(2).join(" ") === hueco.split(" ").slice(2).join(" "));
    assert(f, "frase: " + hueco);
    assert.strictEqual(qa(w, ".opcion").length, 4);
    qa(w, ".opcion").find((b) => b.dataset.o === MODALES[f.modal][f.pron]).click();
    assert(q(w, ".resultado.ok"));
    q(w, "#sig").click();
  }
  const f2 = w.MODALES_FRASES.find((x) => x.de.split(" ").slice(2).join(" ") === q(w, ".tarjeta .frase-grande").textContent.split(" ").slice(2).join(" "));
  qa(w, ".opcion").find((b) => b.dataset.o !== MODALES[f2.modal][f2.pron]).click();
  assert(q(w, ".resultado.ko"));
  q(w, "#sig").click();
  qa(w, ".seg")[1].click();
  for (let i = 0; i < 4; i++) {
    const uso = q(w, ".numero-grande").textContent;
    const modal = Object.keys(USO).find((m) => USO[m] === uso);
    qa(w, ".opcion").find((b) => b.dataset.o === modal).click();
    assert(q(w, ".resultado.ok"));
    q(w, "#sig").click();
  }
  assert.deepStrictEqual(w.document.errores, []);
}

async function aduso() {
  const w = await abrir("aduso");
  assert(!w.document.errores.length, w.document.errores.join());
  const A = w.AdusoDe;
  // todos los tipos: el verbo en la posición que dice la regla (1 o 2) y 3 opciones distintas
  for (const tipo of A.ORDEN_TIPOS) {
    const c = A.construir(tipo, A.BASES[0], A.TIEMPO[0], A.LUGAR[0], A.PREGUNTAS[0]);
    assert.strictEqual(new Set(A.opciones(c)).size, 3, "3 opciones distintas: " + tipo);
    assert(A.opciones(c).includes(A.correcta(c)));
    const pal = A.correcta(c).replace(/[.?!]$/, "").toLowerCase().split(" ");
    assert.strictEqual(pal.indexOf(c.verbo.toLowerCase()) + 1, c.tipo === "ja_nein" || c.tipo === "imperativo" ? 1 : 2, tipo);
  }
  assert.strictEqual(A.correcta(A.construir("tiempo", A.BASES[0], A.TIEMPO[0], A.LUGAR[0], A.PREGUNTAS[0])), "Heute lerne ich Deutsch.");
  assert.strictEqual(A.correcta(A.construir("ja_nein", A.BASES[0], A.TIEMPO[0], A.LUGAR[0], A.PREGUNTAS[0])), "Lernst du heute Deutsch?");
  // en el juego: acertar en los dos modos, y fallar (frases correctas posibles de todos los casos)
  const buenas = new Set();
  for (const tipo of A.ORDEN_TIPOS) for (const b of A.BASES) for (const te of A.TIEMPO) for (const lo of A.LUGAR) for (const pr of A.PREGUNTAS)
    buenas.add(A.correcta(A.construir(tipo, b, te, lo, pr)));
  for (const modo of [0, 1]) {
    qa(w, ".seg")[modo].click();
    for (let i = 0; i < 8; i++) {
      const correcta = modo === 0 ? qa(w, ".opcion").map((b) => b.dataset.o).find((o) => buenas.has(o)) : null;
      if (modo === 0) { assert(correcta, "hay opción correcta"); qa(w, ".opcion").find((b) => b.dataset.o === correcta).click(); }
      else {
        const nombre = q(w, ".tarjeta .etiqueta").textContent.split(":")[0];
        const t = Object.values(A.TIPOS).find((x) => x.nombre === nombre);
        qa(w, ".opcion").find((b) => b.dataset.o === "Posición " + t.pos).click();
      }
      assert(q(w, ".resultado.ok"), "aduso modo " + modo);
      q(w, "#sig").click();
    }
  }
  qa(w, ".opcion")[0].click();
  assert(q(w, ".resultado"), "hay resultado");
  assert.deepStrictEqual(w.document.errores, []);
}
async function tekamolo() {
  const w = await abrir("tekamolo");
  assert(!w.document.errores.length, w.document.errores.join());
  const T = w.TekamoloDe;
  assert.strictEqual(T.palabra(["KA", "TE", "MO", "LO"]), "KATEMOLO");
  assert(T.evaluar(["TE", "KA", "MO", "LO"]).ok && !T.evaluar(["MO", "LO", "KA", "TE"]).ok);
  const f = () => T.FRASES.find((x) => x.es === q(w, ".tarjeta .frase-grande").textContent);
  const pulsar = (tipos) => { const fr = f(); for (const t of tipos) qa(w, ".chip").find((c) => c.textContent === fr[t.toLowerCase()]).click(); };
  pulsar(["TE", "KA", "MO", "LO"]);
  q(w, "#comprobar").click();
  assert(q(w, ".resultado.ok"), "TEKAMOLO debía acertar");
  assert(q(w, ".tekamolo-grande").textContent.includes("TEKAMOLO!!!!!!"));
  q(w, "#sig").click();
  pulsar(["KA", "TE", "MO", "LO"]);
  q(w, "#comprobar").click();
  assert(q(w, ".resultado.ko"), "KATEMOLO debía fallar");
  assert.strictEqual(q(w, ".tekamolo-grande").textContent, "KATEMOLO");
  assert(q(w, ".resultado").textContent.includes("Da fehlt noch etwas"));
  q(w, "#sig").click();
  pulsar(["MO", "LO", "KA", "TE"]);
  q(w, "#comprobar").click();
  assert.strictEqual(q(w, ".tekamolo-grande").textContent, "MOLOKATE");
  assert.deepStrictEqual(w.document.errores, []);
}

async function frecuencia() {
  const w = await abrir("frecuencia");
  assert(!w.document.errores.length, w.document.errores.join());
  const F = w.FrecuenciaDe;
  assert.strictEqual(F.GRUPOS.veces.lista.length + F.GRUPOS.unidades.lista.length + F.GRUPOS.habituales.lista.length, 12);
  assert.strictEqual(F.combinar(F.VECES[2], F.UNIDADES[1]).de, "dreimal pro Woche");
  assert.strictEqual(F.frase(F.ACTIVIDADES[0], F.HABITUALES[0]).principal, "Ich gehe jeden Tag ins Kino.");
  assert.strictEqual(F.frase(F.ACTIVIDADES[1], F.VECES[1]).pregunta, "Wie oft trainierst du?");
  const todos = [...F.VECES, ...F.UNIDADES, ...F.HABITUALES];
  // modo 1: expresión suelta (de los tres grupos)
  for (let i = 0; i < 10; i++) {
    const x = todos.find((t) => t.es === q(w, ".numero-grande").textContent);
    escribir(w, x.de);
    assert(q(w, ".resultado.ok"), "expresión " + x.de);
    q(w, "#sig").click();
  }
  // modo 2: número de veces + unidad
  qa(w, ".seg")[1].click();
  for (let i = 0; i < 6; i++) {
    const es = q(w, ".numero-grande").textContent;
    const c = F.combinarTodas().find((t) => t.es === es);
    escribir(w, c.de);
    assert(q(w, ".resultado.ok"), "combina " + c.de);
    q(w, "#sig").click();
  }
  // modo 3: respuesta en una frase (las dos variantes valen)
  qa(w, ".seg")[2].click();
  for (let i = 0; i < 6; i++) {
    const pregunta = q(w, ".numero-grande, .frase-grande", ).textContent;
    const pista = q(w, ".pista").textContent.replace("Significado de la respuesta: ", "");
    let hallada = null;
    for (const a of F.ACTIVIDADES) for (const f of [...F.combinarTodas(), ...F.HABITUALES]) {
      const s = F.frase(a, f);
      if (s.es === pista && s.pregunta === pregunta) hallada = s;
    }
    assert(hallada, "frase de la pregunta: " + pregunta + " / " + pista);
    escribir(w, i % 2 ? hallada.alternativa : hallada.principal);
    assert(q(w, ".resultado.ok"), "frase " + hallada.principal);
    q(w, "#sig").click();
  }
  escribir(w, "keine ahnung");
  assert(q(w, ".resultado.ko"));
  assert.deepStrictEqual(w.document.errores, []);
}

async function seinhaben() {
  const w = await abrir("seinhaben");
  assert(!w.document.errores.length, w.document.errores.join());
  const S = w.SeinHabenDe;
  for (const f of S.FRASES) assert(S.analizar(f.pron, f.forma), f.de);
  const por = () => S.FRASES.find((f) => q(w, ".pista b").textContent === f.es || q(w, ".pista").textContent.includes(f.es));
  for (let i = 0; i < 12; i++) {                  // completar: salen formas de sein/haben, presente y Präteritum
    const f = por();
    assert(f, "frase del hueco");
    const ini = f.de.toLowerCase().startsWith(f.forma);
    const forma = ini ? f.forma[0].toUpperCase() + f.forma.slice(1) : f.forma;
    qa(w, ".opcion").find((b) => b.dataset.o === forma).click();
    assert(q(w, ".resultado.ok"), "hueco " + f.de);
    q(w, "#sig").click();
  }
  const f2 = por();
  const mala = qa(w, ".opcion").find((b) => b.dataset.o.toLowerCase() !== f2.forma);
  mala.click();
  assert(q(w, ".resultado.ko"));
  assert(q(w, ".resultado").textContent.includes(f2.de), "muestra la frase completa");
  q(w, "#sig").click();
  qa(w, ".seg")[1].click();                       // escribir la frase entera
  for (let i = 0; i < 6; i++) {
    const f = S.FRASES.find((x) => x.es === q(w, ".tarjeta .frase-grande").textContent);
    escribir(w, f.de + (i % 2 ? "" : ""));
    assert(q(w, ".resultado.ok"), "frase " + f.de);
    q(w, "#sig").click();
  }
  assert.deepStrictEqual(w.document.errores, []);
}

async function participios() {
  const w = await abrir("participios");
  assert(!w.document.errores.length, w.document.errores.join());
  const P = w.PARTICIPIOS;
  assert.strictEqual(P.verbos.length, 25);
  for (const v of P.verbos) assert(P.grupos.find((g) => g.id === v.grupo), "grupo de " + v.inf);
  const parte = () => P.verbos.find((v) => v.inf === q(w, ".numero-grande").textContent);
  // modo mezclado
  for (let i = 0; i < 8; i++) { escribir(w, parte().part); assert(q(w, ".resultado.ok"), "mezclado"); q(w, "#sig").click(); }
  escribir(w, "xxx");
  assert(q(w, ".resultado.ko") && q(w, ".resultado").textContent.includes("Mismo patrón"));
  q(w, "#sig").click();
  // grupo a grupo: salen los miembros de un grupo seguidos antes de pasar al siguiente
  qa(w, ".seg")[1].click();
  const grupos = [];
  for (let i = 0; i < 25; i++) {
    const v = parte();
    grupos.push(v.grupo);
    escribir(w, v.part);
    assert(q(w, ".resultado.ok"), "grupo a grupo " + v.inf);
    q(w, "#sig").click();
  }
  let cambios = 0;
  for (let i = 1; i < grupos.length; i++) if (grupos[i] !== grupos[i - 1]) cambios++;
  assert(cambios <= 7, "los grupos van seguidos: " + grupos.join());
  // ¿qué grupo?
  qa(w, ".seg")[2].click();
  const v = P.verbos.find((x) => x.inf === q(w, ".numero-grande").textContent.split(" → ")[0]);
  qa(w, ".opcion").find((b) => b.dataset.o === P.grupos.find((g) => g.id === v.grupo).titulo).click();
  assert(q(w, ".resultado.ok"), "qué grupo");
  assert.deepStrictEqual(w.document.errores, []);
}

async function comosedice() {
  const w = await abrir("comosedice");
  assert(!w.document.errores.length, w.document.errores.join());
  const L = w.PALABRAS.lista;
  assert(L.length >= 90);
  for (let i = 0; i < 8; i++) {                      // español → alemán, con y sin artículo
    const p = L.find((x) => x.es === q(w, ".numero-grande").textContent);
    escribir(w, i % 2 ? p.de[p.de.length - 1] : p.de[0].replace(/^(der|die|das) /, ""));
    assert(q(w, ".resultado.ok"), "es→de " + p.de[0]);
    q(w, "#sig").click();
  }
  qa(w, ".seg")[1].click();                          // alemán → español
  for (let i = 0; i < 6; i++) {
    const p = L.find((x) => x.de[0] === q(w, ".numero-grande").textContent);
    assert.strictEqual(qa(w, ".opcion").length, 4);
    qa(w, ".opcion").find((b) => b.dataset.o === p.es).click();
    assert(q(w, ".resultado.ok"), "de→es " + p.de[0]);
    q(w, "#sig").click();
  }
  const mal = L.find((x) => x.de[0] === q(w, ".numero-grande").textContent);
  qa(w, ".opcion").find((b) => b.dataset.o !== mal.es).click();
  assert(q(w, ".resultado.ko"));
  q(w, "#sig").click();
  const F = w.FRASES_REST;
  qa(w, ".seg")[2].click();                          // frases: elegir
  for (let i = 0; i < 5; i++) {
    const f = F.find((x) => x.es === q(w, ".numero-grande, .frase-grande").textContent);
    qa(w, ".opcion").find((b) => b.dataset.o === f.de[0]).click();
    assert(q(w, ".resultado.ok"), "frase " + f.de[0]);
    q(w, "#sig").click();
  }
  qa(w, ".seg")[3].click();                          // frases: escribir
  for (let i = 0; i < 5; i++) {
    const f = F.find((x) => x.es === q(w, ".tarjeta .frase-grande").textContent);
    assert(f.escribir, "solo se piden por escrito las frases completas");
    escribir(w, f.de[f.de.length - 1]);
    assert(q(w, ".resultado.ok"), "escribir " + f.de[0]);
    q(w, "#sig").click();
  }
  assert.deepStrictEqual(w.document.errores, []);
}

async function modalinf() {
  const w = await abrir("modalinf");
  assert(!w.document.errores.length, w.document.errores.join());
  const A = w.ModalInfDe;
  const it = { obj: "Deutsch", inf: "sprechen", es: "hablar alemán" };
  assert.strictEqual(A.correcta(A.construir("frase", "können", "ich", it)), "Ich kann Deutsch sprechen.");
  assert.strictEqual(A.correcta(A.construir("frase", "müssen", "er", it)), "Er muss Deutsch sprechen.");
  assert.strictEqual(A.correcta(A.construir("pregunta", "können", "du", it)), "Kannst du Deutsch sprechen?");
  assert.strictEqual(A.construir("frase", "möchten", "er", it).es, "Él querría hablar alemán.");
  for (const t of ["frase", "pregunta"]) assert(A.opciones(A.construir(t, "können", "wir", it)).length >= 3);
  const buenas = new Set();
  for (const m of A.USADOS) for (const p of A.PRON_FRASE) for (const x of w.MODALINF) buenas.add(A.correcta(A.construir("frase", m, p, x)));
  for (const m of A.USADOS) for (const p of A.PRON_PREGUNTA) for (const x of w.MODALINF) buenas.add(A.correcta(A.construir("pregunta", m, p, x)));
  for (const modo of [0, 2]) {
    qa(w, ".seg")[modo].click();
    for (let i = 0; i < 6; i++) {
      const o = qa(w, ".opcion").map((b) => b.dataset.o).find((x) => buenas.has(x));
      assert(o, "opción correcta");
      qa(w, ".opcion").find((b) => b.dataset.o === o).click();
      assert(q(w, ".resultado.ok"), "elegir modo " + modo);
      q(w, "#sig").click();
    }
  }
  qa(w, ".seg")[1].click();                          // escribir la frase
  const porEs = new Map();
  for (const m of A.USADOS) for (const p of A.PRON_FRASE) for (const x of w.MODALINF) {
    const c = A.construir("frase", m, p, x); porEs.set(c.es, A.correcta(c));
  }
  for (let i = 0; i < 6; i++) {
    const de = porEs.get(q(w, ".tarjeta .frase-grande").textContent);
    assert(de, "frase en español");
    escribir(w, de);
    assert(q(w, ".resultado.ok"), "escribir " + de);
    q(w, "#sig").click();
  }
  assert.deepStrictEqual(w.document.errores, []);
}

async function sesion() {
  // con el registro activo: cerrar sesión borra el nombre (conserva el marcador) y vuelve a pedir el nombre
  const w = await abrir("", "https://registro.invalido.test/exec");
  await new Promise((r) => setTimeout(r, 100));
  q(w, "#reg-nombre").value = "Ana";
  q(w, ".capa form").dispatchEvent(new w.Event("submit", { cancelable: true }));
  await new Promise((r) => setTimeout(r, 100));
  w.U.registrar("numeros", true);
  assert.strictEqual(w.U.marcadorDe("numeros").a, 1);
  assert(q(w, "#recargar") && q(w, "#cerrar-sesion"), "botones de sesión en el inicio");
  w.confirm = () => true;
  q(w, "#cerrar-sesion").click();
  await new Promise((r) => setTimeout(r, 150));
  assert(q(w, "#reg-nombre"), "tras cerrar sesión se vuelve a pedir el nombre");
  assert.strictEqual(w.Registro.nombre(), "", "nombre olvidado");
  assert.strictEqual(w.U.marcadorDe("numeros").a, 1, "el marcador se conserva");
  q(w, "#reg-nombre").value = "Beto";
  q(w, ".capa form").dispatchEvent(new w.Event("submit", { cancelable: true }));
  await new Promise((r) => setTimeout(r, 150));
  assert(q(w, "#app").textContent.includes("Entras como Beto"));
}

(async () => {
  for (const [nombre, fn] of Object.entries({ numeros, verbos, frases, mayusculas, auxiliar, perfekt, hora, vocabulario, conjugar, modales, aduso, tekamolo, frecuencia, seinhaben, participios, comosedice, modalinf, sesion })) {
    await fn();
    console.log("OK", nombre);
  }
  process.exit(0);
})().catch((e) => { console.error("FALLO", e); process.exit(1); });
