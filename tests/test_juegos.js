// Prueba de humo de los 4 juegos simulando toques/clics en un DOM simulado.
// Requiere jsdom (solo para probar, no para la web):  npm i jsdom
// Ejecutar:  node tests/test_juegos.js
const assert = require("assert");
const path = require("path");
const { JSDOM } = require("jsdom");
const { palabra } = require("../js/numeros_de.js");

const RAIZ = path.join(__dirname, "..");

async function abrir(ruta) {
  const dom = await JSDOM.fromFile(path.join(RAIZ, "index.html"), {
    runScripts: "dangerously", resources: "usable", pretendToBeVisual: true,
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

(async () => {
  for (const [nombre, fn] of Object.entries({ numeros, verbos, frases, mayusculas })) {
    await fn();
    console.log("OK", nombre);
  }
  process.exit(0);
})().catch((e) => { console.error("FALLO", e); process.exit(1); });
