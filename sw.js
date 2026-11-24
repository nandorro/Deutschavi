// Primero la red (así cada actualización llega sola); sin conexión, la copia guardada.
const CACHE = "deutschavi-v7";
const ARCHIVOS = [
  "./", "index.html", "css/estilo.css", "manifest.webmanifest",
  "js/config.js", "js/util.js", "js/registro.js", "js/numeros_de.js", "js/numeros.js", "js/verbos.js",
  "js/frases.js", "js/mayusculas.js", "js/perfekt_de.js", "js/hora_de.js", "js/motor.js", "js/auxiliar.js",
  "js/perfekt.js", "js/hora.js", "js/vocabulario.js", "js/modales_de.js", "js/conjugar.js", "js/modales.js", "js/aduso_de.js", "js/tekamolo_de.js", "js/aduso.js", "js/tekamolo.js", "js/frecuencia_de.js", "js/seinhaben_de.js", "js/frecuencia.js", "js/seinhaben.js", "js/modalinf_de.js", "js/participios.js", "js/comosedice.js", "js/modalinf.js", "js/app.js",
  "datos/frases.js", "datos/verbos_separables.js", "datos/perfekt.js", "datos/perfekt_frases.js", "datos/vocabulario.js", "datos/modales.js", "datos/participios.js", "datos/palabras.js", "datos/frases_restaurante.js", "datos/modalinf.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copia = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return r;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
