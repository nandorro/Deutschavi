"""Comprueba el generador contra los ejemplos literales del temario.
Ejecutar:  python tests/test_numeros.py
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from core.numeros_de import formas_validas, palabra  # noqa: E402

DEL_TEMARIO = {
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
    1_000_000: "eine Million", 2_000_000: "zwei Millionen",
    4_500_000: "vier Millionen fünfhunderttausend",
}

fallos = [(n, palabra(n), esperado) for n, esperado in DEL_TEMARIO.items()
          if palabra(n) != esperado]
for n, obtenido, esperado in fallos:
    print(f"FALLO {n}: {obtenido!r} != {esperado!r}")

assert "hundert" in formas_validas(100) and "einhundert" in formas_validas(100)
assert "tausend" in formas_validas(1000)
assert "hunderteins" in formas_validas(101)
assert palabra(101) == "einhunderteins" and palabra(1001) == "eintausendeins"
assert palabra(21000) == "einundzwanzigtausend"
assert palabra(101000) == "einhunderteintausend"

# todo el rango 0-999.999 se genera sin errores y sin caracteres raros
for n in range(0, 1_000_000):
    w = palabra(n)
    assert w and w.islower(), (n, w)

if fallos:
    sys.exit(1)
print("OK: generador de números conforme al temario")
