"""Números alemanes escritos en palabras, según las reglas del temario (Temas 1 y 2).

- 0-12: formas propias; 13-19: unidad + zehn (sechzehn, siebzehn).
- Decenas: -zig (dreißig, sechzig, siebzig).
- 21-99: unidad + und + decena, todo junto (einundzwanzig).
- Centenas y miles: se escriben pegados (zweihundert, dreitausend...).
- Un millón: "eine Million" / "zwei Millionen", separado del resto.
"""

UNIDADES = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben",
            "acht", "neun", "zehn", "elf", "zwölf"]
ADOLESCENTES = {13: "dreizehn", 14: "vierzehn", 15: "fünfzehn", 16: "sechzehn",
                17: "siebzehn", 18: "achtzehn", 19: "neunzehn"}
DECENAS = {2: "zwanzig", 3: "dreißig", 4: "vierzig", 5: "fünfzig",
           6: "sechzig", 7: "siebzig", 8: "achtzig", 9: "neunzig"}


def _menor_100(n: int, final: bool) -> str:
    """0-99. Si no es el final del número, 'eins' pierde la -s: 'ein'."""
    if n <= 12:
        return "ein" if (n == 1 and not final) else UNIDADES[n]
    if n <= 19:
        return ADOLESCENTES[n]
    d, u = divmod(n, 10)
    if u == 0:
        return DECENAS[d]
    return ("ein" if u == 1 else UNIDADES[u]) + "und" + DECENAS[d]


def _menor_1000(n: int, final: bool) -> str:
    c, r = divmod(n, 100)
    if c == 0:
        return _menor_100(r, final)
    cientos = ("ein" if c == 1 else UNIDADES[c]) + "hundert"
    return cientos + (_menor_100(r, final) if r else "")


def _menor_1_millon(n: int) -> str:
    miles, r = divmod(n, 1000)
    if miles == 0:
        return _menor_1000(r, True)
    texto = _menor_1000(miles, False) + "tausend"
    return texto + (_menor_1000(r, True) if r else "")


def palabra(n: int) -> str:
    """Forma canónica (la que se muestra como solución)."""
    if not 0 <= n <= 9_999_999:
        raise ValueError("Fuera de rango")
    millones, r = divmod(n, 1_000_000)
    if millones == 0:
        return _menor_1_millon(n)
    cabeza = "eine Million" if millones == 1 else f"{_menor_100(millones, False)} Millionen"
    return cabeza + (" " + _menor_1_millon(r) if r else "")


def formas_validas(n: int) -> list[str]:
    """Todas las escrituras correctas. El temario escribe '(ein)hundert' y
    '(ein)tausend': el 'ein' inicial es opcional."""
    canonica = palabra(n)
    formas = [canonica]
    for inicio in ("einhundert", "eintausend"):
        if canonica.startswith(inicio):
            formas.append(canonica[len("ein"):])
    return formas


def con_puntos(n: int) -> str:
    """25403 -> '25.403' (como en el temario)."""
    return f"{n:,}".replace(",", ".")
