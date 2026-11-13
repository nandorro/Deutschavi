// Primero la red (así cada actualización llega sola); sin conexión, la copia guardada.
const CACHE = "deutschavi-v1";
const ARCHIVOS = [
  "./", "index.html", "css/estilo.css", "manifest.webmanifest",
  "js/config.js", "js/util.js", "js/numeros_de.js", "js/numeros.js", "js/verbos.js",
  "js/frases.js", "js/mayusculas.js", "js/app.js",
  "datos/frases.js", "datos/verbos_separables.js",
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
