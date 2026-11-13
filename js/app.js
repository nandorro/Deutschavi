// Navegación (por #/ruta), pantalla de inicio y cabecera común.
const ECG = '<svg viewBox="0 0 400 26" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="#fff" ' +
  'stroke-width="2" stroke-linejoin="round" points="0,13 90,13 100,13 108,4 116,22 124,13 170,13 180,13 188,2 198,24 ' +
  '208,13 300,13 310,13 318,6 326,20 334,13 400,13"/></svg>';

// Cabecera de cada juego (con enlace para volver al inicio)
function cabecera(titulo, subtitulo) {
  return `<a class="volver" href="#/">← Inicio</a>
    <header class="cabecera"><h1><span class="cruz">✚</span>${U.esc(titulo)}</h1><p>${U.esc(subtitulo)}</p>${ECG}</header>`;
}

const JUEGOS = [
  { id: "numeros", titulo: "Números", icono: "🔢", texto: "Te aparece una cifra y la escribes en alemán. Si fallas, verás en rojo las letras que se te escaparon." },
  { id: "verbos", titulo: "Verbos separables", icono: "🧩", texto: "Completa la frase con el prefijo que se va al final (aufstehen → ich stehe … auf)." },
  { id: "frases", titulo: "Frases desordenadas", icono: "🧵", texto: "Ordena las palabras para formar la frase correcta (¡y recuerda dónde va el verbo!)." },
  { id: "mayusculas", titulo: "¿Qué mayúscula falta?", icono: "🔠", texto: "En alemán todos los sustantivos llevan mayúscula. ¿Sabes cuáles?" },
];

function inicio(el) {
  el.innerHTML = `<header class="cabecera"><h1><span class="cruz">✚</span>Deutschavi</h1>
      <p>Alemán A1 para estudiantes de Medicina</p>${ECG}</header>
    <h2>Guten Tag! Wie geht es dir?</h2>
    <p>Bienvenido/a a tu consulta de alemán. Aquí practicarás con calma lo que ya has visto en clase:
       cada ejercicio sale del temario, sin sorpresas. Equivocarse forma parte del tratamiento. ¡Ánimo!</p>
    <div class="aviso-info">🩺 Contenido desbloqueado: <b>semana ${SEMANA_ACTUAL}</b>.
       Cada semana se añade material nuevo a medida que avanzáis.</div>` +
    JUEGOS.map((j) => `<a class="juego" href="#/${j.id}">
        <span class="icono">${j.icono}</span>
        <span><b>${U.esc(j.titulo)}</b><br><span class="texto">${U.esc(j.texto)}</span></span>
        <span class="flecha">›</span></a>`).join("") +
    `<p class="nota centro">Bis bald! — ¡Hasta pronto!</p>`;
}

function navegar() {
  const main = document.getElementById("app");
  const id = (location.hash || "#/").replace(/^#\/?/, "");
  const juego = JUEGOS.find((j) => j.id === id);
  if (juego) Juegos[juego.id].iniciar(main); else inicio(main);
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", navegar);
navegar();

// Instalable en la pantalla de inicio y utilizable sin conexión
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => { /* sin SW: sigue funcionando */ });
}
