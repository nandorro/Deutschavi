// Aduso: ¿dónde va el verbo, en la posición 1 o en la 2? Casos: sujeto primero, adverbio de tiempo o de
// lugar primero, pregunta de sí/no, pregunta con palabra W e imperativo. Lógica pura, probada con node.
(function (root) {
  // Los tokens van como aparecen a mitad de frase (minúscula salvo sustantivos); al abrir la frase se pone la mayúscula.
  const BASES = [
    { ich: "lerne", du: "lernst", imp: "lerne", obj: "Deutsch", yo: "aprendo alemán", tu: "aprendes alemán", ord: "aprende alemán" },
    { ich: "trinke", du: "trinkst", imp: "trink", obj: "Kaffee", yo: "bebo café", tu: "bebes café", ord: "bebe café" },
    { ich: "esse", du: "isst", imp: "iss", obj: "Obst", yo: "como fruta", tu: "comes fruta", ord: "come fruta" },
    { ich: "spiele", du: "spielst", imp: "spiel", obj: "Fußball", yo: "juego al fútbol", tu: "juegas al fútbol", ord: "juega al fútbol" },
    { ich: "kaufe", du: "kaufst", imp: "kauf", obj: "Brot", yo: "compro pan", tu: "compras pan", ord: "compra pan" },
    { ich: "koche", du: "kochst", imp: "koch", obj: "Suppe", yo: "cocino sopa", tu: "cocinas sopa", ord: "cocina sopa" },
    { ich: "lese", du: "liest", imp: "lies", obj: "ein Buch", yo: "leo un libro", tu: "lees un libro", ord: "lee un libro" },
  ];
  const TIEMPO = [
    { de: "heute", es: "hoy" }, { de: "morgen", es: "mañana" }, { de: "jetzt", es: "ahora" },
    { de: "immer", es: "siempre" }, { de: "jeden Tag", es: "cada día" }, { de: "am Montag", es: "el lunes" },
  ];
  const LUGAR = [{ de: "hier", es: "aquí" }, { de: "dort", es: "allí" }, { de: "zu Hause", es: "en casa" }];
  const PREGUNTAS = [{ de: "wann", es: "cuándo" }, { de: "wo", es: "dónde" }];

  const TIPOS = {
    sujeto: { nombre: "Frase afirmativa (sujeto primero)", pos: 2,
      regla: "El verbo conjugado va siempre en la posición 2: sujeto (1) · verbo (2)." },
    tiempo: { nombre: "Adverbio de tiempo al inicio", pos: 2,
      regla: "El adverbio ocupa la posición 1; el verbo sigue en la 2 y el sujeto pasa a la 3 (Heute lerne ich…)." },
    lugar: { nombre: "Adverbio de lugar al inicio", pos: 2,
      regla: "El adverbio ocupa la posición 1; el verbo sigue en la 2 y el sujeto pasa a la 3 (Hier lerne ich…)." },
    ja_nein: { nombre: "Pregunta de sí / no", pos: 1,
      regla: "Sin palabra interrogativa, el verbo abre la frase: posición 1." },
    w: { nombre: "Pregunta con palabra W", pos: 2,
      regla: "La palabra interrogativa va en la posición 1 y el verbo en la 2." },
    imperativo: { nombre: "Orden (imperativo)", pos: 1, regla: "El verbo abre la frase: posición 1." },
  };
  const ORDEN_TIPOS = Object.keys(TIPOS);

  const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Un caso concreto: partes (sin el verbo, en orden), verbo, pos (1 o 2), signo y traducción
  function construir(tipo, base, te, lo, w) {
    const T = TIPOS[tipo];
    let partes, verbo, signo = ".", es;
    if (tipo === "sujeto") { partes = ["ich", te.de, base.obj]; verbo = base.ich; es = `Yo ${base.yo} ${te.es}.`; }
    else if (tipo === "tiempo") { partes = [te.de, "ich", base.obj]; verbo = base.ich; es = `${mayus(te.es)} ${base.yo}.`; }
    else if (tipo === "lugar") { partes = [lo.de, "ich", base.obj]; verbo = base.ich; es = `${mayus(lo.es)} ${base.yo}.`; }
    else if (tipo === "ja_nein") { partes = ["du", te.de, base.obj]; verbo = base.du; signo = "?"; es = `¿${mayus(base.tu)} ${te.es}?`; }
    else if (tipo === "w") { partes = [w.de, "du", base.obj]; verbo = base.du; signo = "?"; es = `¿${mayus(w.es)} ${base.tu}?`; }
    else { partes = [te.de, base.obj]; verbo = base.imp; signo = "!"; es = `¡${mayus(base.ord)} ${te.es}!`; }
    return { tipo, nombre: T.nombre, regla: T.regla, partes, verbo, pos: T.pos, signo, es };
  }

  // La frase con el verbo en el hueco idx (0 = primera posición)
  function frase(c, idx) {
    const t = c.partes.slice();
    t.splice(idx, 0, c.verbo);
    return mayus(t.join(" ")) + c.signo;
  }
  const correcta = (c) => frase(c, c.pos - 1);

  // Tres frases iguales salvo la posición del verbo (1.ª, 2.ª y 3.ª posición)
  const opciones = (c) => [0, 1, 2].map((i) => frase(c, i));

  function azar(pick, tipo) {
    return construir(tipo || pick(ORDEN_TIPOS), pick(BASES), pick(TIEMPO), pick(LUGAR), pick(PREGUNTAS));
  }

  const api = { BASES, TIEMPO, LUGAR, PREGUNTAS, TIPOS, ORDEN_TIPOS, construir, frase, correcta, opciones, azar, mayus };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AdusoDe = api;
})(typeof window !== "undefined" ? window : globalThis);
