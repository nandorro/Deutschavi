// TeKaMoLo: Temporal · Kausal · Modal · Lokal. Frases completas con los cuatro bloques para ordenar.
(function (root) {
  const ORDEN = ["TE", "KA", "MO", "LO"];
  const NOMBRE = { TE: "Temporal (cuándo)", KA: "Kausal (por qué)", MO: "Modal (cómo)", LO: "Lokal (dónde)" };
  // sv = sujeto + verbo (posición 1 y 2, ya colocados); después, los cuatro bloques
  const FRASES = [
    { sv: "Ich fahre", te: "morgen", ka: "wegen der Arbeit", mo: "mit dem Bus", lo: "nach Berlin",
      es: "Mañana voy a Berlín en autobús por el trabajo." },
    { sv: "Wir gehen", te: "heute", ka: "wegen der Prüfung", mo: "zu Fuß", lo: "zur Universität",
      es: "Hoy vamos a la universidad a pie por el examen." },
    { sv: "Maria fährt", te: "am Montag", ka: "wegen der Kälte", mo: "mit dem Auto", lo: "in die Stadt",
      es: "El lunes María va a la ciudad en coche por el frío." },
    { sv: "Er kommt", te: "heute", ka: "wegen der Arbeit", mo: "mit dem Zug", lo: "nach Hause",
      es: "Hoy vuelve a casa en tren por el trabajo." },
    { sv: "Ich fahre", te: "am Wochenende", ka: "wegen der Hitze", mo: "mit dem Fahrrad", lo: "zum See",
      es: "El fin de semana voy al lago en bici por el calor." },
    { sv: "Sie geht", te: "jeden Tag", ka: "wegen der Gesundheit", mo: "zu Fuß", lo: "in den Park",
      es: "Cada día va al parque a pie por la salud." },
    { sv: "Wir fahren", te: "im Winter", ka: "wegen der Kinder", mo: "mit dem Zug", lo: "in die Berge",
      es: "En invierno vamos a la montaña en tren por los niños." },
    { sv: "Ich gehe", te: "heute Abend", ka: "wegen der Kopfschmerzen", mo: "langsam", lo: "nach Hause",
      es: "Esta noche voy a casa despacio por el dolor de cabeza." },
    { sv: "Er läuft", te: "heute", ka: "wegen der Prüfung", mo: "schnell", lo: "zur Schule",
      es: "Hoy corre rápido a la escuela por el examen." },
    { sv: "Ich fahre", te: "heute", ka: "wegen der Schmerzen", mo: "mit dem Taxi", lo: "ins Krankenhaus",
      es: "Hoy voy al hospital en taxi por el dolor." },
    { sv: "Der Patient fährt", te: "morgen", ka: "wegen der Untersuchung", mo: "mit dem Bus", lo: "ins Krankenhaus",
      es: "Mañana el paciente va al hospital en autobús por la revisión." },
  ];

  // Los cuatro bloques de una frase, como objetos { tipo, texto }
  const bloques = (f) => ORDEN.map((t) => ({ tipo: t, texto: f[t.toLowerCase()] }));
  const frase = (f) => `${f.sv} ${ORDEN.map((t) => f[t.toLowerCase()]).join(" ")}.`;

  // Palabra que se forma con las sílabas en el orden elegido: TEKAMOLO, KATEMOLO, MOLOKATE…
  const palabra = (tipos) => tipos.join("");
  const evaluar = (tipos) => ({ ok: palabra(tipos) === ORDEN.join(""), palabra: palabra(tipos) });

  const api = { ORDEN, NOMBRE, FRASES, bloques, frase, palabra, evaluar };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TekamoloDe = api;
})(typeof window !== "undefined" ? window : globalThis);
