// Prueba del registro de accesos con un servidor falso que imita a la hoja de Google.
// Requiere jsdom (solo para probar):  npm i jsdom
// Ejecutar:  node tests/test_registro.js
const assert = require("assert");
const http = require("http");
const path = require("path");
const { JSDOM } = require("jsdom");

const RAIZ = path.join(__dirname, "..");
const PIN = "4321";
const filas = [];

const servidor = http.createServer((req, res) => {
  let cuerpo = "";
  req.on("data", (c) => (cuerpo += c));
  req.on("end", () => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    const d = JSON.parse(cuerpo || "{}");
    if (d.accion === "leer") {
      if (d.pin !== PIN) return res.end(JSON.stringify({ ok: false, error: "pin" }));
      return res.end(JSON.stringify({ ok: true, total: filas.length, filas: filas.slice().reverse() }));
    }
    filas.push(["2026-11-17", "10:00:00", d.nombre, d.dispositivo, d.agente, d.evento, d.detalle]);
    res.end(JSON.stringify({ ok: true }));
  });
});

const esperar = async (cond, ms = 3000) => {
  const t = Date.now();
  while (!cond()) {
    if (Date.now() - t > ms) throw new Error("tiempo agotado esperando: " + cond);
    await new Promise((r) => setTimeout(r, 20));
  }
};

async function abrir(urlRegistro) {
  const dom = await JSDOM.fromFile(path.join(RAIZ, "index.html"), {
    runScripts: "dangerously", resources: "usable", pretendToBeVisual: true,
    url: "file:///" + RAIZ.replace(/\\/g, "/") + "/index.html#/",
    beforeParse(w) {
      w.fetch = fetch;
      Object.defineProperty(w, "REGISTRO_URL", { get: () => urlRegistro, set() {} });
    },
  });
  const w = dom.window;
  await new Promise((r) => w.addEventListener("load", r));
  return w;
}
const q = (w, s) => w.document.querySelector(s);

(async () => {
  await new Promise((r) => servidor.listen(0, "127.0.0.1", r));
  const URL_ = `http://127.0.0.1:${servidor.address().port}/exec`;

  // ---- sin configurar: no se pide nombre, el «?» avisa de que falta conectarlo
  const sin = await abrir("");
  await esperar(() => q(sin, "#app .cabecera"));
  assert(!q(sin, ".capa"), "sin URL no debe pedir nombre");
  q(sin, "#btn-registro").click();
  assert(q(sin, "#panel-registro").textContent.includes("todavía no está conectado"));
  console.log("OK sin configurar");

  // ---- configurado
  const w = await abrir(URL_);
  await esperar(() => q(w, ".capa form"));
  assert(!q(w, "#app .cabecera"), "hasta dar el nombre no se muestra la app");
  q(w, "#reg-nombre").value = "A";
  q(w, ".capa form").dispatchEvent(new w.Event("submit", { cancelable: true }));
  assert(!q(w, "#reg-aviso").hidden, "con 1 letra debe avisar");
  q(w, "#reg-nombre").value = "  Ana   López ";
  q(w, ".capa form").dispatchEvent(new w.Event("submit", { cancelable: true }));
  await esperar(() => q(w, "#app .cabecera"));
  await esperar(() => filas.length >= 1);
  assert.strictEqual(filas[0][2], "Ana López", "nombre limpio");
  assert.strictEqual(filas[0][5], "entrada");
  assert.strictEqual(filas[0][3], "Ordenador");
  assert(q(w, "#app").textContent.includes("Entras como Ana López"));
  console.log("OK nombre + entrada");

  // ---- abrir un juego queda registrado
  w.location.hash = "#/numeros";
  await esperar(() => filas.some((f) => f[5] === "juego" && f[6] === "Números"));
  console.log("OK juego registrado");

  // ---- el progreso se anota cada 5 intentos
  for (let i = 0; i < 4; i++) w.U.registrar("numeros", i !== 2);  // 4 intentos: aún nada
  await new Promise((r) => setTimeout(r, 200));
  assert(!filas.some((f) => f[5] === "progreso"), "con 4 intentos no se anota progreso");
  w.U.registrar("numeros", true);                                  // 5.º intento
  await esperar(() => filas.some((f) => f[5] === "progreso"));
  const prog = filas.find((f) => f[5] === "progreso");
  assert.strictEqual(prog[6], "Números: 4/5 aciertos · racha 2", prog[6]);
  console.log("OK progreso");

  // ---- el «?» pide PIN; con PIN malo no deja ver; con el bueno muestra la tabla
  q(w, "#btn-registro").click();
  q(w, "#reg-pin").value = "0000";
  q(w, "#reg-form").dispatchEvent(new w.Event("submit", { cancelable: true }));
  await esperar(() => q(w, "#panel-registro").textContent.includes("PIN incorrecto"));
  assert(!q(w, ".tabla"), "no debe enseñar la tabla con PIN malo");
  q(w, "#reg-pin").value = PIN;
  q(w, "#reg-form").dispatchEvent(new w.Event("submit", { cancelable: true }));
  await esperar(() => q(w, ".tabla"));
  const texto = q(w, "#panel-registro").textContent;
  assert(texto.includes("Ana López") && texto.includes("Números") && texto.includes("entrada"));
  assert(texto.includes("1 alumnos distintos") || texto.includes("1alumnos distintos"), texto);
  console.log("OK panel con PIN");

  // ---- el nombre no puede inyectar HTML en el panel
  filas.push(["2026-11-17", "10:01:00", "<img src=x onerror=alert(1)>", "iPhone", "", "entrada", ""]);
  q(w, "#reg-refrescar").click();
  await esperar(() => q(w, ".tabla") && q(w, "#panel-registro").textContent.includes("<img src=x"));
  assert(!q(w, "#panel-registro img"), "el HTML debe ir escapado");
  console.log("OK escapado");

  // ---- «Qué falta a cada alumno»
  const F = (n, ev, det) => ["2026-11-17", "10:00:00", n, "iPhone", "", ev, det];
  const res = w.Registro.resumenAlumnos([
    F("Ana", "juego", "Números"), F("Ana", "progreso", "Números: 3/5 aciertos · racha 1"),
    F("Ana", "progreso", "Números: 8/10 aciertos · racha 2"), F("Ana", "juego", "La hora"),
    F("Ana", "progreso", "Perfekt en la frase: 2/5 aciertos · racha 0"),
  ], 4);
  const ana = res[0];
  assert.strictEqual(ana.estados.length, 13, "semana 4: 11 apartados (sin Vocabulario, Aduso ni TeKaMoLo)");
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ana.estados[0])), { titulo: "Números", estado: "hecho", a: 8, i: 10 });
  assert.strictEqual(ana.estados.find((e) => e.titulo === "La hora").estado, "abierto");
  assert.strictEqual(ana.estados.find((e) => e.titulo === "El Perfekt en una frase").estado, "hecho");
  assert.strictEqual(ana.estados.find((e) => e.titulo === "Verbos separables").estado, "falta");
  assert.strictEqual(ana.faltan, 11);
  q(w, "#reg-falta").click();
  await esperar(() => q(w, ".alumno-falta"));
  assert(q(w, "#panel-registro").textContent.includes("faltan"), "el panel muestra lo que falta");
  console.log("OK qué falta");

  servidor.close();
  process.exit(0);
})().catch((e) => { console.error("FALLO", e); process.exit(1); });
