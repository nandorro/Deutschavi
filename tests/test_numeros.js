// Comprueba el generador contra los ejemplos literales del temario.
// Ejecutar:  node tests/test_numeros.js
const assert = require("assert");
const { palabra, formasValidas, conPuntos } = require("../js/numeros_de.js");

const DEL_TEMARIO = {
  0: "null", 1: "eins", 12: "zwölf", 16: "sechzehn", 17: "siebzehn",
  20: "zwanzig", 21: "einundzwanzig", 30: "dreißig", 32: "zweiunddreißig",
  45: "fünfundvierzig", 60: "sechzig", 67: "siebenundsechzig", 70: "siebzig",
  88: "achtundachtzig", 99: "neunundneunzig",
  100: "einhundert", 700: "siebenhundert", 145: "einhundertfünfundvierzig",
  1000: "eintausend", 1452: "eintausendvierhundertzweiundfünfzig",
  3819: "dreitausendachthundertneunzehn",
  25403: "fünfundzwanzigtausendvierhundertdrei",
  2358: "zweitausenddreihundertachtundfünfzig",
  10502: "zehntausendfünfhundertzwei",
  100000: "einhunderttausend",
  1000000: "eine Million", 2000000: "zwei Millionen",
  4500000: "vier Millionen fünfhunderttausend",
};
for (const [n, esperado] of Object.entries(DEL_TEMARIO)) {
  assert.strictEqual(palabra(Number(n)), esperado, `n=${n}`);
}
assert(formasValidas(100).includes("hundert") && formasValidas(100).includes("einhundert"));
assert(formasValidas(1000).includes("tausend"));
assert(formasValidas(101).includes("hunderteins"));
assert.strictEqual(palabra(101), "einhunderteins");
assert.strictEqual(palabra(1001), "eintausendeins");
assert.strictEqual(palabra(21000), "einundzwanzigtausend");
assert.strictEqual(palabra(101000), "einhunderteintausend");
assert.strictEqual(conPuntos(25403), "25.403");
assert.strictEqual(conPuntos(1000000), "1.000.000");
assert.strictEqual(conPuntos(7), "7");
for (let n = 0; n < 1000000; n++) {
  const w = palabra(n);
  assert(w && w === w.toLowerCase(), `n=${n} ${w}`);
}
console.log("OK: generador de números conforme al temario");
