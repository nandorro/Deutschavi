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

  servidor.close();
  process.exit(0);
})().catch((e) => { console.error("FALLO", e); process.exit(1); });
