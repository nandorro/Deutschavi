// Tema 3 · verbo modal en la posición 2 e infinitivo al final (frases y preguntas). Lógica pura, probada con node.
(function (root) {
  const M = typeof module !== "undefined" && module.exports ? require("./modales_de.js") : root.ModalesDe;
  const USADOS = ["können", "müssen", "möchten"];
  const ES = {
    "können": { ich: "puedo", du: "puedes", er: "puede", wir: "podemos" },
    "müssen": { ich: "tengo que", du: "tienes que", er: "tiene que", wir: "tenemos que" },
    "möchten": { ich: "querría", du: "querrías", er: "querría", wir: "querríamos" },
  };
  const PRON_FRASE = ["ich", "du", "er", "wir"], PRON_PREGUNTA = ["du", "wir"];
  const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const texto = (partes, signo) => mayus(partes.join(" ")) + signo;

  // item = { obj, inf, es }. tipo: "frase" (modal 2.º) o "pregunta" (modal 1.º)
  function construir(tipo, modal, pron, item) {
    const forma = M.MODALES[modal][pron], obj = item.obj.split(" ");
    const es = ES[modal][pron] + " " + item.es;
    if (tipo === "frase") {
      const sujEs = pron === "er" ? "Él " : "";
      return { tipo, modal, pron, forma, inf: item.inf, obj, signo: ".", es: mayus(sujEs + es) + ".",
        partes: [pron, forma, ...obj, item.inf],
        malas: [[pron, forma, item.inf, ...obj], [pron, item.inf, forma, ...obj], [pron, ...obj, item.inf, forma]] };
    }
    return { tipo, modal, pron, forma, inf: item.inf, obj, signo: "?", es: "¿" + mayus(es) + "?",
      partes: [forma, pron, ...obj, item.inf],
      malas: [[pron, forma, ...obj, item.inf], [forma, pron, item.inf, ...obj], [forma, ...obj, pron, item.inf]] };
  }
  const correcta = (c) => texto(c.partes, c.signo);
  // La correcta y tres frases con las palabras mal colocadas (sin repetidas)
  const opciones = (c) => [...new Set([correcta(c), ...c.malas.map((m) => texto(m, c.signo))])];

  function azar(pick, items, tipo) {
    const modal = pick(USADOS), pron = pick(tipo === "frase" ? PRON_FRASE : PRON_PREGUNTA);
    return construir(tipo, modal, pron, pick(items));
  }

  const api = { USADOS, ES, PRON_FRASE, PRON_PREGUNTA, construir, correcta, opciones, azar, mayus };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ModalInfDe = api;
})(typeof window !== "undefined" ? window : globalThis);
