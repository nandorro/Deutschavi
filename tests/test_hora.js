// La hora en alemán contra los ejemplos literales del Tema 3.
// Ejecutar:  node tests/test_hora.js
const assert = require("assert");
const H = require("../js/hora_de.js");

assert.strictEqual(H.formal(14, 30)[0], "Es ist vierzehn Uhr dreißig");
assert.strictEqual(H.formal(9, 15)[0], "Es ist neun Uhr fünfzehn");
assert.strictEqual(H.formal(20, 45)[0], "Es ist zwanzig Uhr fünfundvierzig");
assert(H.formal(14, 30).includes("vierzehn Uhr dreißig"), "también vale sin «Es ist»");
assert(H.coloquial(8, 0).includes("Es ist acht") && H.coloquial(8, 0).includes("Es ist acht Uhr"));
assert.strictEqual(H.coloquial(8, 15)[0], "Es ist Viertel nach acht");
assert.strictEqual(H.coloquial(8, 30)[0], "Es ist halb neun");
assert.strictEqual(H.coloquial(8, 45)[0], "Es ist Viertel vor neun");
assert.strictEqual(H.coloquial(8, 5)[0], "Es ist fünf nach acht");
assert.strictEqual(H.coloquial(8, 50)[0], "Es ist zehn vor neun");
assert.strictEqual(H.coloquial(11, 30)[0], "Es ist halb zwölf");
assert.strictEqual(H.texto(8, 5), "08:05");
// todas las horas que se preguntan se pueden generar
for (const h of H.HORAS_FORMAL) for (const m of H.MIN_FORMAL) assert(H.formal(h, m).length === 2);
for (const h of H.HORAS_COLOQUIAL) for (const m of H.MIN_COLOQUIAL) assert(H.coloquial(h, m).length >= 2);
console.log("OK test_hora");
