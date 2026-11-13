// Números alemanes escritos en palabras, según las reglas del temario (Temas 1 y 2).
//  - 0-12: formas propias; 13-19: unidad + zehn (sechzehn, siebzehn).
//  - Decenas: -zig (dreißig, sechzig, siebzig).
//  - 21-99: unidad + und + decena, todo junto (einundzwanzig).
//  - Centenas y miles: pegados (zweihundert, dreitausend...).
//  - Un millón: "eine Million" / "zwei Millionen", separado del resto.
(function (root) {
  const UNIDADES = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben",
    "acht", "neun", "zehn", "elf", "zwölf"];
  const ADOLESCENTES = { 13: "dreizehn", 14: "vierzehn", 15: "fünfzehn", 16: "sechzehn",
    17: "siebzehn", 18: "achtzehn", 19: "neunzehn" };
  const DECENAS = { 2: "zwanzig", 3: "dreißig", 4: "vierzig", 5: "fünfzig",
    6: "sechzig", 7: "siebzig", 8: "achtzig", 9: "neunzig" };

  // 0-99. Si no es el final del número, "eins" pierde la -s: "ein".
  function menor100(n, final) {
    if (n <= 12) return (n === 1 && !final) ? "ein" : UNIDADES[n];
    if (n <= 19) return ADOLESCENTES[n];
    const d = Math.floor(n / 10), u = n % 10;
    if (u === 0) return DECENAS[d];
    return (u === 1 ? "ein" : UNIDADES[u]) + "und" + DECENAS[d];
  }

  function menor1000(n, final) {
    const c = Math.floor(n / 100), r = n % 100;
    if (c === 0) return menor100(r, final);
    const cientos = (c === 1 ? "ein" : UNIDADES[c]) + "hundert";
    return cientos + (r ? menor100(r, final) : "");
  }

  function menorMillon(n) {
    const miles = Math.floor(n / 1000), r = n % 1000;
    if (miles === 0) return menor1000(r, true);
    return menor1000(miles, false) + "tausend" + (r ? menor1000(r, true) : "");
  }

  // Forma canónica (la que se muestra como solución).
  function palabra(n) {
    if (!Number.isInteger(n) || n < 0 || n > 9999999) throw new RangeError("Fuera de rango");
    const millones = Math.floor(n / 1000000), r = n % 1000000;
    if (millones === 0) return menorMillon(n);
    const cabeza = millones === 1 ? "eine Million" : menor100(millones, false) + " Millionen";
    return cabeza + (r ? " " + menorMillon(r) : "");
  }

  // Todas las escrituras correctas. El temario escribe "(ein)hundert" y
  // "(ein)tausend": el "ein" inicial es opcional.
  function formasValidas(n) {
    const canonica = palabra(n);
    const formas = [canonica];
    for (const inicio of ["einhundert", "eintausend"]) {
      if (canonica.startsWith(inicio)) formas.push(canonica.slice(3));
    }
    return formas;
  }

  // 25403 -> "25.403" (como en el temario)
  function conPuntos(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const api = { palabra, formasValidas, conPuntos };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NumerosDe = api;
})(typeof window !== "undefined" ? window : globalThis);
