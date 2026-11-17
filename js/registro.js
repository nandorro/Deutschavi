// Registro de accesos: pide el nombre, avisa a la hoja de Google y muestra el botón «?»
// con el registro (protegido por PIN). Se activa al poner REGISTRO_URL en config.js.
(function (root) {
  const { esc } = U;
  const CLAVE_NOMBRE = "deutschavi_nombre_v1";
  const CLAVE_COLA = "deutschavi_cola_v1";
  const CLAVE_PIN = "deutschavi_pin_v1";

  const url = () => root.REGISTRO_URL || "";
  const activo = () => !!url();
  const nombre = () => U.almacen.leer(CLAVE_NOMBRE, "");

  // El PIN solo se recuerda mientras la pestaña esté abierta
  const memPin = {};
  const pinGuardado = () => { try { return sessionStorage.getItem(CLAVE_PIN) || memPin.v || ""; } catch (e) { return memPin.v || ""; } };
  const guardarPin = (p) => { memPin.v = p; try { sessionStorage.setItem(CLAVE_PIN, p); } catch (e) { /* ok */ } };

  function dispositivo() {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPod/.test(ua)) return "iPhone";
    if (/iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "iPad";
    if (/Android/.test(ua)) return /Mobile/.test(ua) ? "Android móvil" : "Android tablet";
    return "Ordenador";
  }

  // ---------- envío (con cola por si no hay conexión)
  let vaciando = false;
  async function vaciarCola() {
    if (vaciando || !activo() || typeof fetch !== "function") return;
    vaciando = true;
    try {
      let cola = U.almacen.leer(CLAVE_COLA, []);
      while (cola.length) {
        await fetch(url(), {
          method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(cola[0]),
        });
        cola = U.almacen.leer(CLAVE_COLA, []).slice(1);
        U.almacen.guardar(CLAVE_COLA, cola);
      }
    } catch (e) { /* sin red: se reintenta en el próximo evento */ }
    vaciando = false;
  }

  function evento(tipo, detalle) {
    if (!activo() || !nombre()) return Promise.resolve();
    const cola = U.almacen.leer(CLAVE_COLA, []).slice(-50);
    cola.push({ nombre: nombre(), dispositivo: dispositivo(), agente: navigator.userAgent || "",
      evento: tipo, detalle: detalle || "" });
    U.almacen.guardar(CLAVE_COLA, cola);
    return vaciarCola();
  }

  // ---------- pantalla del nombre
  function pedirNombre() {
    return new Promise((resolver) => {
      const capa = document.createElement("div");
      capa.className = "capa";
      capa.innerHTML = `<form class="modal" autocomplete="off">
        <div class="cruz-grande">✚</div>
        <h2>¡Bienvenido/a!</h2>
        <p>Escribe tu nombre o apodo para entrar.</p>
        <label for="reg-nombre">Tu nombre</label>
        <input id="reg-nombre" type="text" maxlength="40" enterkeyhint="done" autocapitalize="words"
               autocorrect="off" spellcheck="false" autocomplete="off" value="${esc(nombre())}">
        <p class="nota">Tu profesor verá cuándo accedes a la aplicación y a qué juegos (fecha, hora y dispositivo).</p>
        <p id="reg-aviso" class="aviso" hidden>Escribe al menos 2 letras para continuar.</p>
        <button class="btn primario" type="submit">Entrar ✚</button></form>`;
      document.body.appendChild(capa);
      const input = capa.querySelector("#reg-nombre");
      capa.querySelector("form").onsubmit = (e) => {
        e.preventDefault();
        const n = input.value.trim().replace(/\s+/g, " ");
        if (n.length < 2) { capa.querySelector("#reg-aviso").hidden = false; return; }
        U.almacen.guardar(CLAVE_NOMBRE, n);
        capa.remove();
        resolver(n);
      };
      input.focus();
    });
  }

  // ---------- botón «?» y panel del registro
  function botonRegistro() {
    if (document.getElementById("btn-registro")) return;
    const b = document.createElement("button");
    b.id = "btn-registro"; b.type = "button"; b.textContent = "?";
    b.title = "Registro de accesos"; b.setAttribute("aria-label", "Registro de accesos");
    b.onclick = abrirPanel;
    document.body.appendChild(b);
  }

  async function leer(pin) {
    const r = await fetch(url(), {
      method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ accion: "leer", pin }),
    });
    return r.json();
  }

  function tabla(d) {
    if (!d.filas.length) return `<p>Todavía no hay accesos registrados.</p>`;
    const nombres = new Set(d.filas.map((f) => f[2].toLowerCase()));
    return `<p class="resumen"><b>${d.total}</b> registros · <b>${nombres.size}</b> alumnos distintos
        <span class="nota">(sobre los últimos ${d.filas.length})</span></p>
      <div class="tabla-caja"><table class="tabla"><thead><tr><th>Fecha</th><th>Hora</th><th>Nombre</th>
        <th>Dispositivo</th><th>Evento</th><th>Detalle</th></tr></thead><tbody>
        ${d.filas.map((f) => `<tr><td>${esc(f[0])}</td><td>${esc(f[1])}</td><td>${esc(f[2])}</td>
          <td>${esc(f[3])}</td><td>${esc(f[5])}</td><td>${esc(f[6])}</td></tr>`).join("")}
        </tbody></table></div>`;
  }

  // ---------- qué falta a cada alumno
  // titulo = lo que se anota al abrir el juego; nombre = prefijo del evento «progreso»
  const APARTADOS = [
    { titulo: "Números", nombre: "Números", semana: 1 },
    { titulo: "Verbos separables", nombre: "Verbos separables", semana: 1 },
    { titulo: "Frases desordenadas", nombre: "Frases desordenadas", semana: 1 },
    { titulo: "¿Qué mayúscula falta?", nombre: "¿Qué mayúscula falta?", semana: 1 },
    { titulo: "¿Sein o haben?", nombre: "¿Sein o haben?", semana: 4 },
    { titulo: "El Perfekt en una frase", nombre: "Perfekt en la frase", semana: 4 },
    { titulo: "La hora", nombre: "La hora", semana: 4 },
    { titulo: "Conjuga el verbo", nombre: "Conjuga el verbo", semana: 4 },
    { titulo: "El verbo modal en la frase", nombre: "Verbo modal en la frase", semana: 4 },
    { titulo: "Vocabulario: artículo y plural", nombre: "Vocabulario", semana: 5 },
    { titulo: "Aduso", nombre: "Aduso", semana: 5 },
    { titulo: "TeKaMoLo", nombre: "TeKaMoLo", semana: 5 },
  ];

  // Para cada alumno y apartado: "hecho" (con aciertos/intentos), "abierto" (sin 5 intentos aún) o "falta"
  function resumenAlumnos(filas, semana) {
    const apartados = APARTADOS.filter((a) => a.semana <= (semana || 99));
    const alumnos = new Map();
    for (const f of filas) {
      const clave = String(f[2]).trim().toLowerCase();
      if (!clave) continue;
      if (!alumnos.has(clave)) alumnos.set(clave, { nombre: String(f[2]).trim(), abiertos: new Set(), prog: {} });
      const al = alumnos.get(clave);
      const ev = f[5], det = String(f[6] || "");
      if (ev === "juego") al.abiertos.add(det);
      if (ev === "progreso") {
        const m = det.match(/^(.*): (\d+)\/(\d+) aciertos/);
        if (!m) continue;
        const ap = apartados.find((a) => a.nombre === m[1]);
        if (!ap) continue;
        const i = +m[3];
        if (!al.prog[ap.titulo] || i >= al.prog[ap.titulo].i) al.prog[ap.titulo] = { a: +m[2], i };
      }
    }
    return [...alumnos.values()].sort((x, y) => x.nombre.localeCompare(y.nombre, "es")).map((al) => {
      const estados = apartados.map((ap) => {
        const p = al.prog[ap.titulo];
        if (p) return { titulo: ap.titulo, estado: "hecho", a: p.a, i: p.i };
        if (al.abiertos.has(ap.titulo)) return { titulo: ap.titulo, estado: "abierto" };
        return { titulo: ap.titulo, estado: "falta" };
      });
      return { nombre: al.nombre, estados, faltan: estados.filter((e) => e.estado !== "hecho").length };
    });
  }

  function faltaHtml(d) {
    const res = resumenAlumnos(d.filas, root.SEMANA_ACTUAL);
    if (!res.length) return `<p>Todavía no hay alumnos registrados.</p>`;
    return `<p class="nota">✅ practicado (aciertos/intentos) · 👀 abierto, menos de 5 intentos · ❌ sin abrir.
        Solo cuentan los últimos ${d.filas.length} registros.</p>` + res.map((al) => `
      <div class="alumno-falta"><p><b>${esc(al.nombre)}</b> — ${al.estados.length - al.faltan}/${al.estados.length} apartados
        ${al.faltan ? `· faltan ${al.faltan}` : "· ¡todo hecho! 🎉"}</p><ul class="lista-falta">
        ${al.estados.map((e) => `<li>${e.estado === "hecho" ? `✅ ${esc(e.titulo)} <span class="nota">${e.a}/${e.i}</span>`
          : e.estado === "abierto" ? `👀 ${esc(e.titulo)}` : `❌ ${esc(e.titulo)}`}</li>`).join("")}</ul></div>`).join("");
  }

  function abrirPanel() {
    if (document.getElementById("panel-registro")) return;
    const capa = document.createElement("div");
    capa.className = "capa"; capa.id = "panel-registro";
    capa.innerHTML = `<div class="modal ancho" role="dialog" aria-label="Registro de accesos">
      <h2>Registro de accesos</h2><div id="reg-cuerpo"></div>
      <button class="btn" id="reg-cerrar" type="button">Cerrar</button></div>`;
    document.body.appendChild(capa);
    const cuerpo = capa.querySelector("#reg-cuerpo");
    const cerrar = () => capa.remove();
    capa.querySelector("#reg-cerrar").onclick = cerrar;
    capa.onclick = (e) => { if (e.target === capa) cerrar(); };

    if (!activo()) {
      cuerpo.innerHTML = `<p>El registro todavía no está conectado a la hoja de Google.</p>
        <p class="nota">Instrucciones en <b>registro/LEEME.md</b> del repositorio.</p>`;
      return;
    }
    const pedirPin = (error) => {
      cuerpo.innerHTML = `<form id="reg-form" autocomplete="off"><label for="reg-pin">PIN del profesor</label>
        <input id="reg-pin" type="password" autocomplete="off" autocapitalize="off" enterkeyhint="done">
        ${error ? `<p class="aviso">${esc(error)}</p>` : ""}
        <button class="btn primario" type="submit">Ver registro</button></form>`;
      const f = cuerpo.querySelector("#reg-form"), inp = cuerpo.querySelector("#reg-pin");
      f.onsubmit = (e) => { e.preventDefault(); if (inp.value) cargar(inp.value); };
      inp.focus();
    };
    const cargar = async (pin) => {
      cuerpo.innerHTML = `<p>Cargando…</p>`;
      try {
        const d = await leer(pin);
        if (!d.ok) { guardarPin(""); return pedirPin(d.error === "pin" ? "PIN incorrecto." : d.error === "bloqueado" ? "Demasiados intentos. Espera 15 minutos." : "No se pudo leer el registro."); }
        guardarPin(pin);
        const mostrar = (vista) => {
          cuerpo.innerHTML = `<div class="acciones-sesion">
            <button class="btn ${vista === "falta" ? "primario" : ""}" id="reg-falta" type="button">👥 Qué falta a cada alumno</button>
            <button class="btn ${vista === "tabla" ? "primario" : ""}" id="reg-lista" type="button">📋 Accesos</button></div>`
            + (vista === "falta" ? faltaHtml(d) : tabla(d))
            + `<button class="btn" id="reg-refrescar" type="button">↻ Actualizar</button>`;
          cuerpo.querySelector("#reg-falta").onclick = () => mostrar("falta");
          cuerpo.querySelector("#reg-lista").onclick = () => mostrar("tabla");
          cuerpo.querySelector("#reg-refrescar").onclick = () => cargar(pin);
        };
        mostrar("tabla");
      } catch (e) {
        pedirPin("Sin conexión con la hoja de Google. Inténtalo de nuevo.");
      }
    };
    pinGuardado() ? cargar(pinGuardado()) : pedirPin("");
  }

  async function iniciar() {
    botonRegistro();
    if (!activo()) return;
    if (!nombre()) await pedirNombre();
    evento("entrada", "");
  }

  // Cerrar sesión: olvida el nombre y el PIN (el marcador se conserva) y vuelve a pedir el nombre
  async function cerrarSesion() {
    if (activo() && nombre()) evento("salida", "");
    U.almacen.guardar(CLAVE_NOMBRE, "");
    memPin.v = "";
    try { sessionStorage.removeItem(CLAVE_PIN); } catch (e) { /* ok */ }
    if (activo()) { await pedirNombre(); evento("entrada", ""); }
  }

  root.Registro = { iniciar, evento, pedirNombre, activo, nombre, dispositivo, cerrarSesion, resumenAlumnos };
})(window);
